
import {
  ACTIVE_MANAGERS,
} from "./league-managers";

import {
  normalizeRecordPosition,
  type PlayerWeekPerformance,
} from "./player-record-types";

import {
  calculatePlayerSeasonRecords,
} from "./player-season-records";

import {
  calculateWeeklyPlayerRecords,
} from "./player-weekly-records";

import {
  reconcilePlayerScoring,
} from "./player-scoring-reconciliation";

import {
  buildPlayerRecordBook,
} from "./player-record-book";

import type {
  HistoricalGame,
} from "./lifetime-records";

export function runPlayerRecordTests() {
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
          ? {
              error:
                "Expected result was not returned.",
            }
          : {}),
      });
    } catch (error) {
      results.push({
        name,
        passed: false,

        error:
          error instanceof Error
            ? error.message
            : "Unexpected test error.",
      });
    }
  }

  const a = ACTIVE_MANAGERS[0].id;
  const b = ACTIVE_MANAGERS[1].id;

  function player(
    changes:
      Partial<PlayerWeekPerformance> = {}
  ): PlayerWeekPerformance {
    return {
      season: 2020,
      week: 1,

      playerId: "fictional-qb-1",
      playerName: "Fictional Quarterback",

      position: "QB",
      nflTeam: "TEST",

      managerId: a,
      fantasyTeamName: "Test Alpha",

      lineupSlot: "QB",

      points: 30,

      started: true,

      isPlayoffs: false,
      isConsolation: false,

      scoringFinal: true,

      ...changes,
    };
  }

  const performances = [
    player(),

    player({
      playerId: "fictional-rb-1",
      playerName: "Fictional Running Back",
      position: "RB",
      lineupSlot: "W/R/T",
      points: 20,
    }),

    player({
      playerId: "fictional-def-1",
      playerName: "Fictional Defense",
      position: "DEF",
      lineupSlot: "DEF",
      points: -2,
    }),

    player({
      playerId: "fictional-qb-2",
      playerName: "Fictional Opponent QB",
      managerId: b,
      fantasyTeamName: "Test Beta",
      points: 40,
    }),
  ];

  const games: HistoricalGame[] = [
    {
      season: 2020,
      week: 1,
      isPlayoffs: false,

      a: {
        managerId: a,
        teamName: "Test Alpha",
        points: 48,
      },

      b: {
        managerId: b,
        teamName: "Test Beta",
        points: 40,
      },

      winnerManagerId: a,
    },
  ];

  // SEASON RECORDS

  test(
    "Player season points accumulate",
    () => {
      const result =
        calculatePlayerSeasonRecords([
          player(),
          player({
            week: 2,
            points: 25,
          }),
        ]);

      return (
        result.verified &&
        result.records
          ?.combined.QB[0]?.points === 55
      );
    }
  );

  test(
    "Regular-season and playoff points separated",
    () => {
      const result =
        calculatePlayerSeasonRecords([
          player(),
          player({
            week: 15,
            isPlayoffs: true,
            points: 20,
          }),
        ]);

      return (
        result.records
          ?.regularSeason.QB[0]?.points === 30 &&
        result.records
          ?.playoffs.QB[0]?.points === 20 &&
        result.records
          ?.combined.QB[0]?.points === 50
      );
    }
  );

  test(
    "Consolation performances excluded",
    () => {
      const result =
        calculatePlayerSeasonRecords([
          player(),
          player({
            week: 15,
            isPlayoffs: true,
            isConsolation: true,
            points: 100,
          }),
        ]);

      return (
        result.excludedConsolation === 1 &&
        result.records
          ?.combined.QB[0]?.points === 30
      );
    }
  );

  test(
    "Bench performances excluded",
    () => {
      const result =
        calculatePlayerSeasonRecords([
          player(),
          player({
            week: 2,
            started: false,
            lineupSlot: "BN",
            points: 50,
          }),
        ]);

      return (
        result.excludedBench === 1 &&
        result.records
          ?.combined.QB[0]?.points === 30
      );
    }
  );

  test(
    "Former managers excluded",
    () => {
      const result =
        calculatePlayerSeasonRecords([
          player(),
          player({
            week: 2,
            managerId: "brad-mccain",
            points: 100,
          }),
        ]);

      return (
        result.excludedFormerManagers === 1 &&
        result.records
          ?.combined.QB.length === 1
      );
    }
  );

  test(
    "Traded player contributions remain separate",
    () => {
      const result =
        calculatePlayerSeasonRecords([
          player(),
          player({
            week: 2,
            managerId: b,
            fantasyTeamName: "Test Beta",
            points: 20,
          }),
        ]);

      return (
        result.records
          ?.combined.QB.length === 2 &&
        result.records
          ?.combined.QB[0]?.points === 30 &&
        result.records
          ?.combined.QB[1]?.points === 20
      );
    }
  );

  test(
    "Negative defensive points preserved",
    () => {
      const result =
        calculatePlayerSeasonRecords(
          performances
        );

      return (
        result.records
          ?.combined.DEF[0]?.points === -2
      );
    }
  );

  test(
    "FLEX player ranked at natural position",
    () => {
      const result =
        calculatePlayerSeasonRecords(
          performances
        );

      return (
        result.records
          ?.combined.RB[0]?.points === 20
      );
    }
  );

  test(
    "Duplicate weekly player rejected",
    () =>
      !calculatePlayerSeasonRecords([
        player(),
        player(),
      ]).verified
  );

  test(
    "Unfinished scoring rejected",
    () =>
      !calculatePlayerSeasonRecords([
        player({
          scoringFinal: false,
        }),
      ]).verified
  );

  test(
    "Invalid numeric score rejected",
    () =>
      !calculatePlayerSeasonRecords([
        player({
          points: Number.NaN,
        }),
      ]).verified
  );

  test(
    "Completed season identified",
    () => {
      const result =
        calculatePlayerSeasonRecords(
          [player()],
          [2020]
        );

      return (
        result.records
          ?.combined.QB[0]
          ?.seasonComplete === true
      );
    }
  );

  test(
    "In-progress season identified",
    () => {
      const result =
        calculatePlayerSeasonRecords(
          [player()],
          []
        );

      return (
        result.records
          ?.combined.QB[0]
          ?.seasonComplete === false
      );
    }
  );

  test(
    "Top 25 season ranking limit",
    () => {
      const result =
        calculatePlayerSeasonRecords(
          Array.from(
            { length: 30 },
            (_, index) =>
              player({
                playerId:
                  `fictional-player-${index}`,

                points: index,
              })
          )
        );

      return (
        result.records
          ?.combined.QB.length === 25 &&
        result.records
          ?.combined.QB[0]?.points === 29
      );
    }
  );

  test(
    "Tied scores receive shared rank",
    () => {
      const result =
        calculatePlayerSeasonRecords([
          player(),
          player({
            playerId: "fictional-tied-qb",
          }),
        ]);

      return (
        result.records
          ?.combined.QB[0]?.rank === 1 &&
        result.records
          ?.combined.QB[1]?.rank === 1
      );
    }
  );

  // WEEKLY RECORDS

  test(
    "Highest weekly performance ranked first",
    () => {
      const result =
        calculateWeeklyPlayerRecords([
          player(),
          player({
            week: 2,
            points: 45,
          }),
        ]);

      return (
        result.records
          ?.combined.QB[0]?.points === 45 &&
        result.records
          ?.combined.QB[0]?.week === 2
      );
    }
  );

  test(
    "Weekly consolation record excluded",
    () => {
      const result =
        calculateWeeklyPlayerRecords([
          player(),
          player({
            week: 15,
            isPlayoffs: true,
            isConsolation: true,
            points: 100,
          }),
        ]);

      return (
        result.records
          ?.combined.QB.length === 1
      );
    }
  );

  test(
    "Defense position aliases normalized",
    () =>
      normalizeRecordPosition("D/ST") === "DEF" &&
      normalizeRecordPosition("DST") === "DEF"
  );

  // SCORING RECONCILIATION

  test(
    "Official lineup scores reconcile",
    () => {
      const result =
        reconcilePlayerScoring(
          games,
          performances
        );

      return (
        result.verified &&
        result.lineupsVerified === 2 &&
        result.coveragePercentage === 100
      );
    }
  );

  test(
    "Missing lineup rejected",
    () =>
      !reconcilePlayerScoring(
        games,
        performances.filter(
          item => item.managerId === a
        )
      ).verified
  );

  test(
    "Incorrect player points rejected",
    () =>
      !reconcilePlayerScoring(
        games,
        performances.map(
          (item, index) =>
            index === 0
              ? {
                  ...item,
                  points: 31,
                }
              : item
        )
      ).verified
  );

  test(
    "Unexpected playoff classification rejected",
    () =>
      !reconcilePlayerScoring(
        games,
        performances.map(
          (item, index) =>
            index === 0
              ? {
                  ...item,
                  isPlayoffs: true,
                }
              : item
        )
      ).verified
  );

  test(
    "Duplicate starting player rejected",
    () =>
      !reconcilePlayerScoring(
        games,
        [
          ...performances,
          performances[0],
        ]
      ).verified
  );

  // COMPLETE RECORD BOOK

  test(
    "Unverified lineup coverage blocks rankings",
    () =>
      !buildPlayerRecordBook({
        games,
        performances,
        completedSeasons: [],
        historicalMatchupsVerified: true,
        lineupCoverageVerified: false,
      }).verified
  );

  test(
    "Complete player record book calculated",
    () => {
      const result =
        buildPlayerRecordBook({
          games,
          performances,
          completedSeasons: [],
          historicalMatchupsVerified: true,
          lineupCoverageVerified: true,
        });

      return (
        result.verified &&
        result.seasonRecords
          ?.combined.QB[0]?.points === 40 &&
        result.weeklyRecords
          ?.combined.RB[0]?.points === 20 &&
        result.readyForPublication === false &&
        result.yahooRequests === 0 &&
        result.aiRequests === 0 &&
        result.databaseWrites === 0 &&
        result.emailsSent === 0
      );
    }
  );

  const passed =
    results.filter(
      result => result.passed
    ).length;

  return {
    ok: passed === results.length,

    mode: "fictional-player-record-tests",

    total: results.length,

    passed,

    failed: results.length - passed,

    results,

    yahooRequests: 0,
    aiRequests: 0,
    databaseWrites: 0,
    emailsSent: 0,
  };
}
