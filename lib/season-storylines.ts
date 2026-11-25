import {
  buildSeasonProgression,
  type SeasonProgressionInput,
} from "./season-progression";

import type {
  HistoricalGame,
} from "./lifetime-records";

export type StorylineType =
  | "championship"
  | "comeback"
  | "dominance"
  | "collapse"
  | "winning-streak"
  | "losing-streak"
  | "scoring-explosion"
  | "blowout"
  | "nail-biter"
  | "playoff-upset";

export type Storyline = {
  id: string;
  type: StorylineType;
  managerIds: string[];
  weeks: number[];
  headline: string;
  evidence: string;
  importance: number;
};

export type SeasonStorylineInput =
  SeasonProgressionInput & {
    fictional: true;
  };

function score(value: number) {
  return value.toFixed(2);
}

export function detectSeasonStorylines(
  input: SeasonStorylineInput
) {
  const storylines: Storyline[] = [];

  function failure(issues: string[]) {
    return {
      verified: false,
      issues,
      storylines: [],
      progression: [],
      fictional: true,
      readyForPublication: false,
    };
  }

  if (input.fictional !== true) {
    return failure([
      "Only fictional demonstration inputs are enabled.",
    ]);
  }

  const progression =
    buildSeasonProgression(input);

  if (!progression.verified) {
    return failure(progression.issues);
  }

  const games = input.games.filter(
    game => game.season === input.season
  );

  const snapshots =
    progression.snapshots;

  const finalStandings =
    snapshots[snapshots.length - 1];

  const managerIds =
    new Set(input.managerIds);

  const playoffParticipants =
    new Set<string>();

  let previousWinners:
    Set<string> | null = null;

  let championship:
    HistoricalGame | undefined;

  for (let round = 1; round <= 3; round++) {
    const week =
      input.regularSeasonEndWeek + round;

    const roundGames = games.filter(
      game => game.week === week
    );

    const expectedGames =
      round === 1 ? 4 : round === 2 ? 2 : 1;

    if (
      roundGames.length !== expectedGames
    ) {
      return failure([
        `Incomplete playoff round ${round}.`,
      ]);
    }

    const seen = new Set<string>();
    const winners = new Set<string>();

    for (const game of roundGames) {
      const winner = game.winnerManagerId;

      if (
        !game.isPlayoffs ||
        !winner ||
        (
          winner !== game.a.managerId &&
          winner !== game.b.managerId
        ) ||
        !Number.isFinite(game.a.points) ||
        !Number.isFinite(game.b.points) ||
        (
          winner === game.a.managerId &&
          game.a.points < game.b.points
        ) ||
        (
          winner === game.b.managerId &&
          game.b.points < game.a.points
        )
      ) {
        return failure([
          "Invalid official playoff result.",
        ]);
      }

      for (const team of [game.a, game.b]) {
        if (
          !managerIds.has(team.managerId) ||
          seen.has(team.managerId) ||
          (
            previousWinners &&
            !previousWinners.has(
              team.managerId
            )
          )
        ) {
          return failure([
            "Invalid playoff participant or advancement.",
          ]);
        }

        seen.add(team.managerId);

        if (round === 1) {
          playoffParticipants.add(
            team.managerId
          );
        }
      }

      winners.add(winner);

      if (round === 3) {
        championship = game;
      }
    }

    previousWinners = winners;
  }

  const championId =
    championship?.winnerManagerId;

  if (!championship || !championId) {
    return failure([
      "Championship result missing.",
    ]);
  }

  function add(story: Storyline) {
    storylines.push(story);
  }

  const championTeam =
    championship.a.managerId === championId
      ? championship.a
      : championship.b;

  const runnerUp =
    championship.a.managerId === championId
      ? championship.b
      : championship.a;

  add({
    id: "championship",
    type: "championship",
    managerIds: [
      championId,
      runnerUp.managerId,
    ],
    weeks: [championship.week],
    headline: "Raise the Banner",
    evidence:
      `${championTeam.teamName} defeated ` +
      `${runnerUp.teamName} ` +
      `${score(championTeam.points)} to ` +
      `${score(runnerUp.points)} in the final.`,
    importance: 100,
  });

  for (const final of finalStandings) {
    const history = snapshots
      .flat()
      .filter(
        row =>
          row.managerId === final.managerId
      );

    const early = history.filter(
      (_, index) => index >= 3
    );

    const lowest = [...early].sort(
      (a, b) =>
        a.winPercentage - b.winPercentage ||
        a.week - b.week
    )[0];

    const strongest = [...early].sort(
      (a, b) =>
        b.winPercentage - a.winPercentage ||
        a.week - b.week
    )[0];

    if (
      lowest &&
      lowest.week < final.week &&
      lowest.losses - lowest.wins >= 2 &&
      playoffParticipants.has(final.managerId)
    ) {
      add({
        id: `comeback:${final.managerId}`,
        type: "comeback",
        managerIds: [final.managerId],
        weeks: [lowest.week, final.week],
        headline: "Against All Odds",
        evidence:
          `${final.teamName} was ` +
          `${lowest.wins}-${lowest.losses}-${lowest.ties} ` +
          `after Week ${lowest.week}, finished ` +
          `${final.wins}-${final.losses}-${final.ties}, ` +
          `and reached the championship bracket.` +
          (
            final.managerId === championId
              ? " They then won the championship."
              : ""
          ),
        importance:
          final.managerId === championId
            ? 99
            : 76,
      });
    }

    if (
      strongest &&
      strongest.week < final.week &&
      strongest.winPercentage >= 75 &&
      strongest.winPercentage -
        final.winPercentage >= 25 &&
      !playoffParticipants.has(final.managerId)
    ) {
      add({
        id: `collapse:${final.managerId}`,
        type: "collapse",
        managerIds: [final.managerId],
        weeks: [strongest.week, final.week],
        headline: "The Collapse",
        evidence:
          `${final.teamName} started ` +
          `${strongest.wins}-${strongest.losses}-${strongest.ties} ` +
          `through Week ${strongest.week}, finished ` +
          `${final.wins}-${final.losses}-${final.ties}, ` +
          `and missed the championship bracket.`,
        importance: 88,
      });
    }

    if (
      final.winPercentage >= 80 &&
      final.wins + final.losses +
        final.ties >= 8
    ) {
      add({
        id: `dominance:${final.managerId}`,
        type: "dominance",
        managerIds: [final.managerId],
        weeks: [final.week],
        headline: "The Reign of Terror",
        evidence:
          `${final.teamName} won or tied at a ` +
          `${final.winPercentage}% adjusted win rate ` +
          `with a ${final.wins}-${final.losses}-${final.ties} record.`,
        importance:
          final.managerId === championId
            ? 96
            : 80,
      });
    }

    const bestStreak = [...history].sort(
      (a, b) => b.streak - a.streak
    )[0];

    const worstStreak = [...history].sort(
      (a, b) => a.streak - b.streak
    )[0];

    if (bestStreak.streak >= 4) {
      add({
        id: `win-streak:${final.managerId}`,
        type: "winning-streak",
        managerIds: [final.managerId],
        weeks: [
          bestStreak.week -
            bestStreak.streak + 1,
          bestStreak.week,
        ],
        headline: "Unstoppable",
        evidence:
          `${bestStreak.teamName} won ` +
          `${bestStreak.streak} consecutive ` +
          `regular-season games.`,
        importance: Math.min(
          90,
          55 + bestStreak.streak * 4
        ),
      });
    }

    if (worstStreak.streak <= -4) {
      add({
        id: `loss-streak:${final.managerId}`,
        type: "losing-streak",
        managerIds: [final.managerId],
        weeks: [
          worstStreak.week +
            worstStreak.streak + 1,
          worstStreak.week,
        ],
        headline: "The Losing Spiral",
        evidence:
          `${worstStreak.teamName} lost ` +
          `${Math.abs(worstStreak.streak)} ` +
          `consecutive regular-season games.`,
        importance: Math.min(
          85,
          50 +
            Math.abs(worstStreak.streak) * 4
        ),
      });
    }
  }

  const performances = games.flatMap(
    game => [
      { team: game.a, week: game.week },
      { team: game.b, week: game.week },
    ]
  );

  const maximumScore = Math.max(
    ...performances.map(
      item => item.team.points
    )
  );

  for (const item of performances.filter(
    item => item.team.points === maximumScore
  )) {
    add({
      id:
        `high-score:${item.team.managerId}:${item.week}`,
      type: "scoring-explosion",
      managerIds: [item.team.managerId],
      weeks: [item.week],
      headline: "Absolute Destruction",
      evidence:
        `${item.team.teamName} scored ` +
        `${score(item.team.points)} points ` +
        `in Week ${item.week}, the highest ` +
        `official weekly team score of the season.`,
      importance: 78,
    });
  }

  const decidedGames = games.filter(
    game => game.winnerManagerId !== null
  );

  const margin = (game: HistoricalGame) =>
    Math.abs(game.a.points - game.b.points);

  const biggestMargin = Math.max(
    ...decidedGames.map(margin)
  );

  const closestMargin = Math.min(
    ...decidedGames.map(margin)
  );

  for (const game of decidedGames) {
    const winner =
      game.winnerManagerId === game.a.managerId
        ? game.a
        : game.b;

    const loser =
      winner === game.a ? game.b : game.a;

    if (margin(game) === biggestMargin) {
      add({
        id:
          `blowout:${game.week}:${winner.managerId}`,
        type: "blowout",
        managerIds: [
          winner.managerId,
          loser.managerId,
        ],
        weeks: [game.week],
        headline: "No Mercy",
        evidence:
          `${winner.teamName} defeated ` +
          `${loser.teamName} by ` +
          `${score(margin(game))} points ` +
          `in Week ${game.week}.`,
        importance: 75,
      });
    }

    if (margin(game) === closestMargin) {
      add({
        id:
          `nail-biter:${game.week}:${winner.managerId}`,
        type: "nail-biter",
        managerIds: [
          winner.managerId,
          loser.managerId,
        ],
        weeks: [game.week],
        headline: "Down to the Wire",
        evidence:
          `${winner.teamName} defeated ` +
          `${loser.teamName} by ` +
          `${score(margin(game))} points ` +
          `in Week ${game.week}.`,
        importance:
          game.isPlayoffs ? 90 : 74,
      });
    }

    if (game.isPlayoffs) {
      const winnerRank =
        finalStandings.find(
          row =>
            row.managerId === winner.managerId
        )?.calculatedRank;

      const loserRank =
        finalStandings.find(
          row =>
            row.managerId === loser.managerId
        )?.calculatedRank;

      if (
        winnerRank !== undefined &&
        loserRank !== undefined &&
        winnerRank - loserRank >= 3
      ) {
        add({
          id:
            `upset:${game.week}:${winner.managerId}`,
          type: "playoff-upset",
          managerIds: [
            winner.managerId,
            loser.managerId,
          ],
          weeks: [game.week],
          headline: "Bracket Buster",
          evidence:
            `${winner.teamName}, calculated ` +
            `regular-season rank ${winnerRank}, ` +
            `eliminated ${loser.teamName}, ` +
            `calculated rank ${loserRank}.`,
          importance: 87,
        });
      }
    }
  }

  return {
    verified: true,
    issues: [],
    storylines: storylines.sort(
      (a, b) =>
        b.importance - a.importance ||
        a.id.localeCompare(b.id)
    ),
    progression: snapshots,
    fictional: true,
    readyForPublication: false,
  };
}