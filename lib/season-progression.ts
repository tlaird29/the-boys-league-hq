import type {
  HistoricalGame,
} from "./lifetime-records";

export type SeasonProgressionInput = {
  season: number;
  startWeek: number;
  regularSeasonEndWeek: number;
  managerIds: readonly string[];
  games: readonly HistoricalGame[];
};

export type WeeklyStanding = {
  managerId: string;
  teamName: string;
  week: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  winPercentage: number;
  calculatedRank: number;
  streak: number;
  outcome: "W" | "L" | "T";
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function buildSeasonProgression(
  input: SeasonProgressionInput
) {
  const {
    season,
    startWeek,
    regularSeasonEndWeek,
    managerIds,
    games,
  } = input;

  const issues: string[] = [];
  const snapshots: WeeklyStanding[][] = [];

  const managers = new Set(managerIds);

  if (
    !Number.isInteger(season) ||
    season < 2020 ||
    !Number.isInteger(startWeek) ||
    !Number.isInteger(regularSeasonEndWeek) ||
    startWeek < 1 ||
    regularSeasonEndWeek < startWeek ||
    regularSeasonEndWeek + 3 > 18 ||
    managers.size !== managerIds.length ||
    managers.size < 8 ||
    managers.size % 2 !== 0 ||
    managerIds.some(id => !id.trim())
  ) {
    return {
      verified: false,
      issues: ["Invalid season configuration."],
      snapshots: [],
    };
  }

  const records = new Map<
    string,
    WeeklyStanding
  >();

  const seasonGames = games.filter(
    game => game.season === season
  );

  for (const game of seasonGames) {
    if (
      !Number.isInteger(game.week) ||
      game.week < startWeek ||
      game.week > regularSeasonEndWeek + 3 ||
      game.isPlayoffs !==
        (game.week > regularSeasonEndWeek)
    ) {
      issues.push(
        "Invalid matchup calendar or classification."
      );
    }
  }

  for (
    let week = startWeek;
    week <= regularSeasonEndWeek;
    week++
  ) {
    const weeklyGames = seasonGames.filter(
      game => game.week === week
    );

    const seen = new Set<string>();

    if (
      weeklyGames.length !==
      managers.size / 2
    ) {
      issues.push(
        `Week ${week}: incomplete matchup coverage.`
      );
    }

    for (const game of weeklyGames) {
      if (
        game.isPlayoffs ||
        !managers.has(game.a.managerId) ||
        !managers.has(game.b.managerId) ||
        game.a.managerId === game.b.managerId ||
        !Number.isFinite(game.a.points) ||
        !Number.isFinite(game.b.points)
      ) {
        issues.push(
          `Week ${week}: invalid matchup.`
        );

        continue;
      }

      const expectedWinner =
        game.a.points > game.b.points
          ? game.a.managerId
          : game.b.points > game.a.points
            ? game.b.managerId
            : null;

      if (
        game.winnerManagerId !==
        expectedWinner
      ) {
        issues.push(
          `Week ${week}: unverified or conflicting result.`
        );

        continue;
      }

      for (const [team, opponent] of [
        [game.a, game.b],
        [game.b, game.a],
      ] as const) {
        if (seen.has(team.managerId)) {
          issues.push(
            `Week ${week}: duplicate manager appearance.`
          );

          continue;
        }

        seen.add(team.managerId);

        const previous =
          records.get(team.managerId);

        const outcome =
          expectedWinner === null
            ? "T"
            : expectedWinner === team.managerId
              ? "W"
              : "L";

        const wins =
          (previous?.wins ?? 0) +
          Number(outcome === "W");

        const losses =
          (previous?.losses ?? 0) +
          Number(outcome === "L");

        const ties =
          (previous?.ties ?? 0) +
          Number(outcome === "T");

        const previousStreak =
          previous?.streak ?? 0;

        const streak =
          outcome === "W"
            ? Math.max(0, previousStreak) + 1
            : outcome === "L"
              ? Math.min(0, previousStreak) - 1
              : 0;

        records.set(team.managerId, {
          managerId: team.managerId,
          teamName: team.teamName,
          week,
          wins,
          losses,
          ties,

          pointsFor: round(
            (previous?.pointsFor ?? 0) +
            team.points
          ),

          pointsAgainst: round(
            (previous?.pointsAgainst ?? 0) +
            opponent.points
          ),

          winPercentage: round(
            (wins + ties * 0.5) /
            (wins + losses + ties) * 100
          ),

          calculatedRank: 0,
          streak,
          outcome,
        });
      }
    }

    if (seen.size !== managers.size) {
      issues.push(
        `Week ${week}: missing manager results.`
      );
    }

    const ranked = [...records.values()]
      .sort(
        (a, b) =>
          b.winPercentage - a.winPercentage ||
          b.pointsFor - a.pointsFor ||
          a.managerId.localeCompare(
            b.managerId
          )
      )
      .map((row, index, rows) => {
        const tiedWithPrevious =
          index > 0 &&
          row.winPercentage ===
            rows[index - 1].winPercentage &&
          row.pointsFor ===
            rows[index - 1].pointsFor;

        const firstMatchingIndex =
          tiedWithPrevious
            ? rows.findIndex(
                item =>
                  item.winPercentage ===
                    row.winPercentage &&
                  item.pointsFor ===
                    row.pointsFor
              )
            : index;

        return {
          ...row,
          calculatedRank:
            firstMatchingIndex + 1,
        };
      });

    snapshots.push(ranked);
  }

  return {
    verified: issues.length === 0,
    issues,
    snapshots:
      issues.length === 0
        ? snapshots
        : [],

    rankingMethod:
      "Win percentage followed by points scored. Calculated ranks are not official Yahoo standings.",
  };
}