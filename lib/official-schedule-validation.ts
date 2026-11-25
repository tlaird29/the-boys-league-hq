
import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  HistoricalSchedule,
} from "./historical-reconciliation";

import type {
  HistoricalGame,
} from "./lifetime-records";

export function expectedChampionshipMatchups(
  playoffRound: number
): number | null {
  switch (playoffRound) {
    case 1:
      return 4;

    case 2:
      return 2;

    case 3:
      return 1;

    default:
      return null;
  }
}

export function validateOfficialSchedule(
  league: HistoricalLeague,
  schedule: HistoricalSchedule,
  teamKeys: readonly string[]
) {
  const issues: string[] = [];

  const members = new Set(
    teamKeys
  );

  if (
    schedule.season !==
      league.season ||
    schedule.leagueKey !==
      league.key
  ) {
    issues.push(
      "Schedule belongs to another league or season."
    );
  }

  if (!schedule.sourceVerified) {
    issues.push(
      "Schedule source has not been verified."
    );
  }

  if (
    members.size !==
      teamKeys.length ||
    members.size !==
      league.teamCount
  ) {
    issues.push(
      "Historical team membership is incomplete."
    );
  }

  if (
    !Number.isInteger(
      league.teamCount
    ) ||
    league.teamCount < 8 ||
    league.teamCount % 2 !== 0
  ) {
    issues.push(
      "Unsupported historical league size."
    );
  }

  if (
    !Number.isInteger(
      schedule.regularSeasonEndWeek
    ) ||
    schedule.regularSeasonEndWeek <
      league.startWeek ||
    schedule.regularSeasonEndWeek +
      3 !== league.endWeek
  ) {
    issues.push(
      "Historical playoff format could not be verified."
    );
  }

  if (
    !Number.isInteger(
      schedule.throughWeek
    ) ||
    schedule.throughWeek <
      league.startWeek ||
    schedule.throughWeek >
      league.endWeek
  ) {
    issues.push(
      "Invalid schedule cutoff."
    );
  }

  if (
    league.finished &&
    schedule.throughWeek !==
      league.endWeek
  ) {
    issues.push(
      "Completed season has an incomplete schedule."
    );
  }

  const weeklyReports: {
    week: number;
    expected: number;
    actual: number;
    verified: boolean;
  }[] = [];

  for (
    let week = league.startWeek;
    week <= Math.min(
      schedule.throughWeek,
      league.endWeek
    );
    week++
  ) {
    const previousIssues =
      issues.length;

    const games =
      schedule.matchups.filter(
        game => game.week === week
      );

    const isPlayoffs =
      week >
      schedule.regularSeasonEndWeek;

    const expected =
      isPlayoffs
        ? expectedChampionshipMatchups(
            week -
              schedule.regularSeasonEndWeek
          )
        : league.teamCount / 2;

    if (
      expected === null ||
      games.length !== expected
    ) {
      issues.push(
        `Week ${week}: incorrect official matchup count.`
      );
    }

    const participants =
      new Set<string>();

    for (const game of games) {
      if (
        game.isPlayoffs !==
        isPlayoffs
      ) {
        issues.push(
          `Week ${week}: incorrect playoff classification.`
        );
      }

      if (
        !members.has(
          game.teamAKey
        ) ||
        !members.has(
          game.teamBKey
        ) ||
        game.teamAKey ===
          game.teamBKey
      ) {
        issues.push(
          `Week ${week}: invalid team pairing.`
        );
      }

      if (
        participants.has(
          game.teamAKey
        ) ||
        participants.has(
          game.teamBKey
        )
      ) {
        issues.push(
          `Week ${week}: duplicated team appearance.`
        );
      }

      participants.add(
        game.teamAKey
      );

      participants.add(
        game.teamBKey
      );
    }

    if (!isPlayoffs) {
      for (
        const teamKey of members
      ) {
        if (
          !participants.has(
            teamKey
          )
        ) {
          issues.push(
            `Week ${week}: missing regular-season team.`
          );
        }
      }
    }

    weeklyReports.push({
      week,

      expected:
        expected ?? 0,

      actual:
        games.length,

      verified:
        issues.length ===
        previousIssues,
    });
  }

  for (
    const game of
    schedule.matchups
  ) {
    if (
      !Number.isInteger(
        game.week
      ) ||
      game.week <
        league.startWeek ||
      game.week >
        schedule.throughWeek
    ) {
      issues.push(
        "Matchup exists outside the expected schedule."
      );
    }
  }

  return {
    verified:
      issues.length === 0,

    issues,

    weeklyReports,

    expectedMatchups:
      weeklyReports.reduce(
        (total, week) =>
          total + week.expected,
        0
      ),

    scheduledMatchups:
      schedule.matchups.length,
  };
}

export function validateOfficialGameCounts(
  games: readonly HistoricalGame[],
  regularSeasonEndWeek: number,
  startWeek: number,
  throughWeek: number,
  teamCount: number
) {
  const issues: string[] = [];

  for (
    let week = startWeek;
    week <= throughWeek;
    week++
  ) {
    const expected =
      week <= regularSeasonEndWeek
        ? teamCount / 2
        : expectedChampionshipMatchups(
            week -
              regularSeasonEndWeek
          );

    const actual =
      games.filter(
        game => game.week === week
      ).length;

    if (
      expected === null ||
      actual !== expected
    ) {
      issues.push(
        `Week ${week}: expected ${expected} official games, found ${actual}.`
      );
    }
  }

  return {
    verified:
      issues.length === 0,

    issues,
  };
}
