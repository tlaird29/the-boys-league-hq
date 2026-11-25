
import { yahooAccessToken } from "./yahoo";
import {
  nodes,
  field,
  extractGames,
  type Game,
} from "./season-analysis";

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

async function yahooRequest(
  path: string,
  token: string
): Promise<unknown> {
  const response = await fetch(
    "https://fantasysports.yahooapis.com/fantasy/v2/" +
      path +
      "?format=json",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    }
  );

  if (!response.ok) {
    throw new Error(
      `Yahoo Fantasy API returned HTTP ${response.status}.`
    );
  }

  const payload: unknown = await response.json();

  if (
    !payload ||
    typeof payload !== "object" ||
    !("fantasy_content" in payload)
  ) {
    throw new Error(
      "Unexpected Yahoo response format."
    );
  }

  return payload;
}

export async function importYahooScoreboard(
  userId: string,
  leagueKey: string,
  week: number
): Promise<YahooScoreboard> {
  if (!/^\d+\.l\.\d+$/.test(leagueKey)) {
    throw new Error("Invalid Yahoo league key.");
  }

  if (
    !Number.isInteger(week) ||
    week < 1 ||
    week > 18
  ) {
    throw new Error("Invalid fantasy football week.");
  }

  const token = await yahooAccessToken(userId);
  const encodedKey = encodeURIComponent(leagueKey);

  const [metadata, scoreboard] = await Promise.all([
    yahooRequest(`league/${encodedKey}`, token),
    yahooRequest(
      `league/${encodedKey}/scoreboard;week=${week}`,
      token
    ),
  ]);

  const league = nodes(metadata).find(
    item => item.league_key === leagueKey
  );

  if (!league) {
    throw new Error(
      "Yahoo did not confirm the requested league."
    );
  }

  const season = Number(field(league, "season"));
  const leagueName = field(league, "name");

  if (
    !Number.isInteger(season) ||
    season < 2000 ||
    !leagueName
  ) {
    throw new Error(
      "Yahoo league identity could not be verified."
    );
  }

  const games = extractGames(scoreboard, week);
  const warnings: string[] = [];

  const matchups = nodes(scoreboard)
    .filter(
      item =>
        item.matchup &&
        typeof item.matchup === "object"
    )
    .map(item => item.matchup);

  const returnedWeek = field(scoreboard, "week");

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
        field(matchup, "status") === "postevent" ||
        field(matchup, "is_completed") === "1"
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
      "Some matchup scores may be missing or incomplete."
    );
  }

  const teamKeys = games.flatMap(
    game => [game.a.key, game.b.key]
  );

  const uniqueTeams =
    new Set(teamKeys).size === teamKeys.length;

  if (!uniqueTeams) {
    warnings.push(
      "Duplicate team appearances detected."
    );
  }

  const correctLeague = teamKeys.every(
    key => key.startsWith(`${leagueKey}.t.`)
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
