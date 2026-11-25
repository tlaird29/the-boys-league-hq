
import {
  ACTIVE_MANAGERS,
  LEAGUE_START_YEAR,
} from "./league-managers";

import {
  calculateAllTimeRecords,
} from "./all-time-records";

import {
  calculateLifetimeRecords,
  type HistoricalGame,
} from "./lifetime-records";

import {
  calculateTeamNameHistory,
} from "./team-name-history";

import {
  calculateChampionshipHistory,
  type CompletedSeason,
} from "./championship-history";

import {
  auditHistoricalSeason,
  auditLeagueHistory,
  type HistoricalSeasonInput,
} from "./historical-audit";

export function runHistoricalTests() {
  const a = ACTIVE_MANAGERS[0].id;
  const b = ACTIVE_MANAGERS[1].id;
  const former = "fictional-former-manager";

  const year = LEAGUE_START_YEAR;

  const games: HistoricalGame[] = [
    {
      season: year,
      week: 1,
      isPlayoffs: false,
      a: {
        managerId: a,
        teamName: "Test Alpha",
        points: 150,
      },
      b: {
        managerId: b,
        teamName: "Test Beta",
        points: 100,
      },
      winnerManagerId: a,
    },
    {
      season: year,
      week: 2,
      isPlayoffs: false,
      a: {
        managerId: a,
        teamName: "Test Alpha Renamed",
        points: 120,
      },
      b: {
        managerId: b,
        teamName: "Test Beta",
        points: 110,
      },
      winnerManagerId: a,
    },
    {
      season: year,
      week: 3,
      isPlayoffs: false,
      a: {
        managerId: a,
        teamName: "Test Alpha Renamed",
        points: 100,
      },
      b: {
        managerId: b,
        teamName: "Test Beta",
        points: 100,
      },
      winnerManagerId: null,
    },
    {
      season: year,
      week: 4,
      isPlayoffs: true,
      a: {
        managerId: a,
        teamName: "Test Alpha Renamed",
        points: 160,
      },
      b: {
        managerId: b,
        teamName: "Test Beta",
        points: 130,
      },
      winnerManagerId: a,
    },
  ];

  const completedSeason: CompletedSeason = {
    season: year,
    finished: true,
    standingsVerified: true,
    standings: [
      {
        managerId: a,
        teamName: "Test Alpha Renamed",
        rank: 1,
      },
      {
        managerId: b,
        teamName: "Test Beta",
        rank: 2,
      },
    ],
  };

  const auditInput: HistoricalSeasonInput = {
    season: year,
    finished: true,
    scheduleVerified: true,
    standingsVerified: true,

    managerIds: [a, b],

    expectedWeeks: [1, 2, 3, 4].map(
      week => ({
        week,
        isPlayoffs: week === 4,
        expectedMatchups: 1,
        expectedManagerIds: [a, b],
      })
    ),

    games,

    officialRegularSeasonStandings: [
      {
        managerId: a,
        wins: 2,
        losses: 0,
        ties: 1,
        pointsFor: 370,
        pointsAgainst: 310,
      },
      {
        managerId: b,
        wins: 0,
        losses: 2,
        ties: 1,
        pointsFor: 310,
        pointsAgainst: 370,
      },
    ],
  };

  const results: {
    name: string;
    passed: boolean;
    error?: string;
  }[] = [];

  function test(
    name: string,
    check: () => boolean
  ) {
    try {
      const passed = check();

      results.push({
        name,
        passed,
        ...(!passed
          ? { error: "Unexpected result." }
          : {}),
      });
    } catch (error) {
      results.push({
        name,
        passed: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown test failure.",
      });
    }
  }

  function rejects(check: () => unknown) {
    try {
      check();
      return false;
    } catch {
      return true;
    }
  }

  function auditHasIssue(
    input: HistoricalSeasonInput,
    code: string
  ) {
    const report =
      auditHistoricalSeason(input);

    return (
      !report.verified &&
      report.issues.some(
        issue => issue.code === code
      )
    );
  }

  // LIFETIME RECORDS

  test("Correct career wins and ties", () => {
    const result =
      calculateLifetimeRecords(games);

    const manager = result.managers.find(
      record => record.managerId === a
    );

    return (
      manager?.career.wins === 3 &&
      manager.career.losses === 0 &&
      manager.career.ties === 1
    );
  });

  test("Correct career points", () => {
    const result =
      calculateLifetimeRecords(games);

    const manager = result.managers.find(
      record => record.managerId === a
    );

    return (
      manager?.career.pointsFor === 530 &&
      manager.career.pointsAgainst === 440
    );
  });

  test("Correct scoring average", () => {
    const result =
      calculateLifetimeRecords(games);

    return result.managers.find(
      record => record.managerId === a
    )?.career.pointsPerGame === 132.5;
  });

  test("Correct winning percentage", () => {
    const result =
      calculateLifetimeRecords(games);

    return result.managers.find(
      record => record.managerId === a
    )?.career.winPercentage === 87.5;
  });

  test("Regular season and playoff separation", () => {
    const result =
      calculateLifetimeRecords(games);

    const manager = result.managers.find(
      record => record.managerId === a
    );

    return (
      manager?.regularSeason.wins === 2 &&
      manager.regularSeason.games === 3 &&
      manager.playoffs.wins === 1 &&
      manager.playoffs.games === 1
    );
  });

  test("Correct longest winning streak", () => {
    const result =
      calculateLifetimeRecords(games);

    return result.managers.find(
      record => record.managerId === a
    )?.longestWinStreak === 2;
  });

  test("Correct head-to-head record", () => {
    const result =
      calculateLifetimeRecords(games);

    const rivalry = result.headToHead.find(
      record =>
        record.managerId === a &&
        record.opponentId === b
    );

    return (
      rivalry?.wins === 3 &&
      rivalry.losses === 0 &&
      rivalry.ties === 1
    );
  });

  test("Former opponents count toward career", () => {
    const extra: HistoricalGame = {
      season: year,
      week: 5,
      isPlayoffs: false,
      a: {
        managerId: a,
        teamName: "Test Alpha",
        points: 100,
      },
      b: {
        managerId: former,
        teamName: "Test Former",
        points: 90,
      },
      winnerManagerId: a,
    };

    const result =
      calculateLifetimeRecords([
        ...games,
        extra,
      ]);

    return (
      result.managers.find(
        record => record.managerId === a
      )?.career.wins === 4 &&
      !result.managers.some(
        record => record.managerId === former
      ) &&
      !result.headToHead.some(
        record => record.opponentId === former
      )
    );
  });

  test("Duplicate lifetime matchup rejected", () =>
    rejects(() =>
      calculateLifetimeRecords([
        ...games,
        games[0],
      ])
    )
  );

  // TEAM NAME HISTORY

  test("Team name changes tracked", () => {
    const history =
      calculateTeamNameHistory([
        {
          managerId: a,
          teamName: "Test Alpha",
          season: year,
          week: 1,
        },
        {
          managerId: a,
          teamName: "Test Alpha Renamed",
          season: year,
          week: 2,
        },
      ]);

    return history.find(
      record => record.managerId === a
    )?.totalUniqueNames === 2;
  });

  test("Duplicate team names consolidated", () => {
    const history =
      calculateTeamNameHistory([
        {
          managerId: a,
          teamName: "Test Alpha",
          season: year,
        },
        {
          managerId: a,
          teamName: " test alpha ",
          season: year + 1,
        },
      ]);

    const manager = history.find(
      record => record.managerId === a
    );

    return (
      manager?.totalUniqueNames === 1 &&
      manager.uniqueNames[0].seasonsUsed === 2
    );
  });

  // CHAMPIONSHIPS

  test("Verified champion identified", () => {
    const result =
      calculateChampionshipHistory([
        completedSeason,
      ]);

    return (
      result.totalChampionships === 1 &&
      result.championships[0].managerId === a
    );
  });

  test("Unfinished season has no champion", () => {
    const result =
      calculateChampionshipHistory([
        {
          ...completedSeason,
          finished: false,
        },
      ]);

    return result.totalChampionships === 0;
  });

  test("Unverified standings produce no champion", () => {
    const result =
      calculateChampionshipHistory([
        {
          ...completedSeason,
          standingsVerified: false,
        },
      ]);

    return result.totalChampionships === 0;
  });

  test("Duplicate champions rejected", () =>
    rejects(() =>
      calculateChampionshipHistory([
        {
          ...completedSeason,
          standings: [
            completedSeason.standings[0],
            {
              ...completedSeason.standings[1],
              rank: 1,
            },
          ],
        },
      ])
    )
  );

  test("Rafters alternate banner themes", () => {
    const result =
      calculateChampionshipHistory([
        completedSeason,
        {
          ...completedSeason,
          season: year + 1,
        },
      ]);

    return (
      result.rafters[0].theme === "dark" &&
      result.rafters[1].theme === "light"
    );
  });

  test("Consecutive championships counted", () => {
    const result =
      calculateChampionshipHistory([
        completedSeason,
        {
          ...completedSeason,
          season: year + 1,
        },
      ]);

    const manager =
      result.managerChampionships.find(
        record => record.managerId === a
      );

    return (
      manager?.championships === 2 &&
      manager.longestTitleStreak === 2
    );
  });

  // ALL-TIME RECORDS

  test("Highest weekly score", () => {
    const result =
      calculateAllTimeRecords(
        games,
        [completedSeason]
      );

    return (
      result.records.allTime
        .highestWeeklyScores[0].points === 160
    );
  });

  test("Biggest victory", () => {
    const result =
      calculateAllTimeRecords(
        games,
        [completedSeason]
      );

    return (
      result.records.allTime
        .biggestVictories[0].margin === 50
    );
  });

  test("Closest victory excludes ties", () => {
    const result =
      calculateAllTimeRecords(
        games,
        [completedSeason]
      );

    return (
      result.records.allTime
        .closestVictories[0].margin === 10
    );
  });

  test("Regular season scoring record", () => {
    const result =
      calculateAllTimeRecords(
        games,
        [completedSeason]
      );

    return (
      result.records.regularSeason
        .highestWeeklyScores[0].points === 150
    );
  });

  test("Manager profiles include championships and names", () => {
    const result =
      calculateAllTimeRecords(
        games,
        [completedSeason]
      );

    const manager =
      result.managerProfiles.find(
        record => record.managerId === a
      );

    return (
      manager?.championships?.championships === 1 &&
      manager.teamNames?.totalUniqueNames === 2 &&
      manager.statistics?.career.wins === 3
    );
  });

  // HISTORICAL AUDIT

  test("Valid historical season passes audit", () => {
    const report =
      auditHistoricalSeason(auditInput);

    return (
      report.verified &&
      report.coveragePercentage === 100 &&
      report.discrepancies === 0 &&
      report.managersReconciled === 2
    );
  });

  test("Missing matchup detected", () =>
    auditHasIssue(
      {
        ...auditInput,
        games: games.slice(0, 3),
      },
      "MATCHUP_COUNT_MISMATCH"
    )
  );

  test("Duplicate matchup detected", () =>
    auditHasIssue(
      {
        ...auditInput,
        games: [...games, games[0]],
      },
      "DUPLICATE_MATCHUP"
    )
  );

  test("Incorrect standings detected", () =>
    auditHasIssue(
      {
        ...auditInput,
        officialRegularSeasonStandings: [
          {
            ...auditInput
              .officialRegularSeasonStandings[0],
            wins: 3,
          },
          auditInput
            .officialRegularSeasonStandings[1],
        ],
      },
      "RECORD_MISMATCH"
    )
  );

  test("Incorrect scoring totals detected", () =>
    auditHasIssue(
      {
        ...auditInput,
        officialRegularSeasonStandings: [
          {
            ...auditInput
              .officialRegularSeasonStandings[0],
            pointsFor: 999,
          },
          auditInput
            .officialRegularSeasonStandings[1],
        ],
      },
      "POINTS_MISMATCH"
    )
  );

  test("Incorrect matchup winner detected", () =>
    auditHasIssue(
      {
        ...auditInput,
        games: [
          {
            ...games[0],
            winnerManagerId: b,
          },
          ...games.slice(1),
        ],
      },
      "WINNER_SCORE_CONFLICT"
    )
  );

  test("Incorrect playoff classification detected", () =>
    auditHasIssue(
      {
        ...auditInput,
        games: [
          ...games.slice(0, 3),
          {
            ...games[3],
            isPlayoffs: false,
          },
        ],
      },
      "PLAYOFF_CLASSIFICATION"
    )
  );

  test("Unknown manager detected", () =>
    auditHasIssue(
      {
        ...auditInput,
        games: [
          {
            ...games[0],
            b: {
              ...games[0].b,
              managerId: "unknown-manager",
            },
          },
          ...games.slice(1),
        ],
      },
      "INVALID_MANAGER"
    )
  );

  test("Unverified schedule rejected", () =>
    auditHasIssue(
      {
        ...auditInput,
        scheduleVerified: false,
      },
      "UNVERIFIED_SCHEDULE"
    )
  );

  test("Unverified standings rejected", () =>
    auditHasIssue(
      {
        ...auditInput,
        standingsVerified: false,
      },
      "UNVERIFIED_STANDINGS"
    )
  );

  test("Missing historical season detected", () => {
    const report = auditLeagueHistory(
      [auditInput],
      year + 1
    );

    return (
      !report.verified &&
      report.missingSeasons.includes(year + 1)
    );
  });

  test("Duplicate historical season detected", () => {
    const report = auditLeagueHistory(
      [auditInput, auditInput],
      year
    );

    return (
      !report.verified &&
      report.duplicateSeasons.includes(year)
    );
  });

  test("Complete historical coverage passes", () => {
    const report = auditLeagueHistory(
      [auditInput],
      year
    );

    return (
      report.verified &&
      report.seasonsVerified === 1 &&
      report.totalDiscrepancies === 0
    );
  });

  const passed = results.filter(
    result => result.passed
  ).length;

  return {
    ok: passed === results.length,
    mode: "fictional-historical-tests",
    total: results.length,
    passed,
    failed: results.length - passed,
    results,
    yahooRequests: 0,
    aiRequests: 0,
    emailsSent: 0,
    databaseWrites: 0,
  };
}
