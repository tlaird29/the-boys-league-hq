
export type Position =
  | "QB"
  | "RB"
  | "WR"
  | "TE"
  | "K"
  | "DEF";

export type Player = {
  id: string;
  name: string;
  position: Position;
  slot: string;
  points: number;
  projected: number | null;
  starter: boolean;
};

export type FantasyTeam = {
  id: string;
  manager: string;
  name: string;
  players: Player[];
};

export type FantasyMatchup = {
  id: string;
  home: FantasyTeam;
  away: FantasyTeam;
};

export type WeekData = {
  season: number;
  week: number;
  source: "test" | "yahoo";
  scoringFinal: boolean;
  matchups: FantasyMatchup[];
};

type PlayerImpact = {
  player: string;
  manager: string;
  position: Position;
  points: number;
  projected: number | null;
  difference: number | null;
};

type BenchOpportunity = {
  manager: string;
  starter: string;
  benchPlayer: string;
  starterPoints: number;
  benchPoints: number;
  potentialGain: number;
  wouldChangeResult: boolean;
};

type PositionAdvantage = {
  position: Position;
  homePoints: number;
  awayPoints: number;
  advantage: number;
  leader: string | null;
};

export type MatchupAnalysis = {
  id: string;
  home: string;
  away: string;
  homeScore: number;
  awayScore: number;
  winner: string | null;
  loser: string | null;
  margin: number;
  mvp: PlayerImpact | null;
  biggestBust: PlayerImpact | null;
  overperformers: PlayerImpact[];
  underperformers: PlayerImpact[];
  benchOpportunities: BenchOpportunity[];
  positionalAdvantages: PositionAdvantage[];
};

export type WeeklyAnalysis = {
  season: number;
  week: number;
  source: "test" | "yahoo";
  scoringFinal: boolean;
  matchups: MatchupAnalysis[];
  goat: { manager: string; points: number } | null;
  bum: { manager: string; points: number } | null;
};

const positions: Position[] = [
  "QB", "RB", "WR", "TE", "K", "DEF"
];

function round(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function starters(team: FantasyTeam): Player[] {
  return team.players.filter(player => player.starter);
}

function score(team: FantasyTeam): number {
  return round(
    starters(team).reduce(
      (total, player) => total + player.points,
      0
    )
  );
}

function impact(
  player: Player,
  manager: string
): PlayerImpact {
  return {
    player: player.name,
    manager,
    position: player.position,
    points: round(player.points),
    projected: player.projected,
    difference:
      player.projected === null
        ? null
        : round(player.points - player.projected),
  };
}

function canReplace(
  bench: Player,
  starter: Player
): boolean {
  const slot = starter.slot.toUpperCase();

  if (slot === "FLEX" || slot === "W/R/T") {
    return ["RB", "WR", "TE"].includes(
      bench.position
    );
  }

  if (slot === "SUPERFLEX" || slot === "Q/W/R/T") {
    return ["QB", "RB", "WR", "TE"].includes(
      bench.position
    );
  }

  return bench.position === starter.position;
}

function benchOpportunities(
  team: FantasyTeam,
  opponentScore: number
): BenchOpportunity[] {
  const teamScore = score(team);
  const opportunities: BenchOpportunity[] = [];

  for (const bench of team.players.filter(
    player => !player.starter
  )) {
    for (const starter of starters(team)) {
      if (!canReplace(bench, starter)) continue;

      const gain = round(
        bench.points - starter.points
      );

      if (gain <= 0) continue;

      opportunities.push({
        manager: team.manager,
        starter: starter.name,
        benchPlayer: bench.name,
        starterPoints: starter.points,
        benchPoints: bench.points,
        potentialGain: gain,
        wouldChangeResult:
          teamScore <= opponentScore &&
          round(teamScore + gain) > opponentScore,
      });
    }
  }

  return opportunities.sort(
    (a, b) => b.potentialGain - a.potentialGain
  );
}

function positionTotals(
  team: FantasyTeam,
  position: Position
): number {
  return round(
    starters(team)
      .filter(player => player.position === position)
      .reduce(
        (total, player) => total + player.points,
        0
      )
  );
}

export function analyzeWeek(
  data: WeekData
): WeeklyAnalysis {
  if (
    !Number.isInteger(data.season) ||
    !Number.isInteger(data.week) ||
    data.week < 1 ||
    !Array.isArray(data.matchups)
  ) {
    throw new Error("Invalid week data.");
  }

  const teamScores: {
    manager: string;
    points: number;
  }[] = [];

  const matchups = data.matchups.map(
    (matchup): MatchupAnalysis => {
      const homeScore = score(matchup.home);
      const awayScore = score(matchup.away);

      teamScores.push(
        { manager: matchup.home.manager, points: homeScore },
        { manager: matchup.away.manager, points: awayScore }
      );

      const winner =
        homeScore === awayScore
          ? null
          : homeScore > awayScore
            ? matchup.home.manager
            : matchup.away.manager;

      const loser =
        homeScore === awayScore
          ? null
          : homeScore < awayScore
            ? matchup.home.manager
            : matchup.away.manager;

      const allStarters = [
        ...starters(matchup.home).map(
          player => impact(player, matchup.home.manager)
        ),
        ...starters(matchup.away).map(
          player => impact(player, matchup.away.manager)
        ),
      ];

      const byPoints = [...allStarters].sort(
        (a, b) => b.points - a.points
      );

      const byProjection = allStarters
        .filter(player => player.difference !== null)
        .sort(
          (a, b) =>
            (b.difference ?? 0) -
            (a.difference ?? 0)
        );

      const positionalAdvantages =
        positions.map(position => {
          const homePoints = positionTotals(
            matchup.home,
            position
          );

          const awayPoints = positionTotals(
            matchup.away,
            position
          );

          return {
            position,
            homePoints,
            awayPoints,
            advantage: round(
              Math.abs(homePoints - awayPoints)
            ),
            leader:
              homePoints === awayPoints
                ? null
                : homePoints > awayPoints
                  ? matchup.home.manager
                  : matchup.away.manager,
          };
        });

      return {
        id: matchup.id,
        home: matchup.home.manager,
        away: matchup.away.manager,
        homeScore,
        awayScore,
        winner,
        loser,
        margin: round(
          Math.abs(homeScore - awayScore)
        ),
        mvp: byPoints[0] ?? null,
        biggestBust:
          [...byProjection].reverse()[0] ?? null,
        overperformers: byProjection
          .filter(
            player => (player.difference ?? 0) > 0
          )
          .slice(0, 3),
        underperformers: [...byProjection]
          .reverse()
          .filter(
            player => (player.difference ?? 0) < 0
          )
          .slice(0, 3),
        benchOpportunities: [
          ...benchOpportunities(
            matchup.home,
            awayScore
          ),
          ...benchOpportunities(
            matchup.away,
            homeScore
          ),
        ].sort(
          (a, b) =>
            b.potentialGain - a.potentialGain
        ),
        positionalAdvantages:
          positionalAdvantages.sort(
            (a, b) =>
              b.advantage - a.advantage
          ),
      };
    }
  );

  const ranked = [...teamScores].sort(
    (a, b) => b.points - a.points
  );

  return {
    season: data.season,
    week: data.week,
    source: data.source,
    scoringFinal: data.scoringFinal,
    matchups,
    goat:
      data.scoringFinal
        ? ranked[0] ?? null
        : null,
    bum:
      data.scoringFinal
        ? ranked[ranked.length - 1] ?? null
        : null,
  };
}
