
export const RECORD_POSITIONS = [
  "QB",
  "RB",
  "WR",
  "TE",
  "K",
  "DEF",
] as const;

export type RecordPosition =
  (typeof RECORD_POSITIONS)[number];

export const PLAYER_RECORD_LIMIT = 25;

export type PlayerRecordCategory =
  | "regularSeason"
  | "playoffs"
  | "combined";

export type PlayerWeekPerformance = {
  season: number;
  week: number;

  playerId: string;
  playerName: string;

  position: RecordPosition;

  nflTeam: string;

  managerId: string;
  fantasyTeamName: string;

  lineupSlot: string;

  points: number;

  started: boolean;

  isPlayoffs: boolean;
  isConsolation: boolean;

  scoringFinal: boolean;
};

export type PlayerSeasonRecord = {
  season: number;

  playerId: string;
  playerName: string;

  position: RecordPosition;

  managerId: string;
  managerName: string;

  fantasyTeamNames: string[];
  nflTeams: string[];

  points: number;
  games: number;

  pointsPerGame: number;

  highestWeeklyScore: number;

  highestScoringWeek: number;

  seasonComplete: boolean;
};

export type RankedPlayerSeason =
  PlayerSeasonRecord & {
    rank: number;
  };

export type PositionalPlayerRecords =
  Record<
    RecordPosition,
    RankedPlayerSeason[]
  >;

export type PlayerRecordBook = {
  regularSeason: PositionalPlayerRecords;

  playoffs: PositionalPlayerRecords;

  combined: PositionalPlayerRecords;
};

export function normalizeRecordPosition(
  position: string
): RecordPosition | null {
  const normalized =
    position.trim().toUpperCase();

  if (
    normalized === "DST" ||
    normalized === "D/ST" ||
    normalized === "DEFENSE"
  ) {
    return "DEF";
  }

  return RECORD_POSITIONS.find(
    value => value === normalized
  ) ?? null;
}
