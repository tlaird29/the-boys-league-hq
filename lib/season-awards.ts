import {
  LEAGUE_START_YEAR,
  findManagerById,
} from "./league-managers";

import {
  calculateLifetimeRecords,
  type HistoricalGame,
} from "./lifetime-records";

import {
  extractChampionships,
  type CompletedSeason,
} from "./championship-history";

import {
  createPendingSeasonAwards,
  type AwardRecipient,
  type SeasonAward,
  type SeasonAwardId,
} from "./season-award-types";

export type SeasonAwardsInput = {
  season: number;
  games: readonly HistoricalGame[];
  finalSeason: CompletedSeason | null;
  historicalCoverageVerified: boolean;
  regularSeasonEndWeek: number;
  startWeek: number;
  managerNames?: Readonly<Record<string, string>>;
};

type WeeklyPerformance = {
  managerId: string;
  managerName: string;
  teamName: string;
  points: number;
  week: number;
  isPlayoffs: boolean;
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateSeasonAwards(
  input: SeasonAwardsInput
) {
  const {
    season,
    games,
    finalSeason,
    historicalCoverageVerified,
    regularSeasonEndWeek,
    startWeek,
    managerNames = {},
  } = input;

  let awards = createPendingSeasonAwards(
    season,
    finalSeason?.finished === true
  );

  function result(
    verified: boolean,
    issues: string[]
  ) {
    return {
      season,
      verified,
      issues,
      awards,

      automaticAwardsCalculated:
        awards.filter(
          award =>
            award.status === "calculated"
        ).length,

      awardsAwaitingReview:
        awards.filter(
          award =>
            award.status === "awaiting-review"
        ).length,

      readyForPublication: false,
      yahooRequests: 0,
      aiRequests: 0,
      databaseWrites: 0,
      emailsSent: 0,
    };
  }

  function managerName(id: string) {
    return (
      findManagerById(id)?.name ??
      managerNames[id]?.trim() ??
      id
    );
  }

  function setAward(
    id: SeasonAwardId,
    recipients: AwardRecipient[],
    explanation: string
  ) {
    awards = awards.map(award =>
      award.id === id
        ? {
            ...award,
            status: "calculated",
            recipients,
            explanation,
          }
        : award
    );
  }

  if (
    !Number.isInteger(season) ||
    season < LEAGUE_START_YEAR
  ) {
    return result(false, [
      "Invalid season.",
    ]);
  }

  if (!finalSeason?.finished) {
    return result(false, [
      "The season is not officially complete.",
    ]);
  }

  if (
    !historicalCoverageVerified ||
    !finalSeason.standingsVerified
  ) {
    return result(false, [
      "Verified historical coverage and final standings are required.",
    ]);
  }

  try {
    if (finalSeason.season !== season) {
      throw new Error(
        "Final standings belong to a different season."
      );
    }

    if (
      !Number.isInteger(startWeek) ||
      !Number.isInteger(regularSeasonEndWeek) ||
      startWeek < 1 ||
      regularSeasonEndWeek < startWeek ||
      regularSeasonEndWeek + 3 > 18
    ) {
      throw new Error(
        "Invalid official season calendar."
      );
    }

    const seasonGames = games
      .filter(game => game.season === season)
      .sort((a, b) => a.week - b.week);

    if (seasonGames.length === 0) {
      throw new Error(
        "No official season matchups supplied."
      );
    }

    // Reuse existing duplicate and score validation.
    calculateLifetimeRecords(seasonGames);

    const championships =
      extractChampionships([finalSeason]);

    const champion = championships[0];

    if (!champion) {
      throw new Error(
        "Verified champion is missing."
      );
    }

    const standings = finalSeason.standings;

    const participants = new Map(
      standings.map(team => [
        team.managerId,
        team,
      ])
    );

    const teamCount = participants.size;

    if (
      teamCount < 8 ||
      teamCount % 2 !== 0
    ) {
      throw new Error(
        "Invalid number of season participants."
      );
    }

    const finalWeek =
      regularSeasonEndWeek + 3;

    let previousWinners:
      Set<string> | null = null;

    // Validate complete weekly coverage and
    // the eight-team championship bracket.

    for (
      let week = startWeek;
      week <= finalWeek;
      week++
    ) {
      const weeklyGames =
        seasonGames.filter(
          game => game.week === week
        );

      const isPlayoffs =
        week > regularSeasonEndWeek;

      const playoffRound =
        week - regularSeasonEndWeek;

      const expectedGames =
        !isPlayoffs
          ? teamCount / 2
          : playoffRound === 1
            ? 4
            : playoffRound === 2
              ? 2
              : 1;

      if (
        weeklyGames.length !== expectedGames
      ) {
        throw new Error(
          `Week ${week}: expected ${expectedGames} official matchups.`
        );
      }

      const winners = new Set<string>();

      const weeklyParticipants =
        new Set<string>();

      for (const game of weeklyGames) {
        if (
          game.isPlayoffs !== isPlayoffs
        ) {
          throw new Error(
            `Week ${week}: incorrect playoff classification.`
          );
        }

        if (
          game.winnerManagerId === undefined
        ) {
          throw new Error(
            `Week ${week}: missing official result.`
          );
        }

        if (
          game.winnerManagerId === null &&
          (
            isPlayoffs ||
            game.a.points !== game.b.points
          )
        ) {
          throw new Error(
            `Week ${week}: invalid tied result.`
          );
        }

        if (
          !isPlayoffs &&
          game.a.points === game.b.points &&
          game.winnerManagerId !== null
        ) {
          throw new Error(
            `Week ${week}: regular-season tie conflicts with result.`
          );
        }

        for (const team of [game.a, game.b]) {
          if (
            !participants.has(team.managerId) ||
            !team.teamName.trim()
          ) {
            throw new Error(
              `Week ${week}: invalid participant.`
            );
          }

          if (
            weeklyParticipants.has(
              team.managerId
            )
          ) {
            throw new Error(
              `Week ${week}: duplicate participant.`
            );
          }

          weeklyParticipants.add(
            team.managerId
          );

          if (
            isPlayoffs &&
            previousWinners &&
            !previousWinners.has(
              team.managerId
            )
          ) {
            throw new Error(
              `Week ${week}: invalid playoff advancement.`
            );
          }
        }

        if (
          game.winnerManagerId ===
            game.a.managerId &&
          game.a.points < game.b.points
        ) {
          throw new Error(
            "Official winner conflicts with scores."
          );
        }

        if (
          game.winnerManagerId ===
            game.b.managerId &&
          game.b.points < game.a.points
        ) {
          throw new Error(
            "Official winner conflicts with scores."
          );
        }

        if (game.winnerManagerId) {
          winners.add(
            game.winnerManagerId
          );
        }
      }

      if (isPlayoffs) {
        previousWinners = winners;
      }
    }

    if (
      seasonGames.some(
        game =>
          game.week < startWeek ||
          game.week > finalWeek
      )
    ) {
      throw new Error(
        "Unexpected matchup outside the season calendar."
      );
    }

    const championshipGame =
      seasonGames.find(
        game => game.week === finalWeek
      );

    if (
      championshipGame?.winnerManagerId !==
      champion.managerId
    ) {
      throw new Error(
        "Championship result conflicts with final standings."
      );
    }

    const runnerUp =
      standings.find(team => team.rank === 2);

    const finalLoser =
      championshipGame.a.managerId ===
      champion.managerId
        ? championshipGame.b.managerId
        : championshipGame.a.managerId;

    if (
      runnerUp?.managerId !== finalLoser
    ) {
      throw new Error(
        "Runner-up conflicts with championship result."
      );
    }

    const performances:
      WeeklyPerformance[] = [];

    const scoringTotals =
      new Map<string, number>();

    for (const game of seasonGames) {
      for (const team of [game.a, game.b]) {
        performances.push({
          managerId: team.managerId,
          managerName:
            managerName(team.managerId),
          teamName: team.teamName,
          points: round(team.points),
          week: game.week,
          isPlayoffs: game.isPlayoffs,
        });

        scoringTotals.set(
          team.managerId,
          round(
            (
              scoringTotals.get(
                team.managerId
              ) ?? 0
            ) + team.points
          )
        );
      }
    }

    const scoringLeaders =
      [...scoringTotals.entries()]
        .sort((a, b) => b[1] - a[1]);

    const highestTotal =
      scoringLeaders[0][1];

    const highestWeeklyScore =
      Math.max(
        ...performances.map(
          row => row.points
        )
      );

    const lowestWeeklyScore =
      Math.min(
        ...performances.map(
          row => row.points
        )
      );

    function weeklyRecipient(
      row: WeeklyPerformance
    ): AwardRecipient {
      return {
        managerId: row.managerId,
        managerName: row.managerName,
        teamName: row.teamName,
        value: row.points,
        unit: "points",
        week: row.week,
        evidence:
          `Week ${row.week}, ` +
          (
            row.isPlayoffs
              ? "championship playoffs"
              : "regular season"
          ) +
          `: ${row.points.toFixed(2)} points.`,
      };
    }

    setAward(
      "champion",
      [{
        managerId: champion.managerId,
        managerName:
          managerName(champion.managerId),
        teamName: champion.teamName,
        value: 1,
        unit: "final rank",
        evidence:
          "Verified championship winner and first-place finish.",
      }],
      "Official championship result."
    );

    setAward(
      "highest-scoring-team",
      scoringLeaders
        .filter(
          ([, points]) =>
            points === highestTotal
        )
        .map(([managerId, points]) => ({
          managerId,
          managerName:
            managerName(managerId),
          teamName:
            participants.get(managerId)!
              .teamName,
          value: points,
          unit: "points",
          evidence:
            `${points.toFixed(2)} total official season points.`,
        })),
      "Combined regular-season and championship-playoff scoring. Consolation games excluded."
    );

    setAward(
      "performance-of-year",
      performances
        .filter(
          row =>
            row.points === highestWeeklyScore
        )
        .map(weeklyRecipient),
      "Highest single-week official team score."
    );

    setAward(
      "worst-weekly-score",
      performances
        .filter(
          row =>
            row.points === lowestWeeklyScore
        )
        .map(weeklyRecipient),
      "Lowest single-week official team score."
    );

    const lastPlace =
      standings.find(
        team => team.rank === teamCount
      );

    if (!lastPlace) {
      throw new Error(
        "Official last-place finisher is missing."
      );
    }

    setAward(
      "last-place",
      [{
        managerId: lastPlace.managerId,
        managerName:
          managerName(lastPlace.managerId),
        teamName: lastPlace.teamName,
        value: lastPlace.rank,
        unit: "final rank",
        evidence:
          `Official final placement: ${lastPlace.rank} of ${teamCount}.`,
      }],
      "Official final placement, not inferred from scoring totals."
    );

    awards = awards.map(
      (award): SeasonAward =>
        award.method === "review"
          ? {
              ...award,
              status: "awaiting-review",
              explanation:
                "Requires supporting evidence and commissioner selection.",
            }
          : award
    );

    return result(true, []);
  } catch (error) {
    awards = createPendingSeasonAwards(
      season,
      true
    );

    return result(false, [
      error instanceof Error
        ? error.message
        : "Season award calculation failed.",
    ]);
  }
}