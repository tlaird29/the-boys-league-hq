
import {
  LEAGUE_START_YEAR,
} from "./league-managers";

import type {
  HistoricalGame,
} from "./lifetime-records";

export type AuditStanding = {
  managerId: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
};

export type ExpectedWeek = {
  week: number;
  isPlayoffs: boolean;
  expectedMatchups: number;
  expectedManagerIds: readonly string[];
};

export type HistoricalSeasonInput = {
  season: number;
  finished: boolean;

  // Must come from independently
  // retrieved league settings and schedules.
  scheduleVerified: boolean;

  // Must reflect the same regular-season
  // cutoff as the supplied matchup data.
  standingsVerified: boolean;

  // Historical membership, including
  // former managers when applicable.
  managerIds: readonly string[];

  expectedWeeks: readonly ExpectedWeek[];

  games: readonly HistoricalGame[];

  officialRegularSeasonStandings:
    readonly AuditStanding[];

  // Points reconciliation tolerance.
  pointsTolerance?: number;
};

type AuditIssue = {
  code: string;
  message: string;
  season: number;
  week?: number;
  managerId?: string;
};

function emptyStanding(
  managerId: string
): AuditStanding {
  return {
    managerId,
    wins: 0,
    losses: 0,
    ties: 0,
    pointsFor: 0,
    pointsAgainst: 0,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

export function auditHistoricalSeason(
  input: HistoricalSeasonInput
) {
  const issues: AuditIssue[] = [];

  const season = input.season;

  function flag(
    code: string,
    message: string,
    week?: number,
    managerId?: string
  ) {
    issues.push({
      code,
      message,
      season,
      week,
      managerId,
    });
  }

  if (
    !Number.isInteger(season) ||
    season < LEAGUE_START_YEAR
  ) {
    flag(
      "INVALID_SEASON",
      "Invalid historical season."
    );
  }

  if (!input.scheduleVerified) {
    flag(
      "UNVERIFIED_SCHEDULE",
      "Expected schedule has not been verified."
    );
  }

  if (!input.standingsVerified) {
    flag(
      "UNVERIFIED_STANDINGS",
      "Comparison standings have not been verified."
    );
  }

  const tolerance =
    input.pointsTolerance ?? 0.02;

  if (
    !Number.isFinite(tolerance) ||
    tolerance < 0 ||
    tolerance > 0.1
  ) {
    throw new Error(
      "Invalid points reconciliation tolerance."
    );
  }

  const members = new Set(
    input.managerIds
  );

  if (
    members.size < 2 ||
    members.size !==
      input.managerIds.length ||
    input.managerIds.some(
      id => !id.trim()
    )
  ) {
    flag(
      "INVALID_MEMBERSHIP",
      "Historical manager membership is incomplete or duplicated."
    );
  }

  const reconstructed = new Map<
    string,
    AuditStanding
  >();

  for (const managerId of members) {
    reconstructed.set(
      managerId,
      emptyStanding(managerId)
    );
  }

  const expected = new Map<
    number,
    ExpectedWeek
  >();

  for (const week of input.expectedWeeks) {
    if (
      !Number.isInteger(week.week) ||
      week.week < 1 ||
      week.week > 18 ||
      !Number.isInteger(
        week.expectedMatchups
      ) ||
      week.expectedMatchups < 0
    ) {
      flag(
        "INVALID_EXPECTED_WEEK",
        "Invalid expected schedule entry.",
        week.week
      );

      continue;
    }

    if (expected.has(week.week)) {
      flag(
        "DUPLICATE_EXPECTED_WEEK",
        "Week appears twice in the expected schedule.",
        week.week
      );

      continue;
    }

    expected.set(week.week, week);

    const expectedManagers = new Set(
      week.expectedManagerIds
    );

    if (
      expectedManagers.size !==
        week.expectedManagerIds.length ||
      expectedManagers.size !==
        week.expectedMatchups * 2 ||
      [...expectedManagers].some(
        id => !members.has(id)
      )
    ) {
      flag(
        "INVALID_EXPECTED_PARTICIPANTS",
        "Expected participants do not match the schedule.",
        week.week
      );
    }
  }

  if (expected.size === 0) {
    flag(
      "EMPTY_SCHEDULE",
      "No expected historical weeks supplied."
    );
  }

  const actualCounts = new Map<
    number,
    number
  >();

  const actualParticipants = new Map<
    number,
    Set<string>
  >();

  const seenMatchups = new Set<string>();

  let acceptedGames = 0;
  let regularSeasonGames = 0;
  let playoffGames = 0;

  const games = [...input.games].sort(
    (a, b) => a.week - b.week
  );

  for (const game of games) {
    if (
      game.season !== season ||
      !Number.isInteger(game.week) ||
      game.week < 1 ||
      game.week > 18
    ) {
      flag(
        "INVALID_GAME_DATE",
        "Matchup belongs to an invalid season or week.",
        game.week
      );

      continue;
    }

    const schedule = expected.get(
      game.week
    );

    if (!schedule) {
      flag(
        "UNEXPECTED_WEEK",
        "Matchup is outside the expected schedule.",
        game.week
      );

      continue;
    }

    if (
      game.isPlayoffs !==
      schedule.isPlayoffs
    ) {
      flag(
        "PLAYOFF_CLASSIFICATION",
        "Matchup classification conflicts with the expected schedule.",
        game.week
      );

      continue;
    }

    const a = game.a;
    const b = game.b;

    if (
      !members.has(a.managerId) ||
      !members.has(b.managerId) ||
      a.managerId === b.managerId
    ) {
      flag(
        "INVALID_MANAGER",
        "Matchup contains an unknown or duplicated manager.",
        game.week
      );

      continue;
    }

    if (
      !a.teamName.trim() ||
      !b.teamName.trim() ||
      !Number.isFinite(a.points) ||
      !Number.isFinite(b.points)
    ) {
      flag(
        "INVALID_SCORE",
        "Matchup contains missing or invalid scoring information.",
        game.week
      );

      continue;
    }

    const matchupKey =
      `${game.week}:` +
      [a.managerId, b.managerId]
        .sort()
        .join(":");

    if (seenMatchups.has(matchupKey)) {
      flag(
        "DUPLICATE_MATCHUP",
        "The same matchup was collected more than once.",
        game.week
      );

      continue;
    }

    seenMatchups.add(matchupKey);

    const participants =
      actualParticipants.get(game.week) ??
      new Set<string>();

    if (
      participants.has(a.managerId) ||
      participants.has(b.managerId)
    ) {
      flag(
        "DUPLICATE_TEAM_APPEARANCE",
        "A manager appears in multiple matchups during the same week.",
        game.week
      );

      continue;
    }

    if (
      !schedule.expectedManagerIds.includes(
        a.managerId
      ) ||
      !schedule.expectedManagerIds.includes(
        b.managerId
      )
    ) {
      flag(
        "UNEXPECTED_PARTICIPANT",
        "A manager was not expected to play this week.",
        game.week
      );

      continue;
    }

    let winner = game.winnerManagerId;

    if (
      winner !== undefined &&
      winner !== null &&
      winner !== a.managerId &&
      winner !== b.managerId
    ) {
      flag(
        "INVALID_WINNER",
        "Official winner is not a participant.",
        game.week
      );

      continue;
    }

    const scoreWinner =
      a.points > b.points
        ? a.managerId
        : b.points > a.points
          ? b.managerId
          : null;

    if (
      scoreWinner !== null &&
      winner !== undefined &&
      winner !== scoreWinner
    ) {
      flag(
        "WINNER_SCORE_CONFLICT",
        "Official result conflicts with the recorded scores.",
        game.week
      );

      continue;
    }

    if (winner === undefined) {
      if (
        game.isPlayoffs &&
        scoreWinner === null
      ) {
        flag(
          "MISSING_TIEBREAKER",
          "Tied playoff matchup requires an official winner.",
          game.week
        );

        continue;
      }

      winner = scoreWinner;
    }

    if (
      game.isPlayoffs &&
      winner === null
    ) {
      flag(
        "UNRESOLVED_PLAYOFF_TIE",
        "Playoff matchup has no verified winner.",
        game.week
      );

      continue;
    }

    participants.add(a.managerId);
    participants.add(b.managerId);

    actualParticipants.set(
      game.week,
      participants
    );

    actualCounts.set(
      game.week,
      (actualCounts.get(game.week) ?? 0)
        + 1
    );

    acceptedGames++;

    if (game.isPlayoffs) {
      playoffGames++;
      continue;
    }

    regularSeasonGames++;

    const recordA = reconstructed.get(
      a.managerId
    )!;

    const recordB = reconstructed.get(
      b.managerId
    )!;

    recordA.pointsFor += a.points;
    recordA.pointsAgainst += b.points;

    recordB.pointsFor += b.points;
    recordB.pointsAgainst += a.points;

    if (winner === null) {
      recordA.ties++;
      recordB.ties++;
    } else if (
      winner === a.managerId
    ) {
      recordA.wins++;
      recordB.losses++;
    } else {
      recordB.wins++;
      recordA.losses++;
    }
  }

  let weeksVerified = 0;

  for (const week of expected.values()) {
    const count =
      actualCounts.get(week.week) ?? 0;

    const participants =
      actualParticipants.get(week.week) ??
      new Set<string>();

    let valid = true;

    if (
      count !== week.expectedMatchups
    ) {
      valid = false;

      flag(
        "MATCHUP_COUNT_MISMATCH",
        `Expected ${week.expectedMatchups} matchups; found ${count}.`,
        week.week
      );
    }

    for (
      const managerId of
      week.expectedManagerIds
    ) {
      if (!participants.has(managerId)) {
        valid = false;

        flag(
          "MISSING_TEAM_APPEARANCE",
          "Expected manager matchup is missing.",
          week.week,
          managerId
        );
      }
    }

    if (valid) {
      weeksVerified++;
    }
  }

  const official = new Map<
    string,
    AuditStanding
  >();

  for (
    const standing of
    input.officialRegularSeasonStandings
  ) {
    if (
      !members.has(standing.managerId) ||
      official.has(standing.managerId)
    ) {
      flag(
        "INVALID_OFFICIAL_STANDING",
        "Comparison standings contain an unknown or duplicated manager.",
        undefined,
        standing.managerId
      );

      continue;
    }

    const counts = [
      standing.wins,
      standing.losses,
      standing.ties,
    ];

    if (
      counts.some(
        count =>
          !Number.isInteger(count) ||
          count < 0
      ) ||
      !Number.isFinite(
        standing.pointsFor
      ) ||
      !Number.isFinite(
        standing.pointsAgainst
      )
    ) {
      flag(
        "INVALID_STANDING_TOTALS",
        "Comparison standings contain invalid totals.",
        undefined,
        standing.managerId
      );

      continue;
    }

    official.set(
      standing.managerId,
      standing
    );
  }

  let managersReconciled = 0;

  for (
    const [managerId, calculated] of
    reconstructed
  ) {
    const reference = official.get(
      managerId
    );

    if (!reference) {
      flag(
        "MISSING_OFFICIAL_STANDING",
        "No comparison standing found.",
        undefined,
        managerId
      );

      continue;
    }

    let matched = true;

    const countFields = [
      "wins",
      "losses",
      "ties",
    ] as const;

    for (const field of countFields) {
      if (
        calculated[field] !==
        reference[field]
      ) {
        matched = false;

        flag(
          "RECORD_MISMATCH",
          `${field}: calculated ${calculated[field]}, official ${reference[field]}.`,
          undefined,
          managerId
        );
      }
    }

    const pointFields = [
      "pointsFor",
      "pointsAgainst",
    ] as const;

    for (const field of pointFields) {
      if (
        Math.abs(
          calculated[field] -
          reference[field]
        ) > tolerance + 1e-9
      ) {
        matched = false;

        flag(
          "POINTS_MISMATCH",
          `${field}: calculated ${round(calculated[field])}, official ${reference[field]}.`,
          undefined,
          managerId
        );
      }
    }

    if (matched) {
      managersReconciled++;
    }
  }

  const expectedMatchups = [
    ...expected.values(),
  ].reduce(
    (total, week) =>
      total + week.expectedMatchups,
    0
  );

  if (expectedMatchups === 0) {
    flag(
      "EMPTY_MATCHUP_COVERAGE",
      "No completed matchups were expected."
    );
  }

  return {
    season,

    status:
      issues.length === 0
        ? "verified" as const
        : "needs-review" as const,

    finished: input.finished,

    verified: issues.length === 0,

    expectedWeeks: expected.size,

    weeksVerified,

    expectedMatchups,

    matchupsVerified: acceptedGames,

    regularSeasonGames,

    playoffGames,

    expectedManagers: members.size,

    managersReconciled,

    coveragePercentage:
      expectedMatchups > 0
        ? round(
            acceptedGames /
            expectedMatchups * 100
          )
        : 0,

    discrepancies: issues.length,

    issues,

    reconstructedStandings: [
      ...reconstructed.values(),
    ].map(record => ({
      ...record,
      pointsFor: round(
        record.pointsFor
      ),
      pointsAgainst: round(
        record.pointsAgainst
      ),
    })),

    note:
      "Verification establishes schedule " +
      "coverage and consistency with supplied " +
      "comparison standings, not independent " +
      "proof of underlying player statistics.",
  };
}

export function auditLeagueHistory(
  seasons: readonly HistoricalSeasonInput[],
  throughSeason: number
) {
  if (
    !Number.isInteger(throughSeason) ||
    throughSeason < LEAGUE_START_YEAR
  ) {
    throw new Error(
      "Invalid historical audit range."
    );
  }

  const reports = seasons.map(
    auditHistoricalSeason
  ).sort(
    (a, b) => a.season - b.season
  );

  const seen = new Set<number>();

  const duplicateSeasons =
    new Set<number>();

  const unexpectedSeasons =
    new Set<number>();

  for (const report of reports) {
    if (seen.has(report.season)) {
      duplicateSeasons.add(
        report.season
      );
    }

    if (
      report.season < LEAGUE_START_YEAR ||
      report.season > throughSeason
    ) {
      unexpectedSeasons.add(
        report.season
      );
    }

    seen.add(report.season);
  }

  const missingSeasons: number[] = [];

  for (
    let year = LEAGUE_START_YEAR;
    year <= throughSeason;
    year++
  ) {
    if (!seen.has(year)) {
      missingSeasons.push(year);
    }
  }

  const unfinishedHistoricalSeasons =
    reports.filter(
      report =>
        report.season < throughSeason &&
        !report.finished
    ).map(
      report => report.season
    );

  const verified =
    reports.length > 0 &&
    missingSeasons.length === 0 &&
    duplicateSeasons.size === 0 &&
    unexpectedSeasons.size === 0 &&
    unfinishedHistoricalSeasons.length === 0 &&
    reports.every(
      report => report.verified
    );

  return {
    verified,

    status: verified
      ? "verified" as const
      : "needs-review" as const,

    expectedSeasons:
      throughSeason -
      LEAGUE_START_YEAR + 1,

    seasonsAudited: reports.length,

    seasonsVerified:
      reports.filter(
        report => report.verified
      ).length,

    missingSeasons,

    duplicateSeasons: [
      ...duplicateSeasons,
    ],

    unexpectedSeasons: [
      ...unexpectedSeasons,
    ],

    unfinishedHistoricalSeasons,

    totalMatchupsVerified:
      reports.reduce(
        (total, report) =>
          total +
          report.matchupsVerified,
        0
      ),

    totalDiscrepancies:
      reports.reduce(
        (total, report) =>
          total +
          report.discrepancies,
        0
      ) +
      missingSeasons.length +
      duplicateSeasons.size +
      unexpectedSeasons.size +
      unfinishedHistoricalSeasons.length,

    reports,
  };
}
