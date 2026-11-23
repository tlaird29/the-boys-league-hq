
import type {
  Player,
  FantasyTeam,
  WeekData,
  WeeklyAnalysis,
} from "./matchup-analysis";

export type GameWindow =
  | "THURSDAY"
  | "SUNDAY_EARLY"
  | "SUNDAY_LATE"
  | "SUNDAY_NIGHT"
  | "MONDAY_NIGHT"
  | "UNKNOWN";

export type TimingEvidence =
  | "scheduled"
  | "verified-scoring"
  | "unknown";

export type PlayerClutchImpact = {
  playerId: string;
  player: string;
  manager: string;
  points: number;
  projected: number | null;
  aboveProjection: number | null;
  gameWindow: GameWindow;
  timingEvidence: TimingEvidence;
  impactScore: number;
  reasons: string[];
};

export type MatchupClutchAnalysis = {
  matchupId: string;
  winner: string | null;
  margin: number;
  mostImpactful: PlayerClutchImpact | null;
  topScorer: PlayerClutchImpact | null;
  keyPerformers: PlayerClutchImpact[];
  gameTimeline: {
    window: GameWindow;
    players: string[];
    note: string;
  }[];
  confirmedComeback: boolean | null;
};

export type ClutchWeekAnalysis = {
  season: number;
  week: number;
  matchups: MatchupClutchAnalysis[];
  note: string;
};

export type GameTiming = {
  window: GameWindow;
  evidence: TimingEvidence;
};

export type TimingMap = Record<string, GameTiming>;

const windowOrder: GameWindow[] = [
  "THURSDAY",
  "SUNDAY_EARLY",
  "SUNDAY_LATE",
  "SUNDAY_NIGHT",
  "MONDAY_NIGHT",
  "UNKNOWN",
];

const windowNames: Record<GameWindow, string> = {
  THURSDAY: "Thursday Night Football",
  SUNDAY_EARLY: "Sunday early games",
  SUNDAY_LATE: "Sunday afternoon games",
  SUNDAY_NIGHT: "Sunday Night Football",
  MONDAY_NIGHT: "Monday Night Football",
  UNKNOWN: "Unknown game window",
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function playersWithManagers(
  teams: FantasyTeam[]
): { player: Player; manager: string }[] {
  return teams.flatMap(team =>
    team.players
      .filter(player => player.starter)
      .map(player => ({
        player,
        manager: team.manager,
      }))
  );
}

function calculateImpact(
  player: Player,
  manager: string,
  winner: string | null,
  margin: number,
  timing: GameTiming
): PlayerClutchImpact {
  const difference =
    player.projected === null
      ? null
      : round(player.points - player.projected);

  // MVP is primarily based on the winning
  // team's contribution and projection surprise.
  // Game time contributes narrative context,
  // not an automatic primetime bonus.

  const winningContribution =
    winner === manager ? Math.max(0, player.points) : 0;

  const positiveSurprise =
    difference === null ? 0 : Math.max(0, difference);

  const marginRelevance =
    winner === manager && margin > 0
      ? Math.min(
          Math.max(0, player.points),
          margin
        )
      : 0;

  const impactScore = round(
    winningContribution * 0.35 +
    positiveSurprise * 0.5 +
    marginRelevance * 0.15
  );

  const reasons: string[] = [];

  if (winner === manager) {
    reasons.push("Contributed to the winning team");
  }

  if (difference !== null && difference > 0) {
    reasons.push(
      `Exceeded projection by ${difference} points`
    );
  }

  if (
    winner === manager &&
    difference !== null &&
    difference > margin &&
    margin > 0
  ) {
    reasons.push(
      "Projection surprise exceeded the final margin"
    );
  }

  if (timing.window !== "UNKNOWN") {
    reasons.push(
      `Played in the ${windowNames[timing.window]} window`
    );
  }

  if (
    timing.window === "MONDAY_NIGHT" ||
    timing.window === "SUNDAY_NIGHT"
  ) {
    reasons.push(
      "Late-game storyline candidate; actual comeback not verified"
    );
  }

  return {
    playerId: player.id,
    player: player.name,
    manager,
    points: player.points,
    projected: player.projected,
    aboveProjection: difference,
    gameWindow: timing.window,
    timingEvidence: timing.evidence,
    impactScore,
    reasons,
  };
}

export function analyzeClutchImpact(
  data: WeekData,
  weekly: WeeklyAnalysis,
  timings: TimingMap = {}
): ClutchWeekAnalysis {
  const matchups = data.matchups.map(matchup => {
    const existing = weekly.matchups.find(
      result => result.id === matchup.id
    );

    if (!existing) {
      throw new Error(
        `Missing matchup analysis: ${matchup.id}`
      );
    }

    const impacts = playersWithManagers([
      matchup.home,
      matchup.away,
    ]).map(({ player, manager }) =>
      calculateImpact(
        player,
        manager,
        existing.winner,
        existing.margin,
        timings[player.id] ?? {
          window: "UNKNOWN",
          evidence: "unknown",
        }
      )
    );

    const ranked = [...impacts].sort(
      (a, b) =>
        b.impactScore - a.impactScore ||
        b.points - a.points
    );

    const winners = ranked.filter(
      player => player.manager === existing.winner
    );

    const mostImpactful =
      existing.winner === null
        ? null
        : winners[0] ?? null;

    const topScorer =
      [...impacts].sort(
        (a, b) => b.points - a.points
      )[0] ?? null;

    const gameTimeline = windowOrder
      .map(window => {
        const players = impacts
          .filter(p => p.gameWindow === window)
          .map(p => `${p.player} (${p.manager})`);

        return {
          window,
          players,
          note:
            window === "UNKNOWN"
              ? "Game timing unavailable."
              : `Scheduled game window: ${windowNames[window]}. ` +
                "This does not establish a live fantasy lead change.",
        };
      })
      .filter(item => item.players.length > 0);

    return {
      matchupId: matchup.id,
      winner: existing.winner,
      margin: existing.margin,
      mostImpactful,
      topScorer,
      keyPerformers: ranked.slice(0, 5),
      gameTimeline,
      // Exact comeback verification requires
      // chronological fantasy scoring snapshots.
      confirmedComeback: null,
    };
  });

  return {
    season: data.season,
    week: data.week,
    matchups,
    note:
      "Impact scores are a configurable heuristic, " +
      "not proof of causation. Game windows describe " +
      "when NFL games were scheduled. Exact fantasy " +
      "lead changes require timestamped scoring data.",
  };
}
