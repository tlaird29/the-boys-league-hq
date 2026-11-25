
import {
  ACTIVE_MANAGERS,
  isActiveManager,
  findManagerById,
} from "./league-managers";

import {
  calculateLifetimeRecords,
  type HistoricalGame,
} from "./lifetime-records";

export type RivalryOutcome = "W" | "L" | "T";

export type RivalryMeeting = {
  id: string;
  season: number;
  week: number;
  isPlayoffs: boolean;
  managerId: string;
  opponentId: string;
  teamName: string;
  opponentTeamName: string;
  points: number;
  opponentPoints: number;
  outcome: RivalryOutcome;
  margin: number;
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function summarize(
  meetings: readonly RivalryMeeting[]
) {
  const wins = meetings.filter(
    game => game.outcome === "W"
  ).length;

  const losses = meetings.filter(
    game => game.outcome === "L"
  ).length;

  const ties = meetings.filter(
    game => game.outcome === "T"
  ).length;

  const games = meetings.length;

  const pointsFor = round(
    meetings.reduce(
      (sum, game) => sum + game.points,
      0
    )
  );

  const pointsAgainst = round(
    meetings.reduce(
      (sum, game) =>
        sum + game.opponentPoints,
      0
    )
  );

  return {
    games,
    wins,
    losses,
    ties,
    pointsFor,
    pointsAgainst,

    winPercentage: games
      ? round(
          (wins + ties * 0.5) /
          games * 100
        )
      : null,

    pointsPerGame: games
      ? round(pointsFor / games)
      : null,

    opponentPointsPerGame: games
      ? round(pointsAgainst / games)
      : null,

    pointDifferential: round(
      pointsFor - pointsAgainst
    ),
  };
}

export type RivalryTotals =
  ReturnType<typeof summarize>;

export type RivalryRecord = {
  managerId: string;
  managerName: string;
  opponentId: string;
  opponentName: string;

  combined: RivalryTotals;
  regularSeason: RivalryTotals;
  playoffs: RivalryTotals;

  longestWinStreak: number;
  longestLossStreak: number;

  currentStreak: {
    type: RivalryOutcome | null;
    length: number;
  };

  biggestWin: RivalryMeeting | null;
  biggestLoss: RivalryMeeting | null;
  closestGame: RivalryMeeting | null;

  highestScore: number | null;
  lowestScore: number | null;

  firstMeeting: RivalryMeeting | null;
  latestMeeting: RivalryMeeting | null;

  meetings: RivalryMeeting[];
};

export function calculateRivalryRecords(
  games: readonly HistoricalGame[],
  historicalCoverageVerified = false
) {
  if (!historicalCoverageVerified) {
    return {
      verified: false,
      issues: [
        "Historical coverage has not been verified.",
      ],
      records: [] as RivalryRecord[],
      officialGames: 0,
      activeRivalryGames: 0,
      readyForPublication: false,
    };
  }

  try {
    if (games.length === 0) {
      throw new Error(
        "No historical games supplied."
      );
    }

    // Reuse existing historical validation.
    calculateLifetimeRecords(games);

    const ordered = [...games].sort(
      (a, b) =>
        a.season - b.season ||
        a.week - b.week
    );

    const buckets = new Map<
      string,
      RivalryMeeting[]
    >();

    let activeRivalryGames = 0;

    for (const game of ordered) {
      if (
        typeof game.isPlayoffs !== "boolean" ||
        !game.a.teamName.trim() ||
        !game.b.teamName.trim()
      ) {
        throw new Error(
          "Invalid historical matchup metadata."
        );
      }

      if (
        game.winnerManagerId === undefined
      ) {
        throw new Error(
          "Official matchup result is missing."
        );
      }

      if (
        game.isPlayoffs &&
        game.winnerManagerId === null
      ) {
        throw new Error(
          "Playoff result has no official winner."
        );
      }

      if (
        game.winnerManagerId ===
          game.a.managerId &&
        game.a.points < game.b.points
      ) {
        throw new Error(
          "Official winner conflicts with scores."
        );
      }

      if (
        game.winnerManagerId ===
          game.b.managerId &&
        game.b.points < game.a.points
      ) {
        throw new Error(
          "Official winner conflicts with scores."
        );
      }

      if (
        !game.isPlayoffs &&
        game.a.points === game.b.points &&
        game.winnerManagerId !== null
      ) {
        throw new Error(
          "Regular-season tie conflicts with result."
        );
      }

      if (
        !isActiveManager(game.a.managerId) ||
        !isActiveManager(game.b.managerId)
      ) {
        continue;
      }

      activeRivalryGames++;

      const sides = [
        [game.a, game.b],
        [game.b, game.a],
      ] as const;

      for (const [team, opponent] of sides) {
        const outcome: RivalryOutcome =
          game.winnerManagerId === null
            ? "T"
            : game.winnerManagerId ===
                team.managerId
              ? "W"
              : "L";

        const key =
          `${team.managerId}:${opponent.managerId}`;

        const meeting: RivalryMeeting = {
          id:
            `${game.season}:${game.week}:${key}`,

          season: game.season,
          week: game.week,
          isPlayoffs: game.isPlayoffs,

          managerId: team.managerId,
          opponentId: opponent.managerId,

          teamName: team.teamName,
          opponentTeamName: opponent.teamName,

          points: team.points,
          opponentPoints: opponent.points,

          outcome,

          margin: round(
            team.points - opponent.points
          ),
        };

        const history = buckets.get(key) ?? [];

        history.push(meeting);

        buckets.set(key, history);
      }
    }

    const records: RivalryRecord[] = [];

    for (const manager of ACTIVE_MANAGERS) {
      for (const opponent of ACTIVE_MANAGERS) {
        if (manager.id === opponent.id) {
          continue;
        }

        const key =
          `${manager.id}:${opponent.id}`;

        const meetings =
          buckets.get(key) ?? [];

        let longestWinStreak = 0;
        let longestLossStreak = 0;

        let currentType:
          RivalryOutcome | null = null;

        let currentLength = 0;

        for (const meeting of meetings) {
          if (
            currentType === meeting.outcome
          ) {
            currentLength++;
          } else {
            currentType = meeting.outcome;
            currentLength = 1;
          }

          if (currentType === "W") {
            longestWinStreak = Math.max(
              longestWinStreak,
              currentLength
            );
          }

          if (currentType === "L") {
            longestLossStreak = Math.max(
              longestLossStreak,
              currentLength
            );
          }
        }

        const wins = meetings
          .filter(
            game => game.outcome === "W"
          )
          .sort(
            (a, b) => b.margin - a.margin
          );

        const losses = meetings
          .filter(
            game => game.outcome === "L"
          )
          .sort(
            (a, b) => a.margin - b.margin
          );

        const closest = meetings
          .filter(
            game => game.outcome !== "T"
          )
          .sort(
            (a, b) =>
              Math.abs(a.margin) -
              Math.abs(b.margin)
          );

        records.push({
          managerId: manager.id,
          managerName: manager.name,

          opponentId: opponent.id,
          opponentName: opponent.name,

          combined: summarize(meetings),

          regularSeason: summarize(
            meetings.filter(
              game => !game.isPlayoffs
            )
          ),

          playoffs: summarize(
            meetings.filter(
              game => game.isPlayoffs
            )
          ),

          longestWinStreak,
          longestLossStreak,

          currentStreak: {
            type: currentType,
            length: currentLength,
          },

          biggestWin: wins[0] ?? null,
          biggestLoss: losses[0] ?? null,
          closestGame: closest[0] ?? null,

          highestScore: meetings.length
            ? Math.max(
                ...meetings.map(
                  game => game.points
                )
              )
            : null,

          lowestScore: meetings.length
            ? Math.min(
                ...meetings.map(
                  game => game.points
                )
              )
            : null,

          firstMeeting:
            meetings[0] ?? null,

          latestMeeting:
            meetings[meetings.length - 1] ??
            null,

          meetings: [...meetings].reverse(),
        });
      }
    }

    return {
      verified: true,
      issues: [] as string[],
      records,
      officialGames: games.length,
      activeRivalryGames,
      readyForPublication: false,
    };
  } catch (error) {
    return {
      verified: false,

      issues: [
        error instanceof Error
          ? error.message
          : "Historical rivalry calculation failed.",
      ],

      records: [] as RivalryRecord[],
      officialGames: 0,
      activeRivalryGames: 0,
      readyForPublication: false,
    };
  }
}

export function getRivalryRecord(
  records: readonly RivalryRecord[],
  managerId: string,
  opponentId: string
): RivalryRecord | null {
  if (
    managerId === opponentId ||
    !findManagerById(managerId) ||
    !findManagerById(opponentId)
  ) {
    return null;
  }

  return records.find(
    record =>
      record.managerId === managerId &&
      record.opponentId === opponentId
  ) ?? null;
}
