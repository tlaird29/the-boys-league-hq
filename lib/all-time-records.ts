
import {
  ACTIVE_MANAGERS,
  findManagerById,
  isActiveManager,
} from "./league-managers";

import {
  calculateLifetimeRecords,
  type HistoricalGame,
} from "./lifetime-records";

import {
  calculateChampionshipHistory,
  type CompletedSeason,
} from "./championship-history";

import {
  calculateTeamNameHistory,
  type TeamNameObservation,
} from "./team-name-history";

type Scope =
  | "all"
  | "regular-season"
  | "playoffs";

type ScoreEntry = {
  season: number;
  week: number;
  managerId: string;
  managerName: string;
  teamName: string;
  points: number;
  opponentName: string;
  isPlayoffs: boolean;
};

type MarginEntry = {
  season: number;
  week: number;
  winnerId: string;
  winnerName: string;
  winnerTeam: string;
  winnerPoints: number;
  loserId: string;
  loserName: string;
  loserTeam: string;
  loserPoints: number;
  margin: number;
  isPlayoffs: boolean;
};

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function managerName(id: string): string {
  return (
    findManagerById(id)?.name ??
    "Historical opponent"
  );
}

function filterGames(
  games: readonly HistoricalGame[],
  scope: Scope
) {
  return games.filter(game => {
    if (scope === "regular-season") {
      return !game.isPlayoffs;
    }

    if (scope === "playoffs") {
      return game.isPlayoffs;
    }

    return true;
  });
}

function getScoreEntries(
  games: readonly HistoricalGame[]
): ScoreEntry[] {
  const entries: ScoreEntry[] = [];

  for (const game of games) {
    const sides = [
      [game.a, game.b],
      [game.b, game.a],
    ] as const;

    for (const [team, opponent] of sides) {
      if (!isActiveManager(team.managerId)) {
        continue;
      }

      entries.push({
        season: game.season,
        week: game.week,

        managerId: team.managerId,

        managerName: managerName(
          team.managerId
        ),

        teamName: team.teamName,
        points: team.points,

        opponentName: managerName(
          opponent.managerId
        ),

        isPlayoffs: game.isPlayoffs,
      });
    }
  }

  return entries;
}

function getMarginEntries(
  games: readonly HistoricalGame[]
): MarginEntry[] {
  const entries: MarginEntry[] = [];

  for (const game of games) {
    if (game.winnerManagerId === null) {
      continue;
    }

    const winnerId =
      game.winnerManagerId ??
      (
        game.a.points > game.b.points
          ? game.a.managerId
          : game.b.points > game.a.points
            ? game.b.managerId
            : null
      );

    if (!winnerId) continue;

    const winner =
      game.a.managerId === winnerId
        ? game.a
        : game.b;

    const loser =
      winner === game.a
        ? game.b
        : game.a;

    if (
      !isActiveManager(winner.managerId) &&
      !isActiveManager(loser.managerId)
    ) {
      continue;
    }

    const margin = round(
      winner.points - loser.points
    );

    // Exclude unusual official results
    // from score-based margin rankings.

    if (margin < 0) continue;

    entries.push({
      season: game.season,
      week: game.week,

      winnerId: winner.managerId,

      winnerName: managerName(
        winner.managerId
      ),

      winnerTeam: winner.teamName,
      winnerPoints: winner.points,

      loserId: loser.managerId,

      loserName: managerName(
        loser.managerId
      ),

      loserTeam: loser.teamName,
      loserPoints: loser.points,

      margin,

      isPlayoffs: game.isPlayoffs,
    });
  }

  return entries;
}

function buildSeasonRecords(
  games: readonly HistoricalGame[],
  completedSeasons: ReadonlySet<number>
) {
  const years = [
    ...new Set(
      games.map(game => game.season)
    ),
  ].sort((a, b) => a - b);

  return years.flatMap(season => {
    const seasonGames = games.filter(
      game => game.season === season
    );

    const records =
      calculateLifetimeRecords(
        seasonGames
      );

    return records.managers
      .filter(
        manager =>
          manager.career.games > 0
      )
      .map(manager => ({
        season,

        seasonFinished:
          completedSeasons.has(season),

        managerId: manager.managerId,
        managerName: manager.name,

        ...manager.career,

        longestWinStreak:
          manager.longestWinStreak,

        longestLossStreak:
          manager.longestLossStreak,
      }));
  });
}

function buildRecordCategory(
  games: readonly HistoricalGame[],
  completedSeasons: ReadonlySet<number>,
  limit: number
) {
  const scores = getScoreEntries(games);

  const margins = getMarginEntries(games);

  const lifetime =
    calculateLifetimeRecords(games);

  const seasonRecords =
    buildSeasonRecords(
      games,
      completedSeasons
    );

  const activeRecords =
    lifetime.managers.filter(
      manager => manager.career.games > 0
    );

  return {
    highestWeeklyScores: [...scores]
      .sort((a, b) => b.points - a.points)
      .slice(0, limit),

    lowestWeeklyScores: [...scores]
      .sort((a, b) => a.points - b.points)
      .slice(0, limit),

    biggestVictories: [...margins]
      .filter(
        entry =>
          isActiveManager(entry.winnerId)
      )
      .sort((a, b) => b.margin - a.margin)
      .slice(0, limit),

    biggestDefeats: [...margins]
      .filter(
        entry =>
          isActiveManager(entry.loserId)
      )
      .sort((a, b) => b.margin - a.margin)
      .slice(0, limit),

    closestVictories: [...margins]
      .filter(
        entry =>
          isActiveManager(entry.winnerId)
      )
      .sort((a, b) => a.margin - b.margin)
      .slice(0, limit),

    mostCareerWins: [...activeRecords]
      .sort(
        (a, b) =>
          b.career.wins -
          a.career.wins
      )
      .slice(0, limit),

    mostCareerPoints: [...activeRecords]
      .sort(
        (a, b) =>
          b.career.pointsFor -
          a.career.pointsFor
      )
      .slice(0, limit),

    bestCareerWinPercentage:
      [...activeRecords]
        .sort(
          (a, b) =>
            (b.career.winPercentage ?? 0) -
            (a.career.winPercentage ?? 0)
        )
        .slice(0, limit),

    bestCareerScoringAverage:
      [...activeRecords]
        .sort(
          (a, b) =>
            (b.career.pointsPerGame ?? 0) -
            (a.career.pointsPerGame ?? 0)
        )
        .slice(0, limit),

    longestWinningStreaks:
      [...activeRecords]
        .filter(
          manager =>
            manager.longestWinStreak > 0
        )
        .sort(
          (a, b) =>
            b.longestWinStreak -
            a.longestWinStreak
        )
        .slice(0, limit),

    longestLosingStreaks:
      [...activeRecords]
        .filter(
          manager =>
            manager.longestLossStreak > 0
        )
        .sort(
          (a, b) =>
            b.longestLossStreak -
            a.longestLossStreak
        )
        .slice(0, limit),

    mostPointsInCompletedSeason:
      [...seasonRecords]
        .filter(
          record => record.seasonFinished
        )
        .sort(
          (a, b) =>
            b.pointsFor - a.pointsFor
        )
        .slice(0, limit),

    mostWinsInCompletedSeason:
      [...seasonRecords]
        .filter(
          record => record.seasonFinished
        )
        .sort(
          (a, b) =>
            b.wins - a.wins
        )
        .slice(0, limit),

    bestCompletedSeasonWinPercentage:
      [...seasonRecords]
        .filter(
          record => record.seasonFinished
        )
        .sort(
          (a, b) =>
            (b.winPercentage ?? 0) -
            (a.winPercentage ?? 0)
        )
        .slice(0, limit),

    bestCompletedSeasonScoringAverage:
      [...seasonRecords]
        .filter(
          record => record.seasonFinished
        )
        .sort(
          (a, b) =>
            (b.pointsPerGame ?? 0) -
            (a.pointsPerGame ?? 0)
        )
        .slice(0, limit),

    seasonRecords,
  };
}

export function calculateAllTimeRecords(
  games: readonly HistoricalGame[],
  seasons: readonly CompletedSeason[] = [],
  additionalTeamNames:
    readonly TeamNameObservation[] = [],
  limit = 25
) {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    throw new Error(
      "Invalid record ranking limit."
    );
  }

  // Validate the complete historical
  // matchup collection before ranking.

  const lifetime =
    calculateLifetimeRecords(games);

  const championshipHistory =
    calculateChampionshipHistory(
      seasons
    );

  const completedSeasons = new Set(
    championshipHistory.championships.map(
      championship => championship.season
    )
  );

  const observations:
    TeamNameObservation[] =
    games.flatMap(game =>
      [game.a, game.b].map(team => ({
        managerId: team.managerId,
        teamName: team.teamName,
        season: game.season,
        week: game.week,
      }))
    );

  const teamNameHistory =
    calculateTeamNameHistory(
      [
        ...observations,
        ...additionalTeamNames,
      ],
      championshipHistory
        .teamNameChampionships
    );

  const managerProfiles =
    ACTIVE_MANAGERS.map(manager => ({
      managerId: manager.id,
      managerName: manager.name,

      statistics:
        lifetime.managers.find(
          record =>
            record.managerId === manager.id
        ) ?? null,

      championships:
        championshipHistory
          .managerChampionships.find(
            record =>
              record.managerId === manager.id
          ) ?? null,

      teamNames:
        teamNameHistory.find(
          record =>
            record.managerId === manager.id
        ) ?? null,

      headToHead:
        lifetime.headToHead.filter(
          record =>
            record.managerId === manager.id
        ),
    }));

  return {
    gamesAnalyzed:
      lifetime.gamesAnalyzed,

    excludedGames:
      lifetime.excludedGames,

    seasonsAvailable: [
      ...new Set(
        games.map(game => game.season)
      ),
    ].sort((a, b) => a - b),

    managerProfiles,

    lifetime,

    teamNameHistory,

    championshipHistory,

    records: {
      allTime: buildRecordCategory(
        filterGames(games, "all"),
        completedSeasons,
        limit
      ),

      regularSeason: buildRecordCategory(
        filterGames(games, "regular-season"),
        completedSeasons,
        limit
      ),

      playoffs: buildRecordCategory(
        filterGames(games, "playoffs"),
        completedSeasons,
        limit
      ),
    },

    note:
      "Records reflect supplied matchups. " +
      "Historical coverage must be verified " +
      "before declaring official league records.",
  };
}
