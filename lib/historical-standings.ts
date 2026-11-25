
import {
  nodes,
  field,
} from "./season-analysis";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  HistoricalStandings,
  OfficialTeamStanding,
} from "./historical-reconciliation";

import type {
  OfficialFinalResults,
  OfficialFinalPlacement,
} from "./championship-bracket";

function readNumber(
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

  return Number.isFinite(number)
    ? number
    : null;
}

function readCount(
  value: string | undefined
): number | null {
  const number =
    readNumber(value);

  return (
    number !== null &&
    Number.isInteger(number) &&
    number >= 0
  )
    ? number
    : null;
}

export function extractHistoricalStandings(
  payload: unknown,
  league: HistoricalLeague,
  teamKeys: readonly string[],
  throughWeek: number,
  regularSeasonEndWeek: number,

  // The retrieval workflow must establish
  // the actual standings cutoff.
  // Do not infer it from the requested week.
  verifiedSourceCutoff:
    number | null = null
) {
  const issues: string[] = [];

  const standings:
    OfficialTeamStanding[] = [];

  const placements:
    OfficialFinalPlacement[] = [];

  const seenTeams =
    new Set<string>();

  const seenRanks =
    new Set<number>();

  if (
    field(
      payload,
      "league_key"
    ) !== league.key
  ) {
    issues.push(
      "Standings belong to another league."
    );
  }

  if (
    readCount(
      field(
        payload,
        "season"
      )
    ) !== league.season
  ) {
    issues.push(
      "Standings season could not be verified."
    );
  }

  if (
    !Number.isInteger(
      throughWeek
    ) ||
    throughWeek <
      league.startWeek ||
    throughWeek >
      league.endWeek ||
    !Number.isInteger(
      regularSeasonEndWeek
    ) ||
    regularSeasonEndWeek <
      league.startWeek ||
    regularSeasonEndWeek >=
      league.endWeek
  ) {
    issues.push(
      "Invalid standings calendar."
    );
  }

  const expectedCutoff =
    Math.min(
      throughWeek,
      regularSeasonEndWeek
    );

  if (
    verifiedSourceCutoff !==
    expectedCutoff
  ) {
    issues.push(
      "Regular-season standings cutoff has not been verified."
    );
  }

  if (
    teamKeys.length !==
      league.teamCount ||
    new Set(teamKeys).size !==
      league.teamCount
  ) {
    issues.push(
      "Expected historical team membership is incomplete."
    );
  }

  const expectedGames =
    expectedCutoff -
    league.startWeek + 1;

  const standingsObjects =
    nodes(payload)
      .filter(
        item =>
          item.standings &&
          typeof item.standings ===
            "object"
      )
      .map(
        item => item.standings
      );

  if (
    standingsObjects.length !== 1
  ) {
    issues.push(
      "Expected exactly one standings object."
    );
  }

  const rawTeams =
    standingsObjects.flatMap(
      object =>
        nodes(object)
          .filter(
            item =>
              item.team &&
              typeof item.team ===
                "object"
          )
          .map(
            item => item.team
          )
    );

  for (
    const rawTeam of rawTeams
  ) {
    const teamKey =
      field(
        rawTeam,
        "team_key"
      );

    const teamName =
      field(
        rawTeam,
        "name"
      );

    if (
      !teamKey ||
      !teamName?.trim() ||
      !teamKeys.includes(
        teamKey
      ) ||
      seenTeams.has(teamKey)
    ) {
      issues.push(
        "Invalid or duplicated standings team."
      );

      continue;
    }

    seenTeams.add(teamKey);

    const rawStandings =
      nodes(rawTeam)
        .filter(
          item =>
            item.team_standings &&
            typeof item.team_standings ===
              "object"
        )
        .map(
          item =>
            item.team_standings
        );

    if (
      rawStandings.length !== 1
    ) {
      issues.push(
        "Missing or duplicated team standings."
      );

      continue;
    }

    const record =
      rawStandings[0];

    const outcomes =
      nodes(record)
        .filter(
          item =>
            item.outcome_totals &&
            typeof item.outcome_totals ===
              "object"
        )
        .map(
          item =>
            item.outcome_totals
        );

    if (
      outcomes.length !== 1
    ) {
      issues.push(
        "Missing or duplicated team outcome totals."
      );

      continue;
    }

    const wins =
      readCount(
        field(
          outcomes[0],
          "wins"
        )
      );

    const losses =
      readCount(
        field(
          outcomes[0],
          "losses"
        )
      );

    const ties =
      readCount(
        field(
          outcomes[0],
          "ties"
        )
      );

    const pointsFor =
      readNumber(
        field(
          record,
          "points_for"
        )
      );

    const pointsAgainst =
      readNumber(
        field(
          record,
          "points_against"
        )
      );

    if (
      wins === null ||
      losses === null ||
      ties === null ||
      pointsFor === null ||
      pointsAgainst === null
    ) {
      issues.push(
        "Missing or invalid official standings totals."
      );

      continue;
    }

    if (
      wins + losses + ties !==
      expectedGames
    ) {
      issues.push(
        "Official standings game count does not match the regular-season cutoff."
      );
    }

    standings.push({
      teamKey,

      wins,
      losses,
      ties,

      pointsFor,
      pointsAgainst,
    });

    if (league.finished) {
      // A final playoff placement must
      // be explicit. Regular-season rank
      // is not a championship result.

      const finalRank =
        readCount(
          field(
            record,
            "playoff_rank"
          )
        );

      if (
        finalRank === null ||
        finalRank < 1 ||
        finalRank >
          league.teamCount ||
        seenRanks.has(finalRank)
      ) {
        issues.push(
          "Missing or invalid final playoff placement."
        );

        continue;
      }

      seenRanks.add(finalRank);

      placements.push({
        teamKey,
        teamName,
        rank: finalRank,
      });
    }
  }

  if (
    standings.length !==
    league.teamCount
  ) {
    issues.push(
      "Official standings do not include every historical team."
    );
  }

  if (
    league.finished &&
    placements.length !==
      league.teamCount
  ) {
    issues.push(
      "Official final placements are incomplete."
    );
  }

  const verified =
    issues.length === 0;

  const officialStandings:
    HistoricalStandings | null =
      verified
        ? {
            season:
              league.season,

            leagueKey:
              league.key,

            throughWeek:
              expectedCutoff,

            sourceVerified: true,

            teams:
              standings,
          }
        : null;

  const finalResults:
    OfficialFinalResults | null =
      verified &&
      league.finished
        ? {
            season:
              league.season,

            leagueKey:
              league.key,

            finished: true,

            sourceVerified: true,

            placements,
          }
        : null;

  return {
    verified,

    issues,

    standings:
      officialStandings,

    finalResults,
  };
}
