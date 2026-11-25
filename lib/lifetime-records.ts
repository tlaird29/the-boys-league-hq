
import {
  ACTIVE_MANAGERS,
  LEAGUE_START_YEAR,
  isActiveManager,
} from "./league-managers";

export type HistoricalTeam = {
  managerId: string;
  teamName: string;
  points: number;
};

export type HistoricalGame = {
  season: number;
  week: number;
  isPlayoffs: boolean;
  a: HistoricalTeam;
  b: HistoricalTeam;
  winnerManagerId?: string | null;
};

type Outcome = "W" | "L" | "T";

type RecordTotals = {
  wins: number;
  losses: number;
  ties: number;
  games: number;
  pointsFor: number;
  pointsAgainst: number;
};

function emptyRecord(): RecordTotals {
  return {
    wins: 0,
    losses: 0,
    ties: 0,
    games: 0,
    pointsFor: 0,
    pointsAgainst: 0,
  };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function summarize(record: RecordTotals) {
  return {
    ...record,
    pointsFor: round(record.pointsFor),
    pointsAgainst: round(record.pointsAgainst),

    winPercentage:
      record.games > 0
        ? round(
            ((record.wins +
              record.ties * 0.5) /
              record.games) * 100
          )
        : null,

    pointsPerGame:
      record.games > 0
        ? round(
            record.pointsFor /
              record.games
          )
        : null,

    pointsAgainstPerGame:
      record.games > 0
        ? round(
            record.pointsAgainst /
              record.games
          )
        : null,

    pointDifferential: round(
      record.pointsFor -
        record.pointsAgainst
    ),
  };
}

function addResult(
  record: RecordTotals,
  outcome: Outcome,
  points: number,
  opponentPoints: number
) {
  record.games++;

  record.pointsFor += points;
  record.pointsAgainst += opponentPoints;

  if (outcome === "W") record.wins++;
  if (outcome === "L") record.losses++;
  if (outcome === "T") record.ties++;
}

function getOutcome(
  game: HistoricalGame,
  team: HistoricalTeam,
  opponent: HistoricalTeam
): Outcome {
  if (game.winnerManagerId !== undefined) {
    if (game.winnerManagerId === null) {
      return "T";
    }

    return game.winnerManagerId ===
      team.managerId
      ? "W"
      : "L";
  }

  if (team.points > opponent.points) {
    return "W";
  }

  if (team.points < opponent.points) {
    return "L";
  }

  if (game.isPlayoffs) {
    throw new Error(
      "Tied playoff game requires " +
      "a verified official result."
    );
  }

  return "T";
}

function createManagerRecord(
  manager: (typeof ACTIVE_MANAGERS)[number]
) {
  return {
    managerId: manager.id,
    name: manager.name,

    career: emptyRecord(),
    regularSeason: emptyRecord(),
    playoffs: emptyRecord(),

    seasons: new Set<number>(),

    longestWinStreak: 0,
    longestLossStreak: 0,

    currentStreak: {
      type: "" as Outcome | "",
      length: 0,
    },

    highestScore: null as number | null,
    lowestScore: null as number | null,

    biggestWin: null as number | null,
    biggestLoss: null as number | null,
  };
}

export function calculateLifetimeRecords(
  input: readonly HistoricalGame[]
) {
  const games = [...input].sort(
    (a, b) =>
      a.season - b.season ||
      a.week - b.week
  );

  const managers = new Map(
    ACTIVE_MANAGERS.map(manager => [
      manager.id,
      createManagerRecord(manager),
    ])
  );

  const headToHead = new Map<
    string,
    {
      managerId: string;
      opponentId: string;
      record: RecordTotals;
    }
  >();

  const appearances = new Set<string>();

  let gamesAnalyzed = 0;
  let excludedGames = 0;

  for (const game of games) {
    if (
      !Number.isInteger(game.season) ||
      game.season < LEAGUE_START_YEAR ||
      !Number.isInteger(game.week) ||
      game.week < 1 ||
      game.week > 18 ||
      !game.a.managerId ||
      !game.b.managerId ||
      game.a.managerId === game.b.managerId ||
      !Number.isFinite(game.a.points) ||
      !Number.isFinite(game.b.points)
    ) {
      throw new Error(
        "Invalid historical matchup."
      );
    }

    if (
      game.winnerManagerId !== undefined &&
      game.winnerManagerId !== null &&
      game.winnerManagerId !==
        game.a.managerId &&
      game.winnerManagerId !==
        game.b.managerId
    ) {
      throw new Error(
        "Invalid official matchup winner."
      );
    }

    if (
      game.winnerManagerId === null &&
      game.a.points !== game.b.points
    ) {
      throw new Error(
        "Tied result conflicts with scores."
      );
    }

    for (const team of [game.a, game.b]) {
      const appearance =
        `${game.season}:${game.week}:` +
        team.managerId;

      if (appearances.has(appearance)) {
        throw new Error(
          "Duplicate historical team appearance."
        );
      }

      appearances.add(appearance);
    }

    const activeA = isActiveManager(
      game.a.managerId
    );

    const activeB = isActiveManager(
      game.b.managerId
    );

    if (!activeA && !activeB) {
      excludedGames++;
      continue;
    }

    gamesAnalyzed++;

    const sides = [
      [game.a, game.b],
      [game.b, game.a],
    ] as const;

    for (const [team, opponent] of sides) {
      if (!isActiveManager(team.managerId)) {
        continue;
      }

      const manager = managers.get(
        team.managerId
      );

      if (!manager) continue;

      const outcome = getOutcome(
        game,
        team,
        opponent
      );

      manager.seasons.add(game.season);

      addResult(
        manager.career,
        outcome,
        team.points,
        opponent.points
      );

      addResult(
        game.isPlayoffs
          ? manager.playoffs
          : manager.regularSeason,
        outcome,
        team.points,
        opponent.points
      );

      manager.highestScore =
        manager.highestScore === null
          ? team.points
          : Math.max(
              manager.highestScore,
              team.points
            );

      manager.lowestScore =
        manager.lowestScore === null
          ? team.points
          : Math.min(
              manager.lowestScore,
              team.points
            );

      if (
        manager.currentStreak.type ===
        outcome
      ) {
        manager.currentStreak.length++;
      } else {
        manager.currentStreak = {
          type: outcome,
          length: 1,
        };
      }

      if (outcome === "W") {
        manager.longestWinStreak = Math.max(
          manager.longestWinStreak,
          manager.currentStreak.length
        );
      }

      if (outcome === "L") {
        manager.longestLossStreak = Math.max(
          manager.longestLossStreak,
          manager.currentStreak.length
        );
      }

      const margin = round(
        team.points - opponent.points
      );

      if (outcome === "W") {
        manager.biggestWin = Math.max(
          manager.biggestWin ?? 0,
          margin
        );
      }

      if (outcome === "L") {
        manager.biggestLoss = Math.max(
          manager.biggestLoss ?? 0,
          -margin
        );
      }

      // Only current managers appear
      // in the head-to-head record book.

      if (
        isActiveManager(
          opponent.managerId
        )
      ) {
        const key =
          `${team.managerId}:` +
          opponent.managerId;

        const rivalry =
          headToHead.get(key) ?? {
            managerId: team.managerId,
            opponentId: opponent.managerId,
            record: emptyRecord(),
          };

        addResult(
          rivalry.record,
          outcome,
          team.points,
          opponent.points
        );

        headToHead.set(key, rivalry);
      }
    }
  }

  const managerRecords = [
    ...managers.values(),
  ].map(manager => ({
    managerId: manager.managerId,
    name: manager.name,

    seasonsPlayed: manager.seasons.size,

    seasons: [...manager.seasons].sort(
      (a, b) => a - b
    ),

    career: summarize(manager.career),

    regularSeason: summarize(
      manager.regularSeason
    ),

    playoffs: summarize(
      manager.playoffs
    ),

    longestWinStreak:
      manager.longestWinStreak,

    longestLossStreak:
      manager.longestLossStreak,

    currentStreak:
      manager.currentStreak,

    highestScore:
      manager.highestScore,

    lowestScore:
      manager.lowestScore,

    biggestWin:
      manager.biggestWin,

    biggestLoss:
      manager.biggestLoss,
  }));

  return {
    gamesAnalyzed,
    excludedGames,

    managers: managerRecords.sort(
      (a, b) =>
        b.career.wins - a.career.wins ||
        b.career.pointsFor -
          a.career.pointsFor
    ),

    headToHead: [...headToHead.values()]
      .map(rivalry => ({
        managerId: rivalry.managerId,
        opponentId: rivalry.opponentId,
        ...summarize(rivalry.record),
      })),

    note:
      "Statistics reflect supplied matchups only. " +
      "Complete historical coverage must be verified.",
  };
}
