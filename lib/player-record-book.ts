
import {
  reconcilePlayerScoring,
} from "./player-scoring-reconciliation";

import {
  calculatePlayerSeasonRecords,
} from "./player-season-records";

import {
  calculateWeeklyPlayerRecords,
} from "./player-weekly-records";

import {
  PLAYER_RECORD_LIMIT,
} from "./player-record-types";

import type {
  PlayerWeekPerformance,
} from "./player-record-types";

import type {
  HistoricalGame,
} from "./lifetime-records";

export type PlayerRecordBookInput = {
  games: readonly HistoricalGame[];

  performances:
    readonly PlayerWeekPerformance[];

  completedSeasons:
    readonly number[];

  historicalMatchupsVerified: boolean;

  lineupCoverageVerified: boolean;
};

export function buildPlayerRecordBook(
  input: PlayerRecordBookInput
) {
  const issues: string[] = [];

  const reconciliation =
    reconcilePlayerScoring(
      input.games,
      input.performances
    );

  if (
    input.historicalMatchupsVerified !== true
  ) {
    issues.push(
      "Official historical matchup coverage is unverified."
    );
  }

  if (
    input.lineupCoverageVerified !== true
  ) {
    issues.push(
      "Historical starting lineup coverage is unverified."
    );
  }

  const availableSeasons =
    new Set(
      input.games.map(
        game => game.season
      )
    );

  const completed =
    new Set(input.completedSeasons);

  if (
    completed.size !==
      input.completedSeasons.length ||
    input.completedSeasons.some(
      season =>
        !Number.isInteger(season) ||
        !availableSeasons.has(season)
    )
  ) {
    issues.push(
      "Invalid completed season evidence."
    );
  }

  if (!reconciliation.verified) {
    issues.push(
      ...reconciliation.issues
    );
  }

  function failure() {
    return {
      verified: false,

      status: "needs-review" as const,

      issues: [...issues],

      reconciliation,

      seasonRecords:
        null as ReturnType<
          typeof calculatePlayerSeasonRecords
        >["records"],

      weeklyRecords:
        null as ReturnType<
          typeof calculateWeeklyPlayerRecords
        >["records"],

      readyForPublication: false,

      yahooRequests: 0,
      aiRequests: 0,
      databaseWrites: 0,
      emailsSent: 0,
    };
  }

  if (issues.length > 0) {
    return failure();
  }

  const seasonRecords =
    calculatePlayerSeasonRecords(
      reconciliation.verifiedPerformances,
      input.completedSeasons,
      PLAYER_RECORD_LIMIT
    );

  const weeklyRecords =
    calculateWeeklyPlayerRecords(
      reconciliation.verifiedPerformances,
      PLAYER_RECORD_LIMIT
    );

  if (
    !seasonRecords.verified ||
    !seasonRecords.records ||
    !weeklyRecords.verified ||
    !weeklyRecords.records
  ) {
    issues.push(
      ...seasonRecords.issues,
      ...weeklyRecords.issues,
      "Player record calculation failed."
    );

    return failure();
  }

  return {
    verified: true,

    status: "verified" as const,

    issues,

    reconciliation,

    seasonRecords:
      seasonRecords.records,

    weeklyRecords:
      weeklyRecords.records,

    seasonsAvailable:
      seasonRecords.seasonsAvailable,

    performancesCounted:
      seasonRecords.performancesCounted,

    rankingLimit:
      PLAYER_RECORD_LIMIT,

    readyForPublication: false,

    yahooRequests: 0,
    aiRequests: 0,
    databaseWrites: 0,
    emailsSent: 0,

    note:
      "Player records calculated from supplied " +
      "official starting-lineup evidence. " +
      "Publication requires separate authorization.",
  };
}
