
import type {
  RivalryRecord,
  RivalryMeeting,
} from "./rivalry-records";

export type RivalryLeaderboardEntry = {
  managerId: string;
  managerName: string;
  opponentId: string;
  opponentName: string;
  value: number;
};

export function buildRivalryLeaderboards(
  records: readonly RivalryRecord[],
  verified: boolean,
  limit = 10
) {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 45
  ) {
    throw new Error(
      "Invalid rivalry leaderboard limit."
    );
  }

  const uniquePairs = records.filter(
    record =>
      record.managerId.localeCompare(
        record.opponentId
      ) < 0 &&
      record.combined.games > 0
  );

  const meetings = uniquePairs.flatMap(
    record => record.meetings
  );

  const decided = meetings.filter(
    meeting => meeting.outcome !== "T"
  );

  function rank(
    source: readonly RivalryRecord[],
    metric: (
      record: RivalryRecord
    ) => number,
    minimum = 1
  ): RivalryLeaderboardEntry[] {
    return source
      .map(record => ({
        managerId: record.managerId,
        managerName: record.managerName,

        opponentId: record.opponentId,
        opponentName: record.opponentName,

        value: metric(record),
      }))
      .filter(
        entry =>
          Number.isFinite(entry.value) &&
          entry.value >= minimum
      )
      .sort(
        (a, b) =>
          b.value - a.value ||
          a.managerId.localeCompare(
            b.managerId
          ) ||
          a.opponentId.localeCompare(
            b.opponentId
          )
      )
      .slice(0, limit);
  }

  function normalizeWinner(
    game: RivalryMeeting
  ): RivalryMeeting {
    if (game.outcome === "W") {
      return game;
    }

    return {
      ...game,

      managerId: game.opponentId,
      opponentId: game.managerId,

      teamName: game.opponentTeamName,
      opponentTeamName: game.teamName,

      points: game.opponentPoints,
      opponentPoints: game.points,

      outcome: "W",

      margin: Math.abs(game.margin),
    };
  }

  function compareDate(
    a: RivalryMeeting,
    b: RivalryMeeting
  ) {
    return (
      a.season - b.season ||
      a.week - b.week ||
      a.id.localeCompare(b.id)
    );
  }

  const biggestBlowouts = decided
    .map(normalizeWinner)
    .sort(
      (a, b) =>
        b.margin - a.margin ||
        compareDate(a, b)
    )
    .slice(0, limit);

  const closestGames = decided
    .map(normalizeWinner)
    .sort(
      (a, b) =>
        a.margin - b.margin ||
        compareDate(a, b)
    )
    .slice(0, limit);

  const highestCombinedScores = meetings
    .map(game => ({
      ...game,

      combinedPoints:
        Math.round(
          (game.points +
            game.opponentPoints) * 100
        ) / 100,
    }))
    .sort(
      (a, b) =>
        b.combinedPoints -
          a.combinedPoints ||
        compareDate(a, b)
    )
    .slice(0, limit);

  const mostCompetitiveRivalries =
    uniquePairs
      .filter(
        record =>
          record.combined.games >= 5
      )
      .map(record => ({
        managerId: record.managerId,
        managerName: record.managerName,

        opponentId: record.opponentId,
        opponentName: record.opponentName,

        games: record.combined.games,

        wins: record.combined.wins,
        losses: record.combined.losses,
        ties: record.combined.ties,

        distanceFromEven:
          Math.abs(
            record.combined.wins -
            record.combined.losses
          ) / record.combined.games,
      }))
      .sort(
        (a, b) =>
          a.distanceFromEven -
            b.distanceFromEven ||
          b.games - a.games ||
          a.managerId.localeCompare(
            b.managerId
          ) ||
          a.opponentId.localeCompare(
            b.opponentId
          )
      )
      .slice(0, limit);

  return {
    verified,

    uniqueRivalries: verified
      ? uniquePairs.length
      : 0,

    gamesAnalyzed: verified
      ? meetings.length
      : 0,

    mostPlayed: verified
      ? rank(
          uniquePairs,
          record => record.combined.games
        )
      : [],

    mostPlayoffMeetings: verified
      ? rank(
          uniquePairs,
          record => record.playoffs.games
        )
      : [],

    longestWinningStreaks: verified
      ? rank(
          records,
          record => record.longestWinStreak
        )
      : [],

    activeWinningStreaks: verified
      ? rank(
          records,
          record =>
            record.currentStreak.type === "W"
              ? record.currentStreak.length
              : 0
        )
      : [],

    mostWinsAgainstOpponent: verified
      ? rank(
          records,
          record => record.combined.wins
        )
      : [],

    mostPlayoffWinsAgainstOpponent:
      verified
        ? rank(
            records,
            record => record.playoffs.wins
          )
        : [],

    biggestBlowouts: verified
      ? biggestBlowouts
      : [],

    closestGames: verified
      ? closestGames
      : [],

    highestCombinedScores: verified
      ? highestCombinedScores
      : [],

    mostCompetitiveRivalries: verified
      ? mostCompetitiveRivalries
      : [],

    readyForPublication: false,
  };
}
