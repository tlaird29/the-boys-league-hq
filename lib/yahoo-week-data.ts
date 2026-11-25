
import { yahooAccessToken } from "./yahoo";
import { nodes, field } from "./season-analysis";
import { importYahooScoreboard } from "./yahoo-scoreboard";

import {
  analyzeWeek,
  type Position,
  type Player,
  type FantasyTeam,
  type FantasyMatchup,
  type WeekData,
} from "./matchup-analysis";

const supportedPositions: Position[] = [
  "QB",
  "RB",
  "WR",
  "TE",
  "K",
  "DEF",
];

const supportedSlots = new Set([
  "QB",
  "RB",
  "WR",
  "TE",
  "K",
  "DEF",
  "FLEX",
  "W/R/T",
  "SUPERFLEX",
  "Q/W/R/T",
  "BN",
  "IR",
]);

type TeamScore = {
  key: string;
  name: string;
  points: number;
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
      "Yahoo returned an unexpected response."
    );
  }

  return payload;
}

function numeric(
  value: string | undefined
): number | null {
  if (
    value === undefined ||
    value.trim() === ""
  ) {
    return null;
  }

  const result = Number(value);

  return Number.isFinite(result)
    ? result
    : null;
}

function normalizePosition(
  value: string
): Position | null {
  const position = value
    .trim()
    .toUpperCase();

  const normalized =
    position === "DST" ||
    position === "D/ST"
      ? "DEF"
      : position;

  return supportedPositions.includes(
    normalized as Position
  )
    ? (normalized as Position)
    : null;
}

function extractPlayer(
  payload: unknown,
  week: number
): Player {
  const id = field(payload, "player_key");

  const nameNode = nodes(payload).find(
    item =>
      item.name &&
      typeof item.name === "object"
  );

  const name = nameNode
    ? field(nameNode.name, "full")
    : undefined;

  const position = normalizePosition(
    field(payload, "display_position") ||
      field(payload, "primary_position") ||
      ""
  );

  const selected = nodes(payload).find(
    item =>
      item.selected_position &&
      typeof item.selected_position === "object"
  );

  const slot = selected
    ? field(
        selected.selected_position,
        "position"
      )?.toUpperCase()
    : undefined;

  const selectedWeek = selected
    ? numeric(
        field(selected.selected_position, "week")
      )
    : null;

  if (
    !id ||
    !name ||
    !position ||
    !slot ||
    !supportedSlots.has(slot) ||
    selectedWeek !== week
  ) {
    throw new Error(
      "A Yahoo player or lineup assignment " +
        "could not be verified."
    );
  }

  const pointsNode = nodes(payload).find(
    item =>
      item.player_points &&
      typeof item.player_points === "object"
  );

  const points = pointsNode
    ? numeric(
        field(pointsNode.player_points, "total")
      )
    : null;

  const pointsWeek = pointsNode
    ? numeric(
        field(pointsNode.player_points, "week")
      )
    : null;

  if (
    points === null ||
    pointsWeek !== week
  ) {
    throw new Error(
      `Weekly player points could not be verified for ${name}.`
    );
  }

  const projectionNode = nodes(payload).find(
    item =>
      item.player_projected_points &&
      typeof item.player_projected_points ===
        "object"
  );

  const projectionWeek = projectionNode
    ? numeric(
        field(
          projectionNode.player_projected_points,
          "week"
        )
      )
    : null;

  const projected =
    projectionNode &&
    projectionWeek === week
      ? numeric(
          field(
            projectionNode.player_projected_points,
            "total"
          )
        )
      : null;

  return {
    id,
    name,
    position,
    slot,
    points,
    projected,
    starter: slot !== "BN" && slot !== "IR",
  };
}

async function retrieveTeam(
  team: TeamScore,
  week: number,
  token: string
): Promise<FantasyTeam> {
  const key = encodeURIComponent(team.key);

  const payload = await yahooRequest(
    `team/${key}/roster;week=${week}/players/stats;type=week;week=${week}`,
    token
  );

  const returnedTeamKey = field(
    payload,
    "team_key"
  );

  if (returnedTeamKey !== team.key) {
    throw new Error(
      "Yahoo returned an unexpected team."
    );
  }

  const rosterNode = nodes(payload).find(
    item =>
      item.roster &&
      typeof item.roster === "object"
  );

  if (!rosterNode) {
    throw new Error(
      `Roster unavailable for ${team.name}.`
    );
  }

  const roster = rosterNode.roster;

  const rosterWeek = numeric(
    field(roster, "week")
  );

  if (rosterWeek !== week) {
    throw new Error(
      `Roster week could not be verified for ${team.name}.`
    );
  }

  const playerEntries = nodes(roster)
    .filter(
      item =>
        item.player &&
        typeof item.player === "object"
    )
    .map(item => item.player);

  if (playerEntries.length === 0) {
    throw new Error(
      `No players returned for ${team.name}.`
    );
  }

  const players = playerEntries.map(
    player => extractPlayer(player, week)
  );

  const uniqueIds = new Set(
    players.map(player => player.id)
  );

  if (uniqueIds.size !== players.length) {
    throw new Error(
      `Duplicate players detected for ${team.name}.`
    );
  }

  // Exclude injured reserve players from
  // bench-replacement analysis.
  const activeRoster = players.filter(
    player => player.slot !== "IR"
  );

  const starters = activeRoster.filter(
    player => player.starter
  );

  if (starters.length === 0) {
    throw new Error(
      `No starting lineup found for ${team.name}.`
    );
  }

  const calculatedScore = starters.reduce(
    (total, player) => total + player.points,
    0
  );

  if (
    Math.abs(calculatedScore - team.points) >
    0.005
  ) {
    throw new Error(
      `Player totals do not match Yahoo's ` +
        `official score for ${team.name}.`
    );
  }

  // Use the verified team name until the
  // historical manager mapping is configured.
  return {
    id: team.key,
    name: team.name,
    manager: team.name,
    players: activeRoster,
  };
}

export async function importYahooWeekData(
  userId: string,
  leagueKey: string,
  week: number
): Promise<WeekData> {
  const scoreboard =
    await importYahooScoreboard(
      userId,
      leagueKey,
      week
    );

  if (!scoreboard.scoringFinal) {
    throw new Error(
      "Yahoo scoreboard completion has not " +
        "been verified. " +
        scoreboard.warnings.join(" ")
    );
  }

  const token = await yahooAccessToken(userId);

  const matchups: FantasyMatchup[] = [];

  // Process matchups sequentially to avoid
  // excessive simultaneous Yahoo requests.
  for (const game of scoreboard.games) {
    const [home, away] = await Promise.all([
      retrieveTeam(game.a, week, token),
      retrieveTeam(game.b, week, token),
    ]);

    matchups.push({
      id: `${week}-${game.a.key}-${game.b.key}`,
      home,
      away,
    });
  }

  if (
    matchups.length === 0 ||
    matchups.length !== scoreboard.games.length
  ) {
    throw new Error(
      "The complete matchup dataset " +
        "could not be retrieved."
    );
  }

  return {
    season: scoreboard.season,
    week,
    source: "yahoo",
    scoringFinal: true,
    matchups,
  };
}

export async function analyzeYahooWeek(
  userId: string,
  leagueKey: string,
  week: number
) {
  const data = await importYahooWeekData(
    userId,
    leagueKey,
    week
  );

  return {
    data,
    analysis: analyzeWeek(data),
  };
}
