
import {
  nodes,
  field,
} from "./season-analysis";

import {
  LEAGUE_START_YEAR,
  normalizeManagerName,
} from "./league-managers";

import type {
  YahooRequestSession,
} from "./yahoo-scoreboard";

export type HistoricalLeague = {
  season: number;
  key: string;
  name: string;
  teamCount: number;
  startWeek: number;
  endWeek: number;
  finished: boolean;
  renewedFrom: string | null;
};

export type VerifiedLeagueIdentity = {
  season: number;
  leagueKey: string;
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

function validLeagueKey(
  key: string
): boolean {
  return /^\d+\.l\.\d+$/.test(key);
}

function normalizeRenewalKey(
  value: string | undefined
): string | null {
  if (!value) return null;

  if (validLeagueKey(value)) {
    return value;
  }

  const match = value.match(
    /^(\d+)_(\d+)$/
  );

  return match
    ? `${match[1]}.l.${match[2]}`
    : null;
}

export function extractHistoricalLeagues(
  payload: unknown,
  throughSeason: number
): HistoricalLeague[] {
  if (
    !Number.isInteger(throughSeason) ||
    throughSeason < LEAGUE_START_YEAR
  ) {
    throw new Error(
      "Invalid historical discovery range."
    );
  }

  const leagues =
    new Map<string, HistoricalLeague>();

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

    const season = integer(
      field(entry, "season")
    );

    const teamCount = integer(
      field(entry, "num_teams")
    );

    const startWeek = integer(
      field(entry, "start_week")
    );

    const endWeek = integer(
      field(entry, "end_week")
    );

    if (
      !key ||
      !validLeagueKey(key) ||
      !name ||
      season === null ||
      season < LEAGUE_START_YEAR ||
      season > throughSeason ||
      teamCount === null ||
      teamCount < 2 ||
      startWeek === null ||
      endWeek === null ||
      startWeek < 1 ||
      endWeek > 18 ||
      endWeek < startWeek
    ) {
      continue;
    }

    const league: HistoricalLeague = {
      season,
      key,
      name,
      teamCount,
      startWeek,
      endWeek,

      finished:
        field(entry, "is_finished") === "1",

      renewedFrom:
        normalizeRenewalKey(
          field(entry, "renew")
        ),
    };

    const previous = leagues.get(key);

    if (
      previous &&
      (
        previous.season !== league.season ||
        previous.teamCount !== league.teamCount ||
        previous.startWeek !== league.startWeek ||
        previous.endWeek !== league.endWeek ||
        previous.finished !== league.finished ||
        previous.renewedFrom !== league.renewedFrom ||
        normalizeManagerName(previous.name) !==
          normalizeManagerName(league.name)
      )
    ) {
      throw new Error(
        "Conflicting historical league metadata."
      );
    }

    leagues.set(key, league);
  }

  return [...leagues.values()].sort(
    (a, b) =>
      a.season - b.season ||
      a.key.localeCompare(b.key)
  );
}

export function resolveHistoricalLeagueChain(
  candidates: readonly HistoricalLeague[],
  verifiedIdentities:
    readonly VerifiedLeagueIdentity[],
  throughSeason: number
) {
  if (
    !Number.isInteger(throughSeason) ||
    throughSeason < LEAGUE_START_YEAR
  ) {
    throw new Error(
      "Invalid historical discovery range."
    );
  }

  const byKey =
    new Map<string, HistoricalLeague>();

  for (const league of candidates) {
    if (byKey.has(league.key)) {
      throw new Error(
        "Duplicate historical league candidate."
      );
    }

    byKey.set(league.key, league);
  }

  const selected = new Map<
    number,
    {
      league: HistoricalLeague;
      verifiedBy:
        | "confirmed-identity"
        | "renewal-chain";
    }
  >();

  const conflicts: string[] = [];

  for (const identity of verifiedIdentities) {
    const league = byKey.get(
      identity.leagueKey
    );

    if (
      !league ||
      league.season !== identity.season ||
      identity.season < LEAGUE_START_YEAR ||
      identity.season > throughSeason
    ) {
      conflicts.push(
        `Invalid confirmed identity for ${identity.season}.`
      );

      continue;
    }

    const existing = selected.get(
      identity.season
    );

    if (
      existing &&
      existing.league.key !== league.key
    ) {
      conflicts.push(
        `Conflicting confirmed leagues for ${identity.season}.`
      );

      continue;
    }

    selected.set(identity.season, {
      league,
      verifiedBy: "confirmed-identity",
    });
  }

  // Follow renewal links backward from
  // explicitly confirmed league identities.

  const anchors = [...selected.values()];

  for (const anchor of anchors) {
    let current = anchor.league;

    const visited = new Set<string>();

    while (current.renewedFrom) {
      if (visited.has(current.key)) {
        conflicts.push(
          "Circular league renewal chain."
        );

        break;
      }

      visited.add(current.key);

      if (
        current.season <= LEAGUE_START_YEAR
      ) {
        break;
      }

      const previous = byKey.get(
        current.renewedFrom
      );

      if (!previous) break;

      if (
        previous.season !==
          current.season - 1
      ) {
        conflicts.push(
          `Invalid renewal sequence for ${current.season}.`
        );

        break;
      }

      const existing = selected.get(
        previous.season
      );

      if (
        existing &&
        existing.league.key !== previous.key
      ) {
        conflicts.push(
          `Renewal chain conflicts with confirmed league for ${previous.season}.`
        );

        break;
      }

      if (!existing) {
        selected.set(previous.season, {
          league: previous,
          verifiedBy: "renewal-chain",
        });
      }

      current = previous;
    }
  }

  const missingSeasons: number[] = [];

  const needsReview: {
    season: number;
    candidates: HistoricalLeague[];
  }[] = [];

  for (
    let season = LEAGUE_START_YEAR;
    season <= throughSeason;
    season++
  ) {
    if (selected.has(season)) {
      continue;
    }

    const options = candidates.filter(
      league => league.season === season
    );

    if (options.length === 0) {
      missingSeasons.push(season);
    } else {
      needsReview.push({
        season,
        candidates: options,
      });
    }
  }

  const verifiedLeagues = [
    ...selected.values(),
  ].sort(
    (a, b) =>
      a.league.season -
      b.league.season
  );

  const verified =
    missingSeasons.length === 0 &&
    needsReview.length === 0 &&
    conflicts.length === 0 &&
    verifiedLeagues.length ===
      throughSeason - LEAGUE_START_YEAR + 1;

  return {
    verified,

    status: verified
      ? "verified" as const
      : "needs-review" as const,

    expectedSeasons:
      throughSeason -
      LEAGUE_START_YEAR + 1,

    seasonsIdentified:
      verifiedLeagues.length,

    verifiedLeagues,
    missingSeasons,
    needsReview,
    conflicts,

    note:
      "League identity is established " +
      "through confirmed identities and " +
      "renewal links, not league names. " +
      "Matchup accuracy and historical " +
      "manager identities require separate audits.",
  };
}

// Call only from an authorized,
// permission-controlled workflow.
// This function does not persist data.

export async function discoverHistoricalLeagues(
  session: YahooRequestSession,
  verifiedIdentities:
    readonly VerifiedLeagueIdentity[],
  throughSeason: number
) {
  const payload = await session.request(
    "users;use_login=1/games;game_codes=nfl/leagues"
  );

  const candidates =
    extractHistoricalLeagues(
      payload,
      throughSeason
    );

  return resolveHistoricalLeagueChain(
    candidates,
    verifiedIdentities,
    throughSeason
  );
}
