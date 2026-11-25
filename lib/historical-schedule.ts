
import {
  nodes,
  field,
} from "./season-analysis";

import {
  classifyOfficialMatchup,
} from "./official-matchups";

import {
  validateOfficialSchedule,
} from "./official-schedule-validation";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  HistoricalLeagueSettings,
} from "./historical-settings";

import type {
  HistoricalSchedule,
  ScheduledMatchup,
} from "./historical-reconciliation";

export type HistoricalScheduleSource = {
  week: number;
  payload: unknown;
};

export function extractHistoricalSchedule(
  league: HistoricalLeague,
  settings: HistoricalLeagueSettings,
  teamKeys: readonly string[],
  sources:
    readonly HistoricalScheduleSource[],
  throughWeek: number
) {
  const issues: string[] = [];

  const matchups:
    ScheduledMatchup[] = [];

  const seenWeeks =
    new Set<number>();

  let excludedConsolationMatchups = 0;

  if (
    !settings.sourceVerified ||
    settings.season !==
      league.season ||
    settings.leagueKey !==
      league.key ||
    settings.startWeek !==
      league.startWeek ||
    settings.endWeek !==
      league.endWeek
  ) {
    issues.push(
      "Historical settings are not verified for this league."
    );
  }

  if (
    !Number.isInteger(
      throughWeek
    ) ||
    throughWeek <
      league.startWeek ||
    throughWeek >
      league.endWeek
  ) {
    issues.push(
      "Invalid historical schedule cutoff."
    );

    return {
      verified: false,
      issues,
      excludedConsolationMatchups,
      schedule:
        null as HistoricalSchedule | null,
    };
  }

  for (
    const source of sources
  ) {
    const week =
      source.week;

    if (
      !Number.isInteger(week) ||
      week <
        league.startWeek ||
      week > throughWeek
    ) {
      issues.push(
        "Schedule source belongs to an unexpected week."
      );

      continue;
    }

    if (
      seenWeeks.has(week)
    ) {
      issues.push(
        `Duplicate schedule source for week ${week}.`
      );

      continue;
    }

    seenWeeks.add(week);

    const returnedLeague =
      field(
        source.payload,
        "league_key"
      );

    const returnedWeek =
      field(
        source.payload,
        "week"
      );

    if (
      returnedLeague !==
        league.key ||
      returnedWeek === undefined ||
      Number(returnedWeek) !== week
    ) {
      issues.push(
        `Week ${week}: schedule identity does not match.`
      );

      continue;
    }

    const rawMatchups =
      nodes(source.payload)
        .filter(
          item =>
            item.matchup &&
            typeof item.matchup ===
              "object"
        )
        .map(
          item => item.matchup
        );

    if (
      rawMatchups.length === 0
    ) {
      issues.push(
        `Week ${week}: no schedule matchups returned.`
      );

      continue;
    }

    for (
      const matchup of rawMatchups
    ) {
      const matchupWeek =
        field(
          matchup,
          "week"
        );

      if (
        matchupWeek === undefined ||
        Number(matchupWeek) !== week
      ) {
        issues.push(
          `Week ${week}: matchup week does not match.`
        );

        continue;
      }

      const classification =
        classifyOfficialMatchup(
          matchup
        );

      if (
        classification ===
        "excluded-consolation"
      ) {
        excludedConsolationMatchups++;

        continue;
      }

      if (
        classification ===
        "unverified"
      ) {
        issues.push(
          `Week ${week}: unknown matchup classification.`
        );

        continue;
      }

      const rawTeams =
        nodes(matchup)
          .filter(
            item =>
              item.team &&
              typeof item.team ===
                "object"
          )
          .map(
            item => item.team
          );

      if (
        rawTeams.length !== 2
      ) {
        issues.push(
          `Week ${week}: expected exactly two teams.`
        );

        continue;
      }

      const teamAKey =
        field(
          rawTeams[0],
          "team_key"
        );

      const teamBKey =
        field(
          rawTeams[1],
          "team_key"
        );

      if (
        !teamAKey ||
        !teamBKey ||
        teamAKey === teamBKey ||
        !teamKeys.includes(
          teamAKey
        ) ||
        !teamKeys.includes(
          teamBKey
        )
      ) {
        issues.push(
          `Week ${week}: invalid scheduled team pairing.`
        );

        continue;
      }

      matchups.push({
        week,

        teamAKey,
        teamBKey,

        isPlayoffs:
          classification ===
          "championship-playoff",
      });
    }
  }

  for (
    let week = league.startWeek;
    week <= throughWeek;
    week++
  ) {
    if (
      !seenWeeks.has(week)
    ) {
      issues.push(
        `Missing schedule source for week ${week}.`
      );
    }
  }

  const candidate:
    HistoricalSchedule = {
      season:
        league.season,

      leagueKey:
        league.key,

      throughWeek,

      regularSeasonEndWeek:
        settings.regularSeasonEndWeek,

      sourceVerified:
        issues.length === 0,

      matchups,
    };

  const validation =
    validateOfficialSchedule(
      league,
      candidate,
      teamKeys
    );

  issues.push(
    ...validation.issues
  );

  const verified =
    issues.length === 0;

  return {
    verified,

    issues,

    excludedConsolationMatchups,

    schedule:
      verified
        ? candidate
        : null,
  };
}
