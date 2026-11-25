
import { yahooAccessToken } from "./yahoo";

import {
  createYahooRequestSession,
} from "./yahoo-request";

import {
  nodes,
  field,
  extractGames,
  type Game,
} from "./season-analysis";

export type YahooRequestSession =
  ReturnType<typeof createYahooRequestSession>;

export type YahooScoreboard = {
  source: "yahoo";
  leagueKey: string;
  leagueName: string;
  season: number;
  week: number;
  retrievedAt: string;
  scoringFinal: boolean;
  games: Game[];
  warnings: string[];
};

export async function importYahooScoreboard(
  userId: string,
  leagueKey: string,
  week: number,
  existingSession?: YahooRequestSession
): Promise<YahooScoreboard> {
  if (!/^\d+\.l\.\d+$/.test(leagueKey)) {
    throw new Error(
      "Invalid Yahoo league key."
    );
  }

  if (
    !Number.isInteger(week) ||
    week < 1 ||
    week > 18
  ) {
    throw new Error(
      "Invalid fantasy football week."
    );
  }

  const session =
    existingSession ??
    createYahooRequestSession(
      await yahooAccessToken(userId)
    );

  const encodedKey =
    encodeURIComponent(leagueKey);

  // Sequential requests prevent unnecessary
  // calls when Yahoo denies access.

  const metadata = await session.request(
    `league/${encodedKey}`
  );

  const league = nodes(metadata).find(
    item => item.league_key === leagueKey
  );

  if (!league) {
    throw new Error(
      "Yahoo did not confirm the requested league."
    );
  }

  const season = Number(
    field(league, "season")
  );

  const leagueName = field(
    league,
    "name"
  );

  if (
    !Number.isInteger(season) ||
    season < 2000 ||
    !leagueName
  ) {
    throw new Error(
      "Yahoo league identity could not be verified."
    );
  }

  const scoreboard = await session.request(
    `league/${encodedKey}/scoreboard;week=${week}`
  );

  const returnedLeagueKey = field(
    scoreboard,
    "league_key"
  );

  if (returnedLeagueKey !== leagueKey) {
    throw new Error(
      "Yahoo returned an unexpected league."
    );
  }

  const games = extractGames(
    scoreboard,
    week
  );

  const warnings: string[] = [];

  const matchups = nodes(scoreboard)
    .filter(
      item =>
        item.matchup &&
        typeof item.matchup === "object"
    )
    .map(item => item.matchup);

  const returnedWeek = field(
    scoreboard,
    "week"
  );

  const correctWeek =
    returnedWeek !== undefined &&
    Number(returnedWeek) === week;

  if (!correctWeek) {
    warnings.push(
      "Yahoo did not confirm the requested week."
    );
  }

  const allCompleted =
    matchups.length > 0 &&
    matchups.every(
      matchup =>
        field(matchup, "status") ===
          "postevent" ||
        field(matchup, "is_completed") ===
          "1"
    );

  if (!allCompleted) {
    warnings.push(
      "Not every matchup is confirmed complete."
    );
  }

  const completeScores =
    games.length > 0 &&
    games.length === matchups.length;

  if (!completeScores) {
    warnings.push(
      "Some matchup scores may be missing."
    );
  }

  const teamKeys = games.flatMap(
    game => [game.a.key, game.b.key]
  );

  const uniqueTeams =
    new Set(teamKeys).size ===
    teamKeys.length;

  if (!uniqueTeams) {
    warnings.push(
      "Duplicate team appearances detected."
    );
  }

  const correctLeague = teamKeys.every(
    key =>
      key.startsWith(`${leagueKey}.t.`)
  );

  if (!correctLeague) {
    warnings.push(
      "A team does not match the requested league."
    );
  }

  const scoringFinal =
    correctWeek &&
    allCompleted &&
    completeScores &&
    uniqueTeams &&
    correctLeague;

  return {
    source: "yahoo",
    leagueKey,
    leagueName,
    season,
    week,
    retrievedAt: new Date().toISOString(),
    scoringFinal,
    games,
    warnings,
  };
}
