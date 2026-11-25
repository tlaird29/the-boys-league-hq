
import {
  LEAGUE_START_YEAR,
} from "./league-managers";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

export const HISTORICAL_RETRIEVAL_LIMITS = {
  defaultRequestBudget: 20,
  maximumRequestBudget: 50,
  maximumAttemptsPerRequest: 3,
  maximumWeek: 18,
} as const;

export type HistoricalRequestKind =
  | "settings"
  | "teams"
  | "standings"
  | "scoreboard";

export type HistoricalRequest = {
  season: number;
  leagueKey: string;
  kind: HistoricalRequestKind;
  week?: number;
  path: string;
};

export type HistoricalRetrievalTarget = {
  league: HistoricalLeague;
  throughWeek: number;
};

export function createHistoricalRetrievalPlan(
  targets:
    readonly HistoricalRetrievalTarget[],

  requestBudget =
    HISTORICAL_RETRIEVAL_LIMITS
      .defaultRequestBudget
) {
  if (
    !Number.isInteger(requestBudget) ||
    requestBudget < 1 ||
    requestBudget >
      HISTORICAL_RETRIEVAL_LIMITS
        .maximumRequestBudget
  ) {
    throw new Error(
      "Invalid historical request budget."
    );
  }

  const issues: string[] = [];

  const requests:
    HistoricalRequest[] = [];

  const seenSeasons =
    new Set<number>();

  const seenLeagueKeys =
    new Set<string>();

  const ordered = [...targets].sort(
    (a, b) =>
      a.league.season -
      b.league.season
  );

  if (ordered.length === 0) {
    issues.push(
      "No historical seasons supplied."
    );
  }

  for (const target of ordered) {
    const {
      league,
      throughWeek,
    } = target;

    if (
      !Number.isInteger(league.season) ||
      league.season < LEAGUE_START_YEAR ||
      !/^\d+\.l\.\d+$/.test(league.key)
    ) {
      issues.push(
        "Invalid historical league identity."
      );

      continue;
    }

    if (
      seenSeasons.has(league.season) ||
      seenLeagueKeys.has(league.key)
    ) {
      issues.push(
        "Duplicate historical league or season."
      );

      continue;
    }

    seenSeasons.add(league.season);
    seenLeagueKeys.add(league.key);

    if (
      !Number.isInteger(league.startWeek) ||
      !Number.isInteger(league.endWeek) ||
      !Number.isInteger(throughWeek) ||
      league.startWeek < 1 ||
      league.endWeek >
        HISTORICAL_RETRIEVAL_LIMITS
          .maximumWeek ||
      league.startWeek > league.endWeek ||
      throughWeek < league.startWeek ||
      throughWeek > league.endWeek
    ) {
      issues.push(
        `Invalid calendar for ${league.season}.`
      );

      continue;
    }

    if (
      league.finished &&
      throughWeek !== league.endWeek
    ) {
      issues.push(
        `Incomplete historical season ${league.season}.`
      );

      continue;
    }

    const base =
      `league/${league.key}`;

    requests.push(
      {
        season: league.season,
        leagueKey: league.key,
        kind: "settings",
        path: `${base}/settings`,
      },

      {
        season: league.season,
        leagueKey: league.key,
        kind: "teams",
        path: `${base}/teams`,
      },

      {
        season: league.season,
        leagueKey: league.key,
        kind: "standings",
        path: `${base}/standings`,
      }
    );

    for (
      let week = league.startWeek;
      week <= throughWeek;
      week++
    ) {
      requests.push({
        season: league.season,
        leagueKey: league.key,

        kind: "scoreboard",

        week,

        path:
          `${base}/scoreboard;week=${week}`,
      });
    }
  }

  const verified =
    issues.length === 0;

  const plannedRequests =
    verified ? requests : [];

  const batches:
    HistoricalRequest[][] = [];

  for (
    let index = 0;
    index < plannedRequests.length;
    index += requestBudget
  ) {
    batches.push(
      plannedRequests.slice(
        index,
        index + requestBudget
      )
    );
  }

  return {
    verified,

    issues,

    seasonsPlanned:
      verified ? ordered.length : 0,

    minimumRequests:
      plannedRequests.length,

    maximumPotentialAttempts:
      plannedRequests.length *
      HISTORICAL_RETRIEVAL_LIMITS
        .maximumAttemptsPerRequest,

    requestBudget,

    fitsSingleRequestBudget:
      verified &&
      plannedRequests.length <= requestBudget,

    batchesRequired:
      batches.length,

    requests:
      plannedRequests,

    batches,

    yahooRequests: 0,

    databaseWrites: 0,

    executionEnabled: false,

    note:
      "Planning only. No external requests are made. " +
      "Additional requests may be required for " +
      "source verification, pagination, and retries.",
  };
}
