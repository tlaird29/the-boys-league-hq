
import {
  extractHistoricalSettings,
} from "./historical-settings";

import {
  extractHistoricalSchedule,
  type HistoricalScheduleSource,
} from "./historical-schedule";

import {
  extractHistoricalStandings,
} from "./historical-standings";

import {
  extractHistoricalBracket,
} from "./historical-bracket-extraction";

import {
  extractHistoricalTeamIdentities,
} from "./historical-manager-identity";

import {
  prepareOfficialScoreboard,
} from "./official-matchups";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  HistoricalSeasonEvidence,
} from "./historical-pipeline";

export type HistoricalSeasonSources = {
  league: HistoricalLeague;

  throughWeek: number;

  settingsPayload: unknown;

  teamsPayload: unknown;

  standingsPayload: unknown;

  verifiedStandingsCutoff:
    number | null;

  scheduleSources:
    readonly HistoricalScheduleSource[];

  scoreboardSources: readonly {
    week: number;
    payload: unknown;
  }[];
};

export function buildHistoricalSeasonEvidence(
  input: HistoricalSeasonSources
) {
  const league = input.league;

  const issues: string[] = [];

  let stage = "settings";

  function failure() {
    return {
      verified: false,

      season: league.season,

      stage,

      issues: [...issues],

      evidence:
        null as HistoricalSeasonEvidence | null,

      yahooRequests: 0,
      aiRequests: 0,
      databaseWrites: 0,

      readyForPublication: false,
    };
  }

  try {
    const settings =
      extractHistoricalSettings(
        input.settingsPayload,
        league
      );

    if (
      !settings.verified ||
      !settings.settings
    ) {
      issues.push(...settings.issues);

      return failure();
    }

    stage = "team-identities";

    const teams =
      extractHistoricalTeamIdentities(
        input.teamsPayload,
        league.season,
        league.key
      );

    if (
      teams.length !== league.teamCount ||
      new Set(
        teams.map(team => team.teamKey)
      ).size !== league.teamCount
    ) {
      issues.push(
        "Historical team coverage is incomplete."
      );

      return failure();
    }

    const teamKeys =
      teams.map(team => team.teamKey);

    stage = "schedule";

    const schedule =
      extractHistoricalSchedule(
        league,
        settings.settings,
        teamKeys,
        input.scheduleSources,
        input.throughWeek
      );

    if (
      !schedule.verified ||
      !schedule.schedule
    ) {
      issues.push(...schedule.issues);

      return failure();
    }

    stage = "scoreboards";

    const seenWeeks =
      new Set<number>();

    for (
      const source of
      input.scoreboardSources
    ) {
      if (
        !Number.isInteger(source.week) ||
        source.week < league.startWeek ||
        source.week > input.throughWeek
      ) {
        issues.push(
          "Unexpected historical scoreboard week."
        );

        continue;
      }

      if (seenWeeks.has(source.week)) {
        issues.push(
          `Duplicate scoreboard for week ${source.week}.`
        );

        continue;
      }

      seenWeeks.add(source.week);

      const prepared =
        prepareOfficialScoreboard(
          source.payload,
          league.key,
          source.week
        );

      if (!prepared.verified) {
        issues.push(
          ...prepared.issues.map(
            issue =>
              `Week ${source.week}: ${issue}`
          )
        );
      }
    }

    for (
      let week = league.startWeek;
      week <= input.throughWeek;
      week++
    ) {
      if (!seenWeeks.has(week)) {
        issues.push(
          `Missing scoreboard for week ${week}.`
        );
      }
    }

    if (issues.length > 0) {
      return failure();
    }

    stage = "standings";

    const standings =
      extractHistoricalStandings(
        input.standingsPayload,
        league,
        teamKeys,
        input.throughWeek,
        settings.settings.regularSeasonEndWeek,
        input.verifiedStandingsCutoff
      );

    if (
      !standings.verified ||
      !standings.standings
    ) {
      issues.push(...standings.issues);

      return failure();
    }

    const evidence: HistoricalSeasonEvidence = {
      season: league.season,

      leagueKey: league.key,

      throughWeek: input.throughWeek,

      teams,

      // Preserve original in-memory payloads
      // for the pipeline's official filtering.
      scoreboards:
        input.scoreboardSources,

      schedule:
        schedule.schedule,

      standings:
        standings.standings,
    };

    if (league.finished) {
      stage = "championship-bracket";

      const bracket =
        extractHistoricalBracket(
          league,
          schedule.schedule
        );

      if (
        !bracket.verified ||
        !bracket.bracket ||
        !standings.finalResults
      ) {
        issues.push(
          ...bracket.issues,
          "Complete championship evidence is required."
        );

        return failure();
      }

      evidence.bracket =
        bracket.bracket;

      evidence.finalResults =
        standings.finalResults;
    }

    return {
      verified: true,

      season: league.season,

      stage: "prepared",

      issues,

      evidence,

      yahooRequests: 0,
      aiRequests: 0,
      databaseWrites: 0,

      readyForPublication: false,
    };

  } catch (error) {
    issues.push(
      error instanceof Error
        ? error.message
        : "Unexpected historical evidence error."
    );

    return failure();
  }
}
