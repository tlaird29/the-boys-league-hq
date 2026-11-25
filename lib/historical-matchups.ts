
import {
  nodes,
  field,
  extractGames,
} from "./season-analysis";

import type {
  HistoricalGame,
} from "./lifetime-records";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  ResolvedHistoricalTeam,
} from "./historical-manager-identity";

import type {
  YahooRequestSession,
} from "./yahoo-scoreboard";

export type HistoricalWeekResult = {
  season: number;
  week: number;
  leagueKey: string;
  games: HistoricalGame[];
  verified: boolean;
  issues: string[];
};

export function extractHistoricalWeek(
  payload: unknown,
  league: HistoricalLeague,
  teams: readonly ResolvedHistoricalTeam[],
  week: number
): HistoricalWeekResult {
  const issues: string[] = [];
  const games: HistoricalGame[] = [];

  if (
    !Number.isInteger(week) ||
    week < league.startWeek ||
    week > league.endWeek
  ) {
    throw new Error(
      "Invalid historical matchup week."
    );
  }

  const teamMap = new Map(
    teams.map(team => [
      team.teamKey,
      team,
    ])
  );

  if (
    teams.length !== league.teamCount ||
    teamMap.size !== teams.length ||
    new Set(
      teams.map(team => team.managerId)
    ).size !== teams.length ||
    teams.some(
      team =>
        team.season !== league.season ||
        team.leagueKey !== league.key ||
        !team.managerId
    )
  ) {
    throw new Error(
      "Historical manager mapping is incomplete."
    );
  }

  const returnedLeague = field(
    payload,
    "league_key"
  );

  if (returnedLeague !== league.key) {
    issues.push(
      "Unexpected league returned."
    );
  }

  const returnedWeek = field(
    payload,
    "week"
  );

  if (
    returnedWeek === undefined ||
    Number(returnedWeek) !== week
  ) {
    issues.push(
      "Requested week could not be verified."
    );
  }

  const matchups = nodes(payload)
    .filter(
      item =>
        item.matchup &&
        typeof item.matchup === "object"
    )
    .map(item => item.matchup);

  if (matchups.length === 0) {
    issues.push(
      "No historical matchups returned."
    );
  }

  const seenTeams = new Set<string>();

  for (const matchup of matchups) {
    const matchupWeek = field(
      matchup,
      "week"
    );

    if (
      matchupWeek === undefined ||
      Number(matchupWeek) !== week
    ) {
      issues.push(
        "Matchup week does not match request."
      );

      continue;
    }

    const status = field(
      matchup,
      "status"
    );

    const completed = field(
      matchup,
      "is_completed"
    );

    if (
      status !== "postevent" &&
      completed !== "1"
    ) {
      issues.push(
        "Unfinished historical matchup."
      );

      continue;
    }

    const playoffFlag = field(
      matchup,
      "is_playoffs"
    );

    if (
      playoffFlag !== "0" &&
      playoffFlag !== "1"
    ) {
      issues.push(
        "Playoff classification is missing."
      );

      continue;
    }

    const isPlayoffs =
      playoffFlag === "1";

    // Do not treat consolation games
    // as championship bracket games.

    const consolationFlag = field(
      matchup,
      "is_consolation"
    );

    if (consolationFlag === "1") {
      issues.push(
        "Consolation matchup requires separate classification."
      );

      continue;
    }

    const rawTeams = nodes(matchup)
      .filter(
        item =>
          item.team &&
          typeof item.team === "object"
      )
      .map(item => item.team);

    if (rawTeams.length !== 2) {
      issues.push(
        "Matchup does not contain exactly two teams."
      );

      continue;
    }

    let validScores = true;

    for (const rawTeam of rawTeams) {
      const pointObjects = nodes(rawTeam)
        .filter(
          item =>
            item.team_points &&
            typeof item.team_points === "object"
        );

      if (pointObjects.length !== 1) {
        validScores = false;
        break;
      }

      const rawPoints = field(
        pointObjects[0].team_points,
        "total"
      );

      if (
        rawPoints === undefined ||
        rawPoints.trim() === "" ||
        !Number.isFinite(
          Number(rawPoints)
        )
      ) {
        validScores = false;
        break;
      }
    }

    if (!validScores) {
      issues.push(
        "Missing or invalid matchup score."
      );

      continue;
    }

    const extracted = extractGames(
      { matchup },
      week
    );

    if (extracted.length !== 1) {
      issues.push(
        "Historical matchup scores could not be parsed."
      );

      continue;
    }

    const game = extracted[0];

    const managerA = teamMap.get(
      game.a.key
    );

    const managerB = teamMap.get(
      game.b.key
    );

    if (
      !managerA ||
      !managerB ||
      managerA.managerId ===
        managerB.managerId
    ) {
      issues.push(
        "Matchup contains an unverified manager."
      );

      continue;
    }

    if (
      seenTeams.has(game.a.key) ||
      seenTeams.has(game.b.key)
    ) {
      issues.push(
        "Duplicate team appearance detected."
      );

      continue;
    }

    const winnerKey = field(
      matchup,
      "winner_team_key"
    );

    const tieFlag = field(
      matchup,
      "is_tied"
    );

    let winnerManagerId:
      string | null;

    if (winnerKey) {
      if (
        winnerKey !== game.a.key &&
        winnerKey !== game.b.key
      ) {
        issues.push(
          "Invalid official matchup winner."
        );

        continue;
      }

      winnerManagerId =
        winnerKey === game.a.key
          ? managerA.managerId
          : managerB.managerId;

      const winnerPoints =
        winnerKey === game.a.key
          ? game.a.points
          : game.b.points;

      const loserPoints =
        winnerKey === game.a.key
          ? game.b.points
          : game.a.points;

      if (
        winnerPoints < loserPoints ||
        tieFlag === "1" ||
        (
          !isPlayoffs &&
          winnerPoints === loserPoints
        )
      ) {
        issues.push(
          "Official winner conflicts with matchup scores."
        );

        continue;
      }

    } else if (
      game.a.points === game.b.points &&
      !isPlayoffs &&
      tieFlag === "1"
    ) {
      winnerManagerId = null;

    } else {
      issues.push(
        "Official matchup outcome could not be verified."
      );

      continue;
    }

    seenTeams.add(game.a.key);
    seenTeams.add(game.b.key);

    games.push({
      season: league.season,
      week,
      isPlayoffs,

      a: {
        managerId: managerA.managerId,
        teamName: game.a.name,
        points: game.a.points,
      },

      b: {
        managerId: managerB.managerId,
        teamName: game.b.name,
        points: game.b.points,
      },

      winnerManagerId,
    });
  }

  if (games.length !== matchups.length) {
    issues.push(
      "Not every returned matchup was verified."
    );
  }

  return {
    season: league.season,
    week,
    leagueKey: league.key,
    games,

    verified:
      issues.length === 0 &&
      games.length > 0,

    issues,
  };
}

// This function must only be called
// by an authorized workflow.
// It does not save or publish results.

export async function collectHistoricalWeek(
  session: YahooRequestSession,
  league: HistoricalLeague,
  teams: readonly ResolvedHistoricalTeam[],
  week: number
): Promise<HistoricalWeekResult> {
  if (
    !/^\d+\.l\.\d+$/.test(league.key) ||
    !Number.isInteger(week) ||
    week < league.startWeek ||
    week > league.endWeek
  ) {
    throw new Error(
      "Invalid historical scoreboard request."
    );
  }

  const payload = await session.request(
    `league/${encodeURIComponent(league.key)}/scoreboard;week=${week}`
  );

  return extractHistoricalWeek(
    payload,
    league,
    teams,
    week
  );
}

export function assembleHistoricalSeason(
  league: HistoricalLeague,
  weeklyResults:
    readonly HistoricalWeekResult[],
  throughWeek: number
) {
  if (
    !Number.isInteger(throughWeek) ||
    throughWeek < league.startWeek ||
    throughWeek > league.endWeek ||
    (
      league.finished &&
      throughWeek !== league.endWeek
    )
  ) {
    throw new Error(
      "Invalid historical season coverage."
    );
  }

  const issues: string[] = [];
  const missingWeeks: number[] = [];

  const byWeek =
    new Map<number, HistoricalWeekResult>();

  for (const result of weeklyResults) {
    if (
      result.season !== league.season ||
      result.leagueKey !== league.key ||
      result.week < league.startWeek ||
      result.week > throughWeek
    ) {
      issues.push(
        "Unexpected historical weekly result."
      );

      continue;
    }

    if (byWeek.has(result.week)) {
      issues.push(
        `Duplicate week ${result.week}.`
      );

      continue;
    }

    byWeek.set(result.week, result);

    if (!result.verified) {
      issues.push(
        `Week ${result.week} requires review.`
      );
    }

    if (
      result.games.some(
        game =>
          game.season !== league.season ||
          game.week !== result.week
      )
    ) {
      issues.push(
        `Invalid game identity in week ${result.week}.`
      );
    }
  }

  for (
    let week = league.startWeek;
    week <= throughWeek;
    week++
  ) {
    if (!byWeek.has(week)) {
      missingWeeks.push(week);
    }
  }

  const ordered = [
    ...byWeek.values(),
  ].sort(
    (a, b) => a.week - b.week
  );

  const verifiedGames = ordered
    .filter(result => result.verified)
    .flatMap(result => result.games);

  const expectedWeeks =
    throughWeek - league.startWeek + 1;

  const weeksVerified = ordered.filter(
    result => result.verified
  ).length;

  const collectionComplete =
    missingWeeks.length === 0 &&
    issues.length === 0 &&
    weeksVerified === expectedWeeks;

  return {
    season: league.season,
    leagueKey: league.key,

    finished: league.finished,

    collectionComplete,

    expectedWeeks,
    weeksVerified,
    missingWeeks,

    matchupsCollected:
      verifiedGames.length,

    regularSeasonMatchups:
      verifiedGames.filter(
        game => !game.isPlayoffs
      ).length,

    playoffMatchups:
      verifiedGames.filter(
        game => game.isPlayoffs
      ).length,

    coveragePercentage:
      Math.round(
        weeksVerified /
        expectedWeeks * 10000
      ) / 100,

    issues,

    games: collectionComplete
      ? verifiedGames
      : [],

    readyForHistoricalAudit:
      collectionComplete,

    readyForPublication: false,

    note:
      "Collection completeness does not " +
      "establish historical accuracy. " +
      "Independent schedule reconciliation, " +
      "standings verification and playoff " +
      "bracket validation are still required.",
  };
}
