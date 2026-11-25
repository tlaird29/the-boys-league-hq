
import type {
  HistoricalGame,
} from "./lifetime-records";

import type {
  CompletedSeason,
  FinalStanding,
} from "./championship-history";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  ResolvedHistoricalTeam,
} from "./historical-manager-identity";

export type ChampionshipRound = {
  week: number;

  round:
    | "quarterfinal"
    | "semifinal"
    | "championship";

  matchups: readonly {
    teamAKey: string;
    teamBKey: string;
  }[];

  byeTeamKeys: readonly string[];
};

export type ChampionshipBracket = {
  season: number;
  leagueKey: string;
  sourceVerified: boolean;

  playoffTeamKeys: readonly string[];

  rounds:
    readonly ChampionshipRound[];
};

export type OfficialFinalPlacement = {
  teamKey: string;
  teamName: string;
  rank: number;
};

export type OfficialFinalResults = {
  season: number;
  leagueKey: string;
  finished: boolean;
  sourceVerified: boolean;

  placements:
    readonly OfficialFinalPlacement[];
};

export function verifyChampionshipBracket(
  league: HistoricalLeague,
  teams: readonly ResolvedHistoricalTeam[],
  games: readonly HistoricalGame[],
  bracket: ChampionshipBracket,
  finalResults: OfficialFinalResults
) {
  const issues: string[] = [];

  const teamMap = new Map(
    teams.map(team => [
      team.teamKey,
      team,
    ])
  );

  const managerIds = new Set(
    teams.map(team => team.managerId)
  );

  if (
    teams.length !== league.teamCount ||
    teamMap.size !== teams.length ||
    managerIds.size !== teams.length ||
    teams.some(
      team =>
        team.season !== league.season ||
        team.leagueKey !== league.key ||
        !team.managerId.trim() ||
        !team.teamKey.startsWith(
          `${league.key}.t.`
        )
    )
  ) {
    issues.push(
      "Invalid historical manager coverage."
    );
  }

  if (!league.finished) {
    issues.push(
      "League season is not finished."
    );
  }

  if (
    !bracket.sourceVerified ||
    bracket.season !== league.season ||
    bracket.leagueKey !== league.key
  ) {
    issues.push(
      "Championship bracket source is not verified."
    );
  }

  if (
    !finalResults.sourceVerified ||
    !finalResults.finished ||
    finalResults.season !== league.season ||
    finalResults.leagueKey !== league.key
  ) {
    issues.push(
      "Official final results are not verified."
    );
  }

  let eligible = new Set(
    bracket.playoffTeamKeys
  );

  if (
    eligible.size < 2 ||
    eligible.size !==
      bracket.playoffTeamKeys.length ||
    [...eligible].some(
      key => !teamMap.has(key)
    )
  ) {
    issues.push(
      "Invalid championship playoff membership."
    );
  }

  const rounds = [...bracket.rounds]
    .sort(
      (a, b) => a.week - b.week
    );

  const roundOrder = {
    quarterfinal: 1,
    semifinal: 2,
    championship: 3,
  };

  const seenWeeks = new Set<number>();

  const seenRounds = new Set<string>();

  let previousRound = 0;

  let championId: string | null = null;
  let runnerUpId: string | null = null;

  let championshipGame:
    HistoricalGame | null = null;

  const playoffWins =
    new Map<string, number>();

  const playoffLosses =
    new Map<string, number>();

  const playoffByes =
    new Map<string, number>();

  const verifiedMatchups:
    HistoricalGame[] = [];

  const roundResults: {
    week: number;
    round: ChampionshipRound["round"];
    winners: string[];
    eliminated: string[];
    byes: string[];
  }[] = [];

  if (rounds.length === 0) {
    issues.push(
      "No championship rounds supplied."
    );
  }

  for (const round of rounds) {
    const order =
      roundOrder[round.round];

    if (
      !Number.isInteger(round.week) ||
      round.week < league.startWeek ||
      round.week > league.endWeek ||
      !order ||
      order <= previousRound ||
      seenWeeks.has(round.week) ||
      seenRounds.has(round.round)
    ) {
      issues.push(
        "Invalid championship round sequence."
      );

      continue;
    }

    previousRound = order;

    seenWeeks.add(round.week);
    seenRounds.add(round.round);

    const nextEligible =
      new Set<string>();

    const participants =
      new Set<string>();

    const winners: string[] = [];
    const eliminated: string[] = [];
    const byes: string[] = [];

    if (
      round.round === "championship" &&
      (
        round.matchups.length !== 1 ||
        round.byeTeamKeys.length !== 0 ||
        eligible.size !== 2
      )
    ) {
      issues.push(
        "Championship must contain exactly two finalists."
      );
    }

    if (round.matchups.length === 0) {
      issues.push(
        "Championship round contains no matchups."
      );
    }

    for (const teamKey of round.byeTeamKeys) {
      const team = teamMap.get(teamKey);

      if (
        !team ||
        !eligible.has(teamKey) ||
        participants.has(teamKey) ||
        round.round === "championship"
      ) {
        issues.push(
          "Invalid championship bye."
        );

        continue;
      }

      participants.add(teamKey);
      nextEligible.add(teamKey);

      byes.push(team.managerId);

      playoffByes.set(
        team.managerId,
        (
          playoffByes.get(
            team.managerId
          ) ?? 0
        ) + 1
      );
    }

    for (const matchup of round.matchups) {
      const teamA = teamMap.get(
        matchup.teamAKey
      );

      const teamB = teamMap.get(
        matchup.teamBKey
      );

      if (
        !teamA ||
        !teamB ||
        teamA.managerId ===
          teamB.managerId ||
        !eligible.has(teamA.teamKey) ||
        !eligible.has(teamB.teamKey) ||
        participants.has(teamA.teamKey) ||
        participants.has(teamB.teamKey)
      ) {
        issues.push(
          `Invalid bracket participants in week ${round.week}.`
        );

        continue;
      }

      participants.add(teamA.teamKey);
      participants.add(teamB.teamKey);

      const matchingGames = games.filter(
        game =>
          game.season === league.season &&
          game.week === round.week &&
          game.isPlayoffs &&
          (
            (
              game.a.managerId ===
                teamA.managerId &&
              game.b.managerId ===
                teamB.managerId
            ) ||
            (
              game.a.managerId ===
                teamB.managerId &&
              game.b.managerId ===
                teamA.managerId
            )
          )
      );

      if (matchingGames.length !== 1) {
        issues.push(
          `Missing or duplicated playoff matchup in week ${round.week}.`
        );

        continue;
      }

      const game = matchingGames[0];

      const winner =
        game.winnerManagerId;

      if (
        !Number.isFinite(game.a.points) ||
        !Number.isFinite(game.b.points) ||
        !winner ||
        (
          winner !== game.a.managerId &&
          winner !== game.b.managerId
        )
      ) {
        issues.push(
          "Playoff winner or tiebreaker is unverified."
        );

        continue;
      }

      const winnerPoints =
        winner === game.a.managerId
          ? game.a.points
          : game.b.points;

      const loserPoints =
        winner === game.a.managerId
          ? game.b.points
          : game.a.points;

      if (winnerPoints < loserPoints) {
        issues.push(
          "Playoff winner conflicts with scores."
        );

        continue;
      }

      const winningTeam =
        winner === teamA.managerId
          ? teamA
          : teamB;

      const losingTeam =
        winner === teamA.managerId
          ? teamB
          : teamA;

      nextEligible.add(
        winningTeam.teamKey
      );

      winners.push(
        winningTeam.managerId
      );

      eliminated.push(
        losingTeam.managerId
      );

      verifiedMatchups.push(game);

      playoffWins.set(
        winningTeam.managerId,
        (
          playoffWins.get(
            winningTeam.managerId
          ) ?? 0
        ) + 1
      );

      playoffLosses.set(
        losingTeam.managerId,
        (
          playoffLosses.get(
            losingTeam.managerId
          ) ?? 0
        ) + 1
      );

      if (
        round.round === "championship"
      ) {
        championId =
          winningTeam.managerId;

        runnerUpId =
          losingTeam.managerId;

        championshipGame = game;
      }
    }

    if (
      participants.size !== eligible.size ||
      [...eligible].some(
        key => !participants.has(key)
      )
    ) {
      issues.push(
        `Incomplete championship round in week ${round.week}.`
      );
    }

    eligible = nextEligible;

    roundResults.push({
      week: round.week,
      round: round.round,
      winners,
      eliminated,
      byes,
    });
  }

  if (
    !seenRounds.has("championship") ||
    !championId ||
    !runnerUpId ||
    !championshipGame ||
    eligible.size !== 1
  ) {
    issues.push(
      "Championship result could not be established."
    );
  }

  const finalStandings:
    FinalStanding[] = [];

  const seenRanks = new Set<number>();

  const seenFinalManagers =
    new Set<string>();

  for (
    const placement of finalResults.placements
  ) {
    const team = teamMap.get(
      placement.teamKey
    );

    if (
      !team ||
      !placement.teamName.trim() ||
      !Number.isInteger(placement.rank) ||
      placement.rank < 1 ||
      placement.rank > league.teamCount ||
      seenRanks.has(placement.rank) ||
      seenFinalManagers.has(
        team.managerId
      )
    ) {
      issues.push(
        "Invalid official final placement."
      );

      continue;
    }

    seenRanks.add(placement.rank);

    seenFinalManagers.add(
      team.managerId
    );

    finalStandings.push({
      managerId: team.managerId,
      teamName: placement.teamName.trim(),
      rank: placement.rank,
    });
  }

  if (
    finalStandings.length !==
    league.teamCount
  ) {
    issues.push(
      "Official final standings are incomplete."
    );
  }

  const officialChampion =
    finalStandings.find(
      team => team.rank === 1
    );

  const officialRunnerUp =
    finalStandings.find(
      team => team.rank === 2
    );

  if (
    !officialChampion ||
    officialChampion.managerId !==
      championId
  ) {
    issues.push(
      "Championship winner conflicts with final standings."
    );
  }

  if (
    !officialRunnerUp ||
    officialRunnerUp.managerId !==
      runnerUpId
  ) {
    issues.push(
      "Championship runner-up conflicts with final standings."
    );
  }

  const verified =
    issues.length === 0;

  const completedSeason:
    CompletedSeason | null = verified
      ? {
          season: league.season,
          finished: true,
          standingsVerified: true,
          standings: finalStandings.sort(
            (a, b) => a.rank - b.rank
          ),
        }
      : null;

  return {
    season: league.season,

    verified,

    status: verified
      ? "verified" as const
      : "needs-review" as const,

    champion: verified
      ? officialChampion ?? null
      : null,

    runnerUp: verified
      ? officialRunnerUp ?? null
      : null,

    championshipGame: verified
      ? championshipGame
      : null,

    championshipMatchupsVerified:
      verifiedMatchups.length,

    roundResults,

    managerPlayoffRecords: verified
      ? teams.map(team => ({
          managerId: team.managerId,
          managerName: team.managerName,

          wins:
            playoffWins.get(
              team.managerId
            ) ?? 0,

          losses:
            playoffLosses.get(
              team.managerId
            ) ?? 0,

          byes:
            playoffByes.get(
              team.managerId
            ) ?? 0,

          championshipWinner:
            team.managerId === championId,

          championshipRunnerUp:
            team.managerId === runnerUpId,
        }))
      : [],

    completedSeason,

    issues,

    readyForPublication: false,

    note:
      "Championship results require " +
      "verified bracket progression and " +
      "agreement with official final " +
      "placements. Season reconciliation " +
      "and data-use authorization are " +
      "separate requirements.",
  };
}
