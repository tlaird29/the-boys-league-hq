
import {
  nodes,
  field,
} from "./season-analysis";

import {
  LEAGUE_START_YEAR,
  EXPECTED_MANAGER_COUNT,
  findManagerByName,
  selectLeague,
  validateManagerCoverage,
  type ManagerId,
} from "./league-managers";

import type {
  YahooRequestSession,
} from "./yahoo-scoreboard";

export type LeagueCandidate = {
  key: string;
  name: string;
  season: number;
  currentWeek: number;
  startWeek: number;
  endWeek: number;
  finished: boolean;
  managerIds: ManagerId[];
};

function integer(
  value: string | undefined
): number | null {
  if (
    value === undefined ||
    value.trim() === ""
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isInteger(number)
    ? number
    : null;
}

export function getFantasySeason(
  date = new Date()
): number | null {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "America/Boise",
      year: "numeric",
      month: "numeric",
    }
  ).formatToParts(date);

  const year = Number(
    parts.find(
      part => part.type === "year"
    )?.value
  );

  const month = Number(
    parts.find(
      part => part.type === "month"
    )?.value
  );

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month)
  ) {
    throw new Error(
      "Could not determine fantasy season."
    );
  }

  // January belongs to the preceding
  // football season.
  if (month === 1) {
    return year - 1;
  }

  // Weekly newsletters are inactive
  // during the normal offseason.
  if (month >= 2 && month <= 8) {
    return null;
  }

  return year;
}

export function extractLeagueCandidates(
  payload: unknown,
  season: number
): LeagueCandidate[] {
  const candidates =
    new Map<string, LeagueCandidate>();

  const entries = nodes(payload)
    .filter(
      item =>
        item.league &&
        typeof item.league === "object"
    )
    .map(item => item.league);

  for (const entry of entries) {
    const key = field(
      entry,
      "league_key"
    );

    const name = field(entry, "name");

    const returnedSeason = integer(
      field(entry, "season")
    );

    const currentWeek = integer(
      field(entry, "current_week")
    );

    const startWeek = integer(
      field(entry, "start_week")
    );

    const endWeek = integer(
      field(entry, "end_week")
    );

    const teamCount = integer(
      field(entry, "num_teams")
    );

    if (
      !key ||
      !/^\d+\.l\.\d+$/.test(key) ||
      !name ||
      returnedSeason !== season ||
      currentWeek === null ||
      startWeek === null ||
      endWeek === null ||
      startWeek < 1 ||
      endWeek > 18 ||
      endWeek < startWeek ||
      currentWeek < 0 ||
      currentWeek > 19 ||
      teamCount !== EXPECTED_MANAGER_COUNT
    ) {
      continue;
    }

    candidates.set(key, {
      key,
      name,
      season,
      currentWeek,
      startWeek,
      endWeek,
      finished:
        field(entry, "is_finished") === "1",
      managerIds: [],
    });
  }

  return [...candidates.values()];
}

export function extractManagerIds(
  payload: unknown,
  leagueKey: string
): ManagerId[] {
  const entries = nodes(payload)
    .filter(
      item =>
        item.team &&
        typeof item.team === "object"
    )
    .map(item => item.team);

  const teams =
    new Map<string, ManagerId>();

  for (const team of entries) {
    const teamKey = field(
      team,
      "team_key"
    );

    if (
      !teamKey ||
      !teamKey.startsWith(
        `${leagueKey}.t.`
      )
    ) {
      continue;
    }

    const managers = nodes(team)
      .filter(
        item =>
          item.manager &&
          typeof item.manager === "object"
      )
      .map(item => item.manager);

    // Do not guess when a team has
    // multiple managers.
    if (managers.length !== 1) {
      continue;
    }

    const manager = managers[0];

    const name =
      field(manager, "nickname") ||
      field(manager, "name");

    if (!name) {
      continue;
    }

    const matched =
      findManagerByName(name);

    if (!matched) {
      continue;
    }

    const previous = teams.get(teamKey);

    if (
      previous &&
      previous !== matched.id
    ) {
      throw new Error(
        "Conflicting manager identities."
      );
    }

    teams.set(teamKey, matched.id);
  }

  return [...teams.values()];
}

export async function discoverYahooLeague(
  session: YahooRequestSession,
  season: number
): Promise<LeagueCandidate> {
  if (
    !Number.isInteger(season) ||
    season < LEAGUE_START_YEAR
  ) {
    throw new Error(
      "Invalid fantasy season."
    );
  }

  const payload = await session.request(
    "users;use_login=1/games;game_codes=nfl/leagues"
  );

  const candidates =
    extractLeagueCandidates(
      payload,
      season
    );

  if (candidates.length === 0) {
    throw new Error(
      "No eligible league was found."
    );
  }

  const verified: LeagueCandidate[] = [];

  for (const candidate of candidates) {
    const teams = await session.request(
      `league/${encodeURIComponent(candidate.key)}/teams`
    );

    const managerIds =
      extractManagerIds(
        teams,
        candidate.key
      );

    const coverage =
      validateManagerCoverage(
        managerIds
      );

    if (coverage.valid) {
      verified.push({
        ...candidate,
        managerIds,
      });
    }
  }

  return selectLeague(
    verified,
    season
  );
}

export function getCandidateWeek(
  league: LeagueCandidate
): number | null {
  // If the season is finished,
  // the final week is the candidate.
  const week = league.finished
    ? league.endWeek
    : Math.min(
        league.currentWeek - 1,
        league.endWeek
      );

  if (
    week < league.startWeek ||
    week > league.endWeek
  ) {
    return null;
  }

  return week;
}
