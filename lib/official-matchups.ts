
import {
  nodes,
  field,
} from "./season-analysis";

export type OfficialMatchupType =
  | "regular-season"
  | "championship-playoff"
  | "excluded-consolation"
  | "unverified";

export function classifyOfficialMatchup(
  matchup: unknown
): OfficialMatchupType {
  const playoffFlag = field(
    matchup,
    "is_playoffs"
  );

  const consolationFlag = field(
    matchup,
    "is_consolation"
  );

  if (consolationFlag === "1") {
    return "excluded-consolation";
  }

  if (
    consolationFlag !== undefined &&
    consolationFlag !== "0"
  ) {
    return "unverified";
  }

  if (playoffFlag === "0") {
    return "regular-season";
  }

  if (
    playoffFlag === "1" &&
    consolationFlag === "0"
  ) {
    return "championship-playoff";
  }

  return "unverified";
}

export function filterOfficialMatchups(
  payload: unknown
) {
  const matchups = nodes(payload)
    .filter(
      item =>
        item.matchup &&
        typeof item.matchup === "object"
    )
    .map(item => item.matchup);

  const officialMatchups:
    unknown[] = [];

  const issues: string[] = [];

  let regularSeasonMatchups = 0;
  let championshipMatchups = 0;
  let excludedConsolationMatchups = 0;

  for (const matchup of matchups) {
    const classification =
      classifyOfficialMatchup(
        matchup
      );

    switch (classification) {
      case "regular-season":
        regularSeasonMatchups++;

        officialMatchups.push(
          matchup
        );

        break;

      case "championship-playoff":
        championshipMatchups++;

        officialMatchups.push(
          matchup
        );

        break;

      case "excluded-consolation":
        excludedConsolationMatchups++;
        break;

      default:
        issues.push(
          "Matchup classification could not be verified."
        );
    }
  }

  if (matchups.length === 0) {
    issues.push(
      "No matchups were returned."
    );
  }

  return {
    verified:
      issues.length === 0,

    totalReturned:
      matchups.length,

    officialMatchups,

    regularSeasonMatchups,
    championshipMatchups,

    excludedConsolationMatchups,

    issues,
  };
}

export function prepareOfficialScoreboard(
  payload: unknown,
  expectedLeagueKey: string,
  expectedWeek: number
) {
  const leagueKey = field(
    payload,
    "league_key"
  );

  const week = field(
    payload,
    "week"
  );

  const filtered =
    filterOfficialMatchups(
      payload
    );

  const issues = [
    ...filtered.issues,
  ];

  if (
    leagueKey !==
    expectedLeagueKey
  ) {
    issues.push(
      "Scoreboard league identity does not match."
    );
  }

  if (
    week === undefined ||
    Number(week) !== expectedWeek
  ) {
    issues.push(
      "Scoreboard week does not match."
    );
  }

  for (
    const matchup of
    filtered.officialMatchups
  ) {
    const matchupWeek = field(
      matchup,
      "week"
    );

    if (
      matchupWeek === undefined ||
      Number(matchupWeek) !==
        expectedWeek
    ) {
      issues.push(
        "Official matchup belongs to another week."
      );
    }
  }

  return {
    ...filtered,

    verified:
      issues.length === 0,

    issues,

    payload:
      issues.length === 0
        ? {
            fantasy_content: {
              league: [
                {
                  league_key:
                    expectedLeagueKey,
                },
                {
                  scoreboard: {
                    week:
                      String(expectedWeek),

                    matchups:
                      filtered.officialMatchups
                        .map(matchup => ({
                          matchup,
                        })),
                  },
                },
              ],
            },
          }
        : null,
  };
}
