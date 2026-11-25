
import {
  ACTIVE_MANAGERS,
} from "./league-managers";

import {
  extractHistoricalSettings,
} from "./historical-settings";

import {
  extractHistoricalSchedule,
} from "./historical-schedule";

import {
  extractHistoricalStandings,
} from "./historical-standings";

import {
  extractHistoricalBracket,
} from "./historical-bracket-extraction";

import {
  buildHistoricalSeasonEvidence,
  type HistoricalSeasonSources,
} from "./historical-evidence-builder";

import {
  processHistoricalLeague,
} from "./historical-processing";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  HistoricalSchedule,
} from "./historical-reconciliation";

function createFixture() {
  const league: HistoricalLeague = {
    season: 2020,
    key: "999.l.12345",
    name: "Fictional Test League",
    teamCount: 10,
    startWeek: 1,
    endWeek: 17,
    finished: false,
    renewedFrom: null,
  };

  const teamKeys = ACTIVE_MANAGERS.map(
    (_, index) =>
      `${league.key}.t.${index + 1}`
  );

  const metadata = {
    league_key: league.key,
    season: String(league.season),
    start_week: "1",
    end_week: "17",
  };

  const settingsPayload = {
    fantasy_content: {
      league: [
        metadata,
        {
          settings: {
            uses_playoff: "1",
            num_playoff_teams: "8",
            playoff_start_week: "15",
          },
        },
      ],
    },
  };

  const teamsPayload = {
    fantasy_content: {
      league: [
        metadata,
        {
          teams: ACTIVE_MANAGERS.map(
            (manager, index) => ({
              team: [
                {
                  team_key: teamKeys[index],
                  name: `Fictional Team ${index + 1}`,
                },
                {
                  managers: [
                    {
                      manager: {
                        guid: `fictional-guid-${index}`,
                        nickname: manager.name,
                      },
                    },
                  ],
                },
              ],
            })
          ),
        },
      ],
    },
  };

  function matchup(
    week: number,
    a: number,
    b: number,
    playoffs = false,
    consolation = false
  ) {
    return {
      matchup: {
        week: String(week),

        status: "postevent",
        is_completed: "1",

        is_playoffs:
          playoffs ? "1" : "0",

        is_consolation:
          consolation ? "1" : "0",

        is_tied: "0",

        winner_team_key:
          teamKeys[a],

        teams: [
          {
            team: [
              {
                team_key: teamKeys[a],
                name: `Fictional Team ${a + 1}`,
              },
              {
                team_points: {
                  total: "150",
                },
              },
            ],
          },
          {
            team: [
              {
                team_key: teamKeys[b],
                name: `Fictional Team ${b + 1}`,
              },
              {
                team_points: {
                  total: "100",
                },
              },
            ],
          },
        ],
      },
    };
  }

  function scoreboard(
    week: number,
    matchups: ReturnType<
      typeof matchup
    >[]
  ) {
    return {
      fantasy_content: {
        league: [
          metadata,
          {
            scoreboard: {
              week: String(week),
              matchups,
            },
          },
        ],
      },
    };
  }

  const weekOneMatchups =
    Array.from(
      { length: 5 },
      (_, index) =>
        matchup(
          1,
          index * 2,
          index * 2 + 1
        )
    );

  const weekOne =
    scoreboard(
      1,
      weekOneMatchups
    );

  const standingsPayload = {
    fantasy_content: {
      league: [
        metadata,
        {
          standings: {
            teams: teamKeys.map(
              (teamKey, index) => ({
                team: [
                  {
                    team_key: teamKey,
                    name: `Fictional Team ${index + 1}`,
                  },
                  {
                    team_standings: {
                      rank: String(index + 1),

                      outcome_totals: {
                        wins:
                          index % 2 === 0
                            ? "1"
                            : "0",

                        losses:
                          index % 2 === 0
                            ? "0"
                            : "1",

                        ties: "0",
                      },

                      points_for:
                        index % 2 === 0
                          ? "150"
                          : "100",

                      points_against:
                        index % 2 === 0
                          ? "100"
                          : "150",
                    },
                  },
                ],
              })
            ),
          },
        },
      ],
    },
  };

  const sources: HistoricalSeasonSources = {
    league,
    throughWeek: 1,
    settingsPayload,
    teamsPayload,
    standingsPayload,
    verifiedStandingsCutoff: 1,

    scheduleSources: [
      {
        week: 1,
        payload: weekOne,
      },
    ],

    scoreboardSources: [
      {
        week: 1,
        payload: weekOne,
      },
    ],
  };

  const managerIdentities =
    ACTIVE_MANAGERS.map(
      (manager, index) => ({
        managerId: manager.id,
        managerName: manager.name,

        yahooGuids: [
          `fictional-guid-${index}`,
        ],
      })
    );

  return {
    league,
    teamKeys,
    metadata,
    settingsPayload,
    teamsPayload,
    standingsPayload,
    sources,
    managerIdentities,
    weekOneMatchups,
    matchup,
    scoreboard,
  };
}

export function runHistoricalExtractionTests() {
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

  const fixture =
    createFixture();

  const {
    league,
    teamKeys,
    metadata,
    settingsPayload,
    standingsPayload,
    sources,
    managerIdentities,
    weekOneMatchups,
    matchup,
    scoreboard,
  } = fixture;

  function settings() {
    const result =
      extractHistoricalSettings(
        settingsPayload,
        league
      );

    if (
      !result.verified ||
      !result.settings
    ) {
      throw new Error(
        result.issues.join("; ")
      );
    }

    return result.settings;
  }

  function standings(
    cutoff: number | null = 1
  ) {
    return extractHistoricalStandings(
      standingsPayload,
      league,
      teamKeys,
      1,
      14,
      cutoff
    );
  }

  function completedBracket() {
    const completedLeague = {
      ...league,
      finished: true,
    };

    const pairs = [
      [15, 0, 7],
      [15, 3, 4],
      [15, 1, 6],
      [15, 2, 5],
      [16, 0, 3],
      [16, 1, 2],
      [17, 0, 1],
    ];

    const schedule: HistoricalSchedule = {
      season: league.season,
      leagueKey: league.key,
      throughWeek: 17,
      regularSeasonEndWeek: 14,
      sourceVerified: true,

      matchups: pairs.map(
        ([week, a, b]) => ({
          week,
          teamAKey: teamKeys[a],
          teamBKey: teamKeys[b],
          isPlayoffs: true,
        })
      ),
    };

    return {
      completedLeague,
      schedule,
    };
  }

  // SETTINGS TESTS

  test(
    "Historical settings extraction",
    () => {
      const result = settings();

      return (
        result.playoffTeams === 8 &&
        result.regularSeasonEndWeek === 14 &&
        result.playoffRounds === 3
      );
    }
  );

  test(
    "Different historical season length",
    () => {
      const result =
        extractHistoricalSettings(
          {
            fantasy_content: {
              league: [
                {
                  ...metadata,
                  end_week: "16",
                },
                {
                  settings: {
                    uses_playoff: "1",
                    num_playoff_teams: "8",
                    playoff_start_week: "14",
                  },
                },
              ],
            },
          },
          {
            ...league,
            endWeek: 16,
          }
        );

      return (
        result.verified &&
        result.settings
          ?.regularSeasonEndWeek === 13
      );
    }
  );

  test(
    "Incorrect playoff team count rejected",
    () =>
      !extractHistoricalSettings(
        {
          fantasy_content: {
            league: [
              metadata,
              {
                settings: {
                  uses_playoff: "1",
                  num_playoff_teams: "6",
                  playoff_start_week: "15",
                },
              },
            ],
          },
        },
        league
      ).verified
  );

  test(
    "Incorrect league settings rejected",
    () =>
      !extractHistoricalSettings(
        settingsPayload,
        {
          ...league,
          key: "999.l.54321",
        }
      ).verified
  );

  // SCHEDULE TESTS

  test(
    "Complete historical schedule extraction",
    () => {
      const result =
        extractHistoricalSchedule(
          league,
          settings(),
          teamKeys,
          sources.scheduleSources,
          1
        );

      return (
        result.verified &&
        result.schedule
          ?.matchups.length === 5
      );
    }
  );

  test(
    "Missing schedule week rejected",
    () =>
      !extractHistoricalSchedule(
        league,
        settings(),
        teamKeys,
        [],
        1
      ).verified
  );

  test(
    "Duplicate schedule source rejected",
    () =>
      !extractHistoricalSchedule(
        league,
        settings(),
        teamKeys,
        [
          ...sources.scheduleSources,
          ...sources.scheduleSources,
        ],
        1
      ).verified
  );

  test(
    "Incomplete regular-season schedule rejected",
    () =>
      !extractHistoricalSchedule(
        league,
        settings(),
        teamKeys,
        [
          {
            week: 1,
            payload: scoreboard(
              1,
              weekOneMatchups.slice(0, 4)
            ),
          },
        ],
        1
      ).verified
  );

  test(
    "Consolation games excluded from schedule",
    () => {
      const scheduleSources =
        Array.from(
          { length: 14 },
          (_, index) => ({
            week: index + 1,

            payload: scoreboard(
              index + 1,

              Array.from(
                { length: 5 },
                (_, pair) =>
                  matchup(
                    index + 1,
                    pair * 2,
                    pair * 2 + 1
                  )
              )
            ),
          })
        );

      scheduleSources.push({
        week: 15,

        payload: scoreboard(
          15,
          [
            matchup(15, 0, 7, true),
            matchup(15, 3, 4, true),
            matchup(15, 1, 6, true),
            matchup(15, 2, 5, true),

            matchup(
              15, 8, 9, true, true
            ),
          ]
        ),
      });

      const result =
        extractHistoricalSchedule(
          league,
          settings(),
          teamKeys,
          scheduleSources,
          15
        );

      return (
        result.verified &&
        result.excludedConsolationMatchups === 1 &&
        result.schedule
          ?.matchups.length === 74
      );
    }
  );

  // STANDINGS TESTS

  test(
    "Official standings extraction",
    () => {
      const result = standings();

      return (
        result.verified &&
        result.standings
          ?.teams.length === 10 &&
        result.standings
          ?.teams[0].pointsFor === 150
      );
    }
  );

  test(
    "Unverified standings cutoff rejected",
    () =>
      !standings(null).verified
  );

  test(
    "Incorrect standings cutoff rejected",
    () =>
      !standings(2).verified
  );

  test(
    "Missing standings teams rejected",
    () =>
      !extractHistoricalStandings(
        {
          fantasy_content: {
            league: [
              metadata,
              {
                standings: {
                  teams: [],
                },
              },
            ],
          },
        },
        league,
        teamKeys,
        1,
        14,
        1
      ).verified
  );

  // CHAMPIONSHIP TESTS

  test(
    "Eight-team championship bracket extraction",
    () => {
      const {
        completedLeague,
        schedule,
      } = completedBracket();

      const result =
        extractHistoricalBracket(
          completedLeague,
          schedule
        );

      return (
        result.verified &&
        result.bracket
          ?.playoffTeamKeys.length === 8 &&
        result.bracket
          ?.rounds.length === 3
      );
    }
  );

  test(
    "Missing championship game rejected",
    () => {
      const {
        completedLeague,
        schedule,
      } = completedBracket();

      return !extractHistoricalBracket(
        completedLeague,
        {
          ...schedule,

          matchups:
            schedule.matchups.slice(0, 6),
        }
      ).verified;
    }
  );

  test(
    "Unexpected championship participant rejected",
    () => {
      const {
        completedLeague,
        schedule,
      } = completedBracket();

      return !extractHistoricalBracket(
        completedLeague,
        {
          ...schedule,

          matchups:
            schedule.matchups.map(
              game =>
                game.week === 17
                  ? {
                      ...game,
                      teamAKey: teamKeys[9],
                    }
                  : game
            ),
        }
      ).verified;
    }
  );

  // EVIDENCE BUILDER TESTS

  test(
    "Complete season evidence preparation",
    () => {
      const result =
        buildHistoricalSeasonEvidence(
          sources
        );

      if (!result.verified) {
        throw new Error(
          result.issues.join("; ")
        );
      }

      return (
        result.evidence?.teams.length === 10 &&
        result.evidence
          ?.schedule.matchups.length === 5
      );
    }
  );

  test(
    "Missing scoreboard rejected",
    () =>
      !buildHistoricalSeasonEvidence({
        ...sources,
        scoreboardSources: [],
      }).verified
  );

  test(
    "Duplicate scoreboard rejected",
    () =>
      !buildHistoricalSeasonEvidence({
        ...sources,

        scoreboardSources: [
          ...sources.scoreboardSources,
          ...sources.scoreboardSources,
        ],
      }).verified
  );

  // COMPLETE PROCESSING TEST

  test(
    "End-to-end historical processing",
    () => {
      const result =
        processHistoricalLeague({
          throughSeason: 2020,

          leagueCandidates: [
            league,
          ],

          verifiedLeagueIdentities: [
            {
              season: 2020,
              leagueKey: league.key,
            },
          ],

          verifiedManagerIdentities:
            managerIdentities,

          confirmedTeamAssignments: [],

          sources: [
            sources,
          ],
        });

      if (!result.verified) {
        throw new Error(
          [
            ...result.issues,

            ...result.preparationReports
              .flatMap(
                report => report.issues
              ),

            ...(
              result.pipeline?.reports
                .flatMap(
                  report => report.issues
                ) ?? []
            ),
          ].join("; ")
        );
      }

      return (
        result.seasonsPrepared === 1 &&
        result.pipeline
          ?.matchupsVerified === 5 &&
        result.records !== null &&
        result.readyForPublication === false &&
        result.yahooRequests === 0 &&
        result.aiRequests === 0 &&
        result.databaseWrites === 0 &&
        result.emailsSent === 0
      );
    }
  );

  const passed =
    results.filter(
      result => result.passed
    ).length;

  return {
    ok:
      passed === results.length,

    mode:
      "fictional-historical-extraction-tests",

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
