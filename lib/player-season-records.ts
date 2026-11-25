
import {
  LEAGUE_START_YEAR,
  findManagerById,
} from "./league-managers";

import {
  RECORD_POSITIONS,
  PLAYER_RECORD_LIMIT,
  type RecordPosition,
  type PlayerRecordCategory,
  type PlayerWeekPerformance,
  type PlayerSeasonRecord,
  type RankedPlayerSeason,
  type PositionalPlayerRecords,
  type PlayerRecordBook,
} from "./player-record-types";

type SeasonAccumulator = {
  season: number;

  playerId: string;
  playerName: string;

  position: RecordPosition;

  managerId: string;
  managerName: string;

  fantasyTeamNames: Set<string>;
  nflTeams: Set<string>;

  points: number;
  games: number;

  highestWeeklyScore: number;
  highestScoringWeek: number;
};

function round(
  value: number
): number {
  return Math.round(
    value * 100
  ) / 100;
}

function emptyRankings():
  PositionalPlayerRecords {
  return {
    QB: [],
    RB: [],
    WR: [],
    TE: [],
    K: [],
    DEF: [],
  };
}

function emptyRecordBook():
  PlayerRecordBook {
  return {
    regularSeason: emptyRankings(),
    playoffs: emptyRankings(),
    combined: emptyRankings(),
  };
}

function rankRecords(
  records: PlayerSeasonRecord[],
  limit: number
): RankedPlayerSeason[] {
  const sorted = [...records].sort(
    (a, b) =>
      b.points - a.points ||
      a.season - b.season ||
      a.playerId.localeCompare(
        b.playerId
      ) ||
      a.managerId.localeCompare(
        b.managerId
      )
  );

  let previousPoints:
    number | null = null;

  let previousRank = 0;

  return sorted
    .map((record, index) => {
      const rank =
        previousPoints === record.points
          ? previousRank
          : index + 1;

      previousPoints =
        record.points;

      previousRank = rank;

      return {
        ...record,
        rank,
      };
    })
    .slice(0, limit);
}

export function calculatePlayerSeasonRecords(
  performances:
    readonly PlayerWeekPerformance[],

  completedSeasons:
    readonly number[] = [],

  limit: number =
    PLAYER_RECORD_LIMIT
) {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new Error(
      "Invalid player record limit."
    );
  }

  const completed =
    new Set(completedSeasons);

  const issues: string[] = [];

  const seen =
    new Set<string>();

  const positions =
    new Map<string, RecordPosition>();

  const categories:
    PlayerRecordCategory[] = [
      "regularSeason",
      "playoffs",
      "combined",
    ];

  const accumulators: Record<
    PlayerRecordCategory,
    Map<string, SeasonAccumulator>
  > = {
    regularSeason: new Map(),
    playoffs: new Map(),
    combined: new Map(),
  };

  let excludedConsolation = 0;
  let excludedBench = 0;
  let excludedFormerManagers = 0;
  let performancesCounted = 0;

  function accumulate(
    category: PlayerRecordCategory,
    performance: PlayerWeekPerformance,
    managerName: string
  ) {
    const key = JSON.stringify([
      performance.season,
      performance.playerId,
      performance.managerId,
    ]);

    const collection =
      accumulators[category];

    let record =
      collection.get(key);

    if (!record) {
      record = {
        season:
          performance.season,

        playerId:
          performance.playerId,

        playerName:
          performance.playerName,

        position:
          performance.position,

        managerId:
          performance.managerId,

        managerName,

        fantasyTeamNames:
          new Set<string>(),

        nflTeams:
          new Set<string>(),

        points: 0,
        games: 0,

        highestWeeklyScore:
          Number.NEGATIVE_INFINITY,

        highestScoringWeek:
          performance.week,
      };

      collection.set(
        key,
        record
      );
    }

    record.playerName =
      performance.playerName;

    record.fantasyTeamNames.add(
      performance.fantasyTeamName
    );

    if (performance.nflTeam.trim()) {
      record.nflTeams.add(
        performance.nflTeam
      );
    }

    record.points +=
      performance.points;

    record.games++;

    if (
      performance.points >
      record.highestWeeklyScore
    ) {
      record.highestWeeklyScore =
        performance.points;

      record.highestScoringWeek =
        performance.week;
    }
  }

  const ordered = [...performances].sort(
    (a, b) =>
      a.season - b.season ||
      a.week - b.week
  );

  for (const performance of ordered) {
    if (
      performance.isConsolation === true
    ) {
      excludedConsolation++;
      continue;
    }

    if (
      performance.started === false
    ) {
      excludedBench++;
      continue;
    }

    const manager =
      findManagerById(
        performance.managerId
      );

    if (!manager) {
      excludedFormerManagers++;
      continue;
    }

    if (
      !Number.isInteger(
        performance.season
      ) ||
      performance.season <
        LEAGUE_START_YEAR ||
      !Number.isInteger(
        performance.week
      ) ||
      performance.week < 1 ||
      performance.week > 18 ||
      !performance.playerId.trim() ||
      !performance.playerName.trim() ||
      !performance.fantasyTeamName.trim() ||
      !performance.lineupSlot.trim() ||
      !RECORD_POSITIONS.includes(
        performance.position
      ) ||
      !Number.isFinite(
        performance.points
      ) ||
      performance.scoringFinal !== true ||
      performance.started !== true ||
      performance.isConsolation !== false ||
      typeof performance.isPlayoffs !==
        "boolean"
    ) {
      issues.push(
        "Invalid or unverified player performance."
      );

      continue;
    }

    const slot =
      performance.lineupSlot
        .trim()
        .toUpperCase();

    if (
      [
        "BN",
        "BENCH",
        "IR",
        "IR+",
        "NA",
      ].includes(slot)
    ) {
      issues.push(
        "Non-starting lineup slot marked as a starter."
      );

      continue;
    }

    const weeklyKey =
      JSON.stringify([
        performance.season,
        performance.week,
        performance.playerId,
      ]);

    if (seen.has(weeklyKey)) {
      issues.push(
        "Duplicate weekly player performance."
      );

      continue;
    }

    seen.add(weeklyKey);

    const positionKey =
      JSON.stringify([
        performance.season,
        performance.playerId,
      ]);

    const previousPosition =
      positions.get(positionKey);

    if (
      previousPosition &&
      previousPosition !==
        performance.position
    ) {
      issues.push(
        "Conflicting player position within a season."
      );

      continue;
    }

    positions.set(
      positionKey,
      performance.position
    );

    const category:
      PlayerRecordCategory =
        performance.isPlayoffs
          ? "playoffs"
          : "regularSeason";

    accumulate(
      category,
      performance,
      manager.name
    );

    accumulate(
      "combined",
      performance,
      manager.name
    );

    performancesCounted++;
  }

  const records =
    emptyRecordBook();

  if (issues.length === 0) {
    for (const category of categories) {
      const seasonRecords:
        PlayerSeasonRecord[] =
          [
            ...accumulators[
              category
            ].values(),
          ].map(record => ({
            season:
              record.season,

            playerId:
              record.playerId,

            playerName:
              record.playerName,

            position:
              record.position,

            managerId:
              record.managerId,

            managerName:
              record.managerName,

            fantasyTeamNames:
              [...record.fantasyTeamNames],

            nflTeams:
              [...record.nflTeams],

            points:
              round(record.points),

            games:
              record.games,

            pointsPerGame:
              round(
                record.points /
                record.games
              ),

            highestWeeklyScore:
              round(
                record.highestWeeklyScore
              ),

            highestScoringWeek:
              record.highestScoringWeek,

            seasonComplete:
              completed.has(
                record.season
              ),
          }));

      for (
        const position of
        RECORD_POSITIONS
      ) {
        records[category][position] =
          rankRecords(
            seasonRecords.filter(
              record =>
                record.position ===
                position
            ),
            limit
          );
      }
    }
  }

  return {
    verified:
      issues.length === 0,

    issues,

    performancesReceived:
      performances.length,

    performancesCounted,

    excludedConsolation,
    excludedBench,
    excludedFormerManagers,

    seasonsAvailable:
      [
        ...new Set(
          [
            ...accumulators
              .combined.values(),
          ].map(
            record => record.season
          )
        ),
      ].sort((a, b) => a - b),

    records:
      issues.length === 0
        ? records
        : null,

    limit,

    readyForPublication: false,

    yahooRequests: 0,
    aiRequests: 0,
    databaseWrites: 0,

    note:
      "Rankings reflect verified starting-lineup " +
      "contributions for each player, manager and season. " +
      "Historical source completeness must be audited " +
      "before publication.",
  };
}
