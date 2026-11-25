
import {
  prepareOfficialScoreboard,
} from "./official-matchups";

import {
  validateOfficialSchedule,
} from "./official-schedule-validation";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  HistoricalSeasonEvidence,
} from "./historical-pipeline";

export function prepareHistoricalEvidence(
  league: HistoricalLeague,
  evidence: HistoricalSeasonEvidence
) {
  const issues: string[] = [];

  let excludedConsolationMatchups = 0;

  const scheduleValidation =
    validateOfficialSchedule(
      league,
      evidence.schedule,

      evidence.teams.map(
        team => team.teamKey
      )
    );

  if (!scheduleValidation.verified) {
    issues.push(
      ...scheduleValidation.issues
    );
  }

  const scoreboards: {
    week: number;
    payload: unknown;
  }[] = [];

  for (
    const scoreboard of
    evidence.scoreboards
  ) {
    const prepared =
      prepareOfficialScoreboard(
        scoreboard.payload,
        league.key,
        scoreboard.week
      );

    excludedConsolationMatchups +=
      prepared.excludedConsolationMatchups;

    if (
      !prepared.verified ||
      prepared.payload === null
    ) {
      issues.push(
        ...prepared.issues.map(
          issue =>
            `Week ${scoreboard.week}: ${issue}`
        )
      );

      continue;
    }

    scoreboards.push({
      week: scoreboard.week,

      payload:
        prepared.payload,
    });
  }

  if (
    scoreboards.length !==
    evidence.scoreboards.length
  ) {
    issues.push(
      "Not every historical scoreboard could be prepared."
    );
  }

  if (
    evidence.schedule.throughWeek !==
    evidence.throughWeek
  ) {
    issues.push(
      "Historical schedule cutoff does not match scoreboard cutoff."
    );
  }

  const verified =
    issues.length === 0;

  const preparedEvidence:
    HistoricalSeasonEvidence | null =
      verified
        ? {
            ...evidence,
            scoreboards,
          }
        : null;

  return {
    verified,

    issues,

    excludedConsolationMatchups,

    scheduleValidation,

    evidence:
      preparedEvidence,
  };
}
