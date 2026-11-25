
import {
  auditHistoricalSeason,
  type AuditStanding,
  type ExpectedWeek,
} from "./historical-audit";

import type {
  HistoricalGame,
} from "./lifetime-records";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  ResolvedHistoricalTeam,
} from "./historical-manager-identity";

export type ScheduledMatchup = {
  week: number;
  teamAKey: string;
  teamBKey: string;
  isPlayoffs: boolean;
};

export type HistoricalSchedule = {
  season: number;
  leagueKey: string;
  throughWeek: number;
  regularSeasonEndWeek: number;
  sourceVerified: boolean;
  matchups: readonly ScheduledMatchup[];
};

export type OfficialTeamStanding = {
  teamKey: string;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
};

export type HistoricalStandings = {
  season: number;
  leagueKey: string;
  throughWeek: number;
  sourceVerified: boolean;
  teams: readonly OfficialTeamStanding[];
};

function matchupKey(
  week: number,
  managerA: string,
  managerB: string
): string {
  return JSON.stringify([
    week,
    ...[managerA, managerB].sort(),
  ]);
}

function validRecordNumber(
  value: number
): boolean {
  return (
    Number.isInteger(value) &&
    value >= 0
  );
}

export function reconcileHistoricalSeason(
  league: HistoricalLeague,
  teams: readonly ResolvedHistoricalTeam[],
  schedule: HistoricalSchedule,
  standings: HistoricalStandings,
  games: readonly HistoricalGame[]
) {
  const issues: string[] = [];

  const teamMap = new Map(
    teams.map(team => [
      team.teamKey,
      team,
    ])
  );

  const managerIds = teams.map(
    team => team.managerId
  );

  const managerSet = new Set(
    managerIds
  );

  if (
    teams.length !== league.teamCount ||
    teamMap.size !== teams.length ||
    managerSet.size !== teams.length ||
    teams.some(
      team =>
        team.season !== league.season ||
        team.leagueKey !== league.key ||
        !team.managerId.trim() ||
        !team.teamKey.startsWith(
          `${league.key}.t.`
        )
    )
  ) {
    issues.push(
      "Historical manager coverage is invalid."
    );
  }

  const validScheduleRange =
    Number.isInteger(
      schedule.throughWeek
    ) &&
    Number.isInteger(
      schedule.regularSeasonEndWeek
    ) &&
    schedule.throughWeek >=
      league.startWeek &&
    schedule.throughWeek <=
      league.endWeek &&
    schedule.regularSeasonEndWeek >=
      league.startWeek &&
    schedule.regularSeasonEndWeek <=
      league.endWeek;

  if (!validScheduleRange) {
    throw new Error(
      "Invalid historical schedule range."
    );
  }

  if (
    !schedule.sourceVerified ||
    schedule.season !== league.season ||
    schedule.leagueKey !== league.key
  ) {
    issues.push(
      "Historical schedule source is not verified."
    );
  }

  if (
    league.finished &&
    schedule.throughWeek !== league.endWeek
  ) {
    issues.push(
      "Completed season is missing final weeks."
    );
  }

  const expectedStandingsWeek = Math.min(
    schedule.throughWeek,
    schedule.regularSeasonEndWeek
  );

  if (
    !standings.sourceVerified ||
    standings.season !== league.season ||
    standings.leagueKey !== league.key ||
    standings.throughWeek !==
      expectedStandingsWeek
  ) {
    issues.push(
      "Standings source or scoring cutoff does not match."
    );
  }

  const expectedPairs =
    new Map<string, ScheduledMatchup>();

  const actualPairs =
    new Set<string>();

  const expectedWeeks:
    ExpectedWeek[] = [];

  const scheduledAppearances =
    new Set<string>();

  for (
    let week = league.startWeek;
    week <= schedule.throughWeek;
    week++
  ) {
    const scheduled =
      schedule.matchups.filter(
        matchup => matchup.week === week
      );

    const participants: string[] = [];

    const isPlayoffs =
      week >
      schedule.regularSeasonEndWeek;

    if (scheduled.length === 0) {
      issues.push(
        `No expected matchups for week ${week}.`
      );
    }

    for (const matchup of scheduled) {
      const managerA = teamMap.get(
        matchup.teamAKey
      );

      const managerB = teamMap.get(
        matchup.teamBKey
      );

      if (
        !managerA ||
        !managerB ||
        managerA.managerId ===
          managerB.managerId
      ) {
        issues.push(
          `Invalid scheduled teams in week ${week}.`
        );

        continue;
      }

      if (
        matchup.isPlayoffs !== isPlayoffs
      ) {
        issues.push(
          `Incorrect scheduled playoff classification in week ${week}.`
        );
      }

      const key = matchupKey(
        week,
        managerA.managerId,
        managerB.managerId
      );

      if (expectedPairs.has(key)) {
        issues.push(
          `Duplicate scheduled matchup in week ${week}.`
        );

        continue;
      }

      expectedPairs.set(
        key,
        matchup
      );

      for (
        const manager of [
          managerA,
          managerB,
        ]
      ) {
        const appearance =
          `${week}:${manager.managerId}`;

        if (
          scheduledAppearances.has(
            appearance
          )
        ) {
          issues.push(
            `Manager scheduled twice in week ${week}.`
          );
        }

        scheduledAppearances.add(
          appearance
        );

        participants.push(
          manager.managerId
        );
      }
    }

    expectedWeeks.push({
      week,
      isPlayoffs,

      expectedMatchups:
        scheduled.length,

      expectedManagerIds:
        participants,
    });
  }

  for (const matchup of schedule.matchups) {
    if (
      !Number.isInteger(matchup.week) ||
      matchup.week < league.startWeek ||
      matchup.week > schedule.throughWeek
    ) {
      issues.push(
        "Schedule contains an unexpected week."
      );
    }
  }

  let exactMatchupsVerified = 0;

  for (const game of games) {
    if (
      game.season !== league.season ||
      !Number.isInteger(game.week) ||
      !managerSet.has(game.a.managerId) ||
      !managerSet.has(game.b.managerId) ||
      game.a.managerId === game.b.managerId
    ) {
      issues.push(
        "Invalid historical matchup identity."
      );

      continue;
    }

    const key = matchupKey(
      game.week,
      game.a.managerId,
      game.b.managerId
    );

    if (actualPairs.has(key)) {
      issues.push(
        `Duplicate collected matchup in week ${game.week}.`
      );

      continue;
    }

    actualPairs.add(key);

    const expected =
      expectedPairs.get(key);

    if (!expected) {
      issues.push(
        `Unexpected opponent pairing in week ${game.week}.`
      );

      continue;
    }

    if (
      expected.isPlayoffs !==
      game.isPlayoffs
    ) {
      issues.push(
        `Playoff classification mismatch in week ${game.week}.`
      );

      continue;
    }

    exactMatchupsVerified++;
  }

  for (
    const [key, matchup] of expectedPairs
  ) {
    if (!actualPairs.has(key)) {
      issues.push(
        `Missing scheduled matchup in week ${matchup.week}.`
      );
    }
  }

  const officialStandings:
    AuditStanding[] = [];

  const seenStandingManagers =
    new Set<string>();

  for (const standing of standings.teams) {
    const manager = teamMap.get(
      standing.teamKey
    );

    if (!manager) {
      issues.push(
        "Standings contain an unknown team."
      );

      continue;
    }

    if (
      seenStandingManagers.has(
        manager.managerId
      )
    ) {
      issues.push(
        "Duplicate official standings entry."
      );

      continue;
    }

    if (
      !validRecordNumber(standing.wins) ||
      !validRecordNumber(standing.losses) ||
      !validRecordNumber(standing.ties) ||
      !Number.isFinite(standing.pointsFor) ||
      !Number.isFinite(standing.pointsAgainst)
    ) {
      issues.push(
        "Invalid official standings totals."
      );

      continue;
    }

    seenStandingManagers.add(
      manager.managerId
    );

    officialStandings.push({
      managerId: manager.managerId,
      wins: standing.wins,
      losses: standing.losses,
      ties: standing.ties,
      pointsFor: standing.pointsFor,
      pointsAgainst: standing.pointsAgainst,
    });
  }

  if (
    officialStandings.length !==
    league.teamCount
  ) {
    issues.push(
      "Official standings coverage is incomplete."
    );
  }

  const audit = auditHistoricalSeason({
    season: league.season,
    finished: league.finished,

    scheduleVerified:
      schedule.sourceVerified &&
      schedule.season === league.season &&
      schedule.leagueKey === league.key,

    standingsVerified:
      standings.sourceVerified &&
      standings.season === league.season &&
      standings.leagueKey === league.key &&
      standings.throughWeek ===
        expectedStandingsWeek,

    managerIds,
    expectedWeeks,
    games,

    officialRegularSeasonStandings:
      officialStandings,

    pointsTolerance: 0.02,
  });

  const verified =
    issues.length === 0 &&
    audit.verified &&
    exactMatchupsVerified ===
      expectedPairs.size;

  return {
    season: league.season,

    verified,

    status: verified
      ? "verified" as const
      : "needs-review" as const,

    expectedMatchups:
      expectedPairs.size,

    exactMatchupsVerified,

    matchupCoveragePercentage:
      expectedPairs.size > 0
        ? Math.round(
            exactMatchupsVerified /
            expectedPairs.size *
            10000
          ) / 100
        : 0,

    managersReconciled:
      audit.managersReconciled,

    totalDiscrepancies:
      issues.length +
      audit.discrepancies,

    issues,
    audit,

    verifiedGames: verified
      ? [...games]
      : [],

    readyForChampionshipAudit:
      verified && league.finished,

    readyForPublication: false,

    note:
      "Matchup results are reconciled " +
      "against separately supplied " +
      "schedule and standings evidence. " +
      "Championship bracket verification " +
      "and data-use authorization remain " +
      "separate requirements.",
  };
}
