
import {
  LEAGUE_START_YEAR,
  findManagerById,
} from "./league-managers";

import {
  RECORD_POSITIONS,
  PLAYER_RECORD_LIMIT,
  type PlayerWeekPerformance,
  type RecordPosition,
  type PlayerRecordCategory,
} from "./player-record-types";

import {
  calculatePlayerSeasonRecords,
} from "./player-season-records";

export type WeeklyPlayerRecord = {
  rank: number;

  season: number;
  week: number;

  playerId: string;
  playerName: string;

  position: RecordPosition;

  nflTeam: string;

  managerId: string;
  managerName: string;

  fantasyTeamName: string;

  points: number;

  isPlayoffs: boolean;
};

type WeeklyPositionRecords =
  Record<
    RecordPosition,
    WeeklyPlayerRecord[]
  >;

function emptyPositions():
  WeeklyPositionRecords {
  return {
    QB: [],
    RB: [],
    WR: [],
    TE: [],
    K: [],
    DEF: [],
  };
}

export function calculateWeeklyPlayerRecords(
  performances:
    readonly PlayerWeekPerformance[],

  limit: number =
    PLAYER_RECORD_LIMIT
) {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new Error(
      "Invalid weekly player record limit."
    );
  }

  const validation =
    calculatePlayerSeasonRecords(
      performances,
      [],
      1
    );

  const records: Record<
    PlayerRecordCategory,
    WeeklyPositionRecords
  > = {
    regularSeason: emptyPositions(),
    playoffs: emptyPositions(),
    combined: emptyPositions(),
  };

  if (!validation.verified) {
    return {
      verified: false,

      issues:
        validation.issues,

      records: null,

      readyForPublication: false,

      yahooRequests: 0,
      aiRequests: 0,
      databaseWrites: 0,
    };
  }

  const eligible =
    performances.flatMap(
      performance => {
        const manager =
          findManagerById(
            performance.managerId
          );

        if (
          !manager ||
          !performance.started ||
          performance.isConsolation ||
          !performance.scoringFinal ||
          performance.season <
            LEAGUE_START_YEAR
        ) {
          return [];
        }

        return [
          {
            season:
              performance.season,

            week:
              performance.week,

            playerId:
              performance.playerId,

            playerName:
              performance.playerName,

            position:
              performance.position,

            nflTeam:
              performance.nflTeam,

            managerId:
              performance.managerId,

            managerName:
              manager.name,

            fantasyTeamName:
              performance.fantasyTeamName,

            points:
              Math.round(
                performance.points *
                100
              ) / 100,

            isPlayoffs:
              performance.isPlayoffs,
          },
        ];
      }
    );

  const categories:
    PlayerRecordCategory[] = [
      "regularSeason",
      "playoffs",
      "combined",
    ];

  for (const category of categories) {
    const categoryPlayers =
      eligible.filter(
        performance =>
          category === "combined" ||
          (
            category === "playoffs"
              ? performance.isPlayoffs
              : !performance.isPlayoffs
          )
      );

    for (
      const position of
      RECORD_POSITIONS
    ) {
      const sorted =
        categoryPlayers
          .filter(
            performance =>
              performance.position ===
              position
          )
          .sort(
            (a, b) =>
              b.points - a.points ||
              a.season - b.season ||
              a.week - b.week ||
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

      records[category][position] =
        sorted
          .map(
            (performance, index) => {
              const rank =
                previousPoints ===
                performance.points
                  ? previousRank
                  : index + 1;

              previousPoints =
                performance.points;

              previousRank = rank;

              return {
                ...performance,
                rank,
              };
            }
          )
          .slice(0, limit);
    }
  }

  return {
    verified: true,

    issues: [] as string[],

    performancesCounted:
      eligible.length,

    records,

    limit,

    readyForPublication: false,

    yahooRequests: 0,
    aiRequests: 0,
    databaseWrites: 0,
  };
}
