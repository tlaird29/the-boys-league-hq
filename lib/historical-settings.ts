
import {
  nodes,
  field,
} from "./season-analysis";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

export type HistoricalLeagueSettings = {
  season: number;
  leagueKey: string;

  startWeek: number;
  endWeek: number;

  regularSeasonEndWeek: number;

  playoffStartWeek: number;
  playoffTeams: number;
  playoffRounds: number;

  sourceVerified: boolean;
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

  const number =
    Number(value);

  return Number.isInteger(number)
    ? number
    : null;
}

export function extractHistoricalSettings(
  payload: unknown,
  league: HistoricalLeague
) {
  const issues: string[] = [];

  const returnedLeague =
    field(
      payload,
      "league_key"
    );

  const returnedSeason =
    integer(
      field(
        payload,
        "season"
      )
    );

  if (
    returnedLeague !== league.key
  ) {
    issues.push(
      "Settings belong to another league."
    );
  }

  if (
    returnedSeason !== league.season
  ) {
    issues.push(
      "Settings belong to another season or season is missing."
    );
  }

  const settingsObjects =
    nodes(payload)
      .filter(
        item =>
          item.settings &&
          typeof item.settings ===
            "object"
      )
      .map(
        item => item.settings
      );

  if (
    settingsObjects.length !== 1
  ) {
    issues.push(
      "Expected exactly one league settings object."
    );

    return {
      verified: false,
      issues,
      settings:
        null as HistoricalLeagueSettings | null,
    };
  }

  const raw =
    settingsObjects[0];

  const usesPlayoffs =
    field(
      raw,
      "uses_playoff"
    );

  const playoffTeams =
    integer(
      field(
        raw,
        "num_playoff_teams"
      )
    );

  const playoffStartWeek =
    integer(
      field(
        raw,
        "playoff_start_week"
      )
    );

  if (
    usesPlayoffs !== "1"
  ) {
    issues.push(
      "Championship playoffs could not be verified."
    );
  }

  if (
    playoffTeams !== 8
  ) {
    issues.push(
      "Expected eight championship playoff teams."
    );
  }

  if (
    playoffStartWeek === null ||
    playoffStartWeek <=
      league.startWeek ||
    playoffStartWeek >
      league.endWeek
  ) {
    issues.push(
      "Invalid or missing playoff start week."
    );
  }

  const returnedStartWeek =
    integer(
      field(
        payload,
        "start_week"
      )
    );

  const returnedEndWeek =
    integer(
      field(
        payload,
        "end_week"
      )
    );

  if (
    returnedStartWeek !==
      league.startWeek ||
    returnedEndWeek !==
      league.endWeek
  ) {
    issues.push(
      "Season calendar could not be verified."
    );
  }

  const playoffRounds =
    playoffStartWeek !== null
      ? league.endWeek -
        playoffStartWeek + 1
      : 0;

  if (
    playoffRounds !== 3
  ) {
    issues.push(
      "Season does not match the expected three-week championship format."
    );
  }

  if (
    issues.length > 0 ||
    playoffStartWeek === null ||
    playoffTeams === null
  ) {
    return {
      verified: false,
      issues,
      settings:
        null as HistoricalLeagueSettings | null,
    };
  }

  const settings:
    HistoricalLeagueSettings = {
      season:
        league.season,

      leagueKey:
        league.key,

      startWeek:
        league.startWeek,

      endWeek:
        league.endWeek,

      regularSeasonEndWeek:
        playoffStartWeek - 1,

      playoffStartWeek,

      playoffTeams,

      playoffRounds,

      sourceVerified: true,
    };

  return {
    verified: true,
    issues,
    settings,
  };
}
