
import {
  LEAGUE_START_YEAR,
} from "./league-managers";

import {
  buildHistoricalSeasonEvidence,
  type HistoricalSeasonSources,
} from "./historical-evidence-builder";

import {
  runHistoricalPipeline,
  type HistoricalPipelineInput,
  type HistoricalSeasonEvidence,
} from "./historical-pipeline";

export type HistoricalProcessingInput =
  Omit<
    HistoricalPipelineInput,
    "seasons"
  > & {
    sources:
      readonly HistoricalSeasonSources[];
  };

export function processHistoricalLeague(
  input: HistoricalProcessingInput
) {
  const issues: string[] = [];

  const preparedSeasons:
    HistoricalSeasonEvidence[] = [];

  const preparationReports: {
    season: number;
    verified: boolean;
    stage: string;
    issues: string[];
  }[] = [];

  const seenSeasons =
    new Set<number>();

  function failure() {
    return {
      verified: false,

      status: "needs-review" as const,

      seasonsPrepared:
        preparedSeasons.length,

      preparationReports,

      issues: [...issues],

      pipeline:
        null as ReturnType<
          typeof runHistoricalPipeline
        > | null,

      records:
        null as ReturnType<
          typeof runHistoricalPipeline
        >["records"],

      yahooRequests: 0,
      aiRequests: 0,
      databaseWrites: 0,
      emailsSent: 0,

      readyForPublication: false,
    };
  }

  if (
    !Number.isInteger(
      input.throughSeason
    ) ||
    input.throughSeason <
      LEAGUE_START_YEAR
  ) {
    issues.push(
      "Invalid historical processing range."
    );

    return failure();
  }

  for (const source of input.sources) {
    const season =
      source.league.season;

    if (
      !Number.isInteger(season) ||
      season < LEAGUE_START_YEAR ||
      season > input.throughSeason
    ) {
      issues.push(
        "Unexpected historical season."
      );

      continue;
    }

    if (seenSeasons.has(season)) {
      issues.push(
        `Duplicate historical source for ${season}.`
      );

      continue;
    }

    seenSeasons.add(season);

    const prepared =
      buildHistoricalSeasonEvidence(
        source
      );

    preparationReports.push({
      season,

      verified:
        prepared.verified,

      stage:
        prepared.stage,

      issues:
        prepared.issues,
    });

    if (
      !prepared.verified ||
      !prepared.evidence
    ) {
      issues.push(
        `Historical preparation failed for ${season}.`
      );

      continue;
    }

    preparedSeasons.push(
      prepared.evidence
    );
  }

  for (
    let season = LEAGUE_START_YEAR;
    season <= input.throughSeason;
    season++
  ) {
    if (!seenSeasons.has(season)) {
      issues.push(
        `Missing historical source for ${season}.`
      );
    }
  }

  if (issues.length > 0) {
    return failure();
  }

  try {
    const pipeline =
      runHistoricalPipeline({
        throughSeason:
          input.throughSeason,

        leagueCandidates:
          input.leagueCandidates,

        verifiedLeagueIdentities:
          input.verifiedLeagueIdentities,

        verifiedManagerIdentities:
          input.verifiedManagerIdentities,

        confirmedTeamAssignments:
          input.confirmedTeamAssignments,

        seasons:
          preparedSeasons,
      });

    return {
      verified:
        pipeline.verified,

      status:
        pipeline.verified
          ? "verified" as const
          : "needs-review" as const,

      seasonsPrepared:
        preparedSeasons.length,

      preparationReports,

      issues:
        pipeline.globalIssues,

      pipeline,

      records:
        pipeline.verified
          ? pipeline.records
          : null,

      yahooRequests: 0,
      aiRequests: 0,
      databaseWrites: 0,
      emailsSent: 0,

      readyForPublication: false,
    };

  } catch (error) {
    issues.push(
      error instanceof Error
        ? error.message
        : "Historical processing failed."
    );

    return failure();
  }
}
