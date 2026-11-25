
import {
  classifyOfficialMatchup,
  filterOfficialMatchups,
  prepareOfficialScoreboard,
} from "./official-matchups";

import {
  validateOfficialSchedule,
  expectedChampionshipMatchups,
} from "./official-schedule-validation";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  HistoricalSchedule,
} from "./historical-reconciliation";

export function runOfficialMatchupTests() {
  const results: {
    name: string;
    passed: boolean;
    error?: string;
  }[] = [];

  function test(
    name: string,
    check: () => boolean
  ) {
    try {
      const passed = check();

      results.push({
        name,
        passed,

        ...(!passed
          ? {
              error:
                "Expected result was not returned.",
            }
          : {}),
      });

    } catch (error) {
      results.push({
        name,
        passed: false,

        error:
          error instanceof Error
            ? error.message
            : "Unexpected test error.",
      });
    }
  }

  const regular = {
    week: "1",
    is_playoffs: "0",
    is_consolation: "0",
  };

  const playoff = {
    week: "15",
    is_playoffs: "1",
    is_consolation: "0",
  };

  const consolation = {
    week: "15",
    is_playoffs: "1",
    is_consolation: "1",
  };

  const leagueKey =
    "999.l.12345";

  const league: HistoricalLeague = {
    season: 2020,
    key: leagueKey,
    name: "Fictional Test League",
    teamCount: 10,
    startWeek: 1,
    endWeek: 17,
    finished: false,
    renewedFrom: null,
  };

  const teamKeys =
    Array.from(
      { length: 10 },
      (_, index) =>
        `${leagueKey}.t.${index + 1}`
    );

  const schedule: HistoricalSchedule = {
    season: 2020,
    leagueKey,
    throughWeek: 1,
    regularSeasonEndWeek: 14,
    sourceVerified: true,

    matchups: Array.from(
      { length: 5 },
      (_, index) => ({
        week: 1,

        teamAKey:
          teamKeys[index * 2],

        teamBKey:
          teamKeys[index * 2 + 1],

        isPlayoffs: false,
      })
    ),
  };

  const mixedScoreboard = {
    fantasy_content: {
      league: [
        {
          league_key: leagueKey,
        },
        {
          scoreboard: {
            week: "15",

            matchups: [
              {
                matchup: playoff,
              },
              {
                matchup: consolation,
              },
            ],
          },
        },
      ],
    },
  };

  test(
    "Regular-season classification",
    () =>
      classifyOfficialMatchup(
        regular
      ) === "regular-season"
  );

  test(
    "Championship playoff classification",
    () =>
      classifyOfficialMatchup(
        playoff
      ) ===
      "championship-playoff"
  );

  test(
    "Consolation exclusion",
    () =>
      classifyOfficialMatchup(
        consolation
      ) ===
      "excluded-consolation"
  );

  test(
    "Missing playoff classification",
    () =>
      classifyOfficialMatchup({
        week: "1",
      }) === "unverified"
  );

  test(
    "Ambiguous playoff classification",
    () =>
      classifyOfficialMatchup({
        is_playoffs: "1",
      }) === "unverified"
  );

  test(
    "Mixed scoreboard exclusion",
    () => {
      const result =
        filterOfficialMatchups(
          mixedScoreboard
        );

      return (
        result.verified &&
        result.officialMatchups
          .length === 1 &&
        result
          .excludedConsolationMatchups
          === 1
      );
    }
  );

  test(
    "Official scoreboard preparation",
    () => {
      const result =
        prepareOfficialScoreboard(
          mixedScoreboard,
          leagueKey,
          15
        );

      return (
        result.verified &&
        result.payload !== null &&
        result.championshipMatchups
          === 1
      );
    }
  );

  test(
    "Wrong league rejection",
    () =>
      !prepareOfficialScoreboard(
        mixedScoreboard,
        "999.l.54321",
        15
      ).verified
  );

  test(
    "Wrong week rejection",
    () =>
      !prepareOfficialScoreboard(
        mixedScoreboard,
        leagueKey,
        16
      ).verified
  );

  test(
    "Complete regular-season schedule",
    () =>
      validateOfficialSchedule(
        league,
        schedule,
        teamKeys
      ).verified
  );

  test(
    "Missing regular-season matchup",
    () =>
      !validateOfficialSchedule(
        league,
        {
          ...schedule,

          matchups:
            schedule.matchups.slice(
              0,
              4
            ),
        },
        teamKeys
      ).verified
  );

  test(
    "Duplicate regular-season team",
    () =>
      !validateOfficialSchedule(
        league,
        {
          ...schedule,

          matchups:
            schedule.matchups.map(
              (game, index) =>
                index === 0
                  ? {
                      ...game,

                      teamAKey:
                        teamKeys[2],
                    }
                  : game
            ),
        },
        teamKeys
      ).verified
  );

  test(
    "Incorrect playoff classification",
    () =>
      !validateOfficialSchedule(
        league,
        {
          ...schedule,

          matchups:
            schedule.matchups.map(
              game => ({
                ...game,
                isPlayoffs: true,
              })
            ),
        },
        teamKeys
      ).verified
  );

  test(
    "Unverified schedule rejection",
    () =>
      !validateOfficialSchedule(
        league,
        {
          ...schedule,
          sourceVerified: false,
        },
        teamKeys
      ).verified
  );

  test(
    "Eight-team playoff matchup counts",
    () =>
      expectedChampionshipMatchups(
        1
      ) === 4 &&
      expectedChampionshipMatchups(
        2
      ) === 2 &&
      expectedChampionshipMatchups(
        3
      ) === 1 &&
      expectedChampionshipMatchups(
        4
      ) === null
  );

  const passed =
    results.filter(
      result => result.passed
    ).length;

  return {
    ok:
      passed === results.length,

    mode:
      "fictional-official-matchup-tests",

    total:
      results.length,

    passed,

    failed:
      results.length - passed,

    results,

    yahooRequests: 0,
    aiRequests: 0,
    databaseWrites: 0,
    emailsSent: 0,
  };
}
