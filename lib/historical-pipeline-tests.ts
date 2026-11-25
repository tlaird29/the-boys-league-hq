
import {
  ACTIVE_MANAGERS,
} from "./league-managers";

import {
  runHistoricalPipeline,
  type HistoricalPipelineInput,
  type HistoricalSeasonEvidence,
} from "./historical-pipeline";

import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  HistoricalTeamIdentity,
} from "./historical-manager-identity";

import type {
  ScheduledMatchup,
  OfficialTeamStanding,
} from "./historical-reconciliation";

import type {
  ChampionshipRound,
} from "./championship-bracket";

function createFictionalSeason(
  season: number,
  renewedFrom: string | null = null
) {
  const leagueKey =
    `999${season}.l.12345`;

  const league: HistoricalLeague = {
    season,
    key: leagueKey,
    name: `Fictional League ${season}`,
    teamCount: 10,
    startWeek: 1,
    endWeek: 17,
    finished: true,
    renewedFrom,
  };

  const teams: HistoricalTeamIdentity[] =
    ACTIVE_MANAGERS.map(
      (manager, index) => ({
        season,
        leagueKey,

        teamKey:
          `${leagueKey}.t.${index + 1}`,

        teamName:
          `Fictional Team ${index + 1}`,

        yahooGuid:
          `fictional-guid-${manager.id}`,

        yahooNickname:
          manager.name,

        managerCount: 1,
      })
    );

  const standings:
    OfficialTeamStanding[] =
      teams.map(team => ({
        teamKey: team.teamKey,
        wins: 0,
        losses: 0,
        ties: 0,
        pointsFor: 0,
        pointsAgainst: 0,
      }));

  const schedule:
    ScheduledMatchup[] = [];

  const scoreboards: {
    week: number;
    payload: unknown;
  }[] = [];

  const rounds:
    ChampionshipRound[] = [];

  function createWeek(
    week: number,
    pairs: readonly (
      readonly [number, number]
    )[],
    isPlayoffs: boolean
  ) {
    const matchups = pairs.map(
      ([a, b]) => {
        const teamA = teams[a];
        const teamB = teams[b];

        const pointsA =
          150 - a + week;

        const pointsB =
          100 - b + week;

        schedule.push({
          week,
          teamAKey: teamA.teamKey,
          teamBKey: teamB.teamKey,
          isPlayoffs,
        });

        if (!isPlayoffs) {
          standings[a].wins++;
          standings[b].losses++;

          standings[a].pointsFor +=
            pointsA;

          standings[a].pointsAgainst +=
            pointsB;

          standings[b].pointsFor +=
            pointsB;

          standings[b].pointsAgainst +=
            pointsA;
        }

        return {
          matchup: {
            week: String(week),

            status: "postevent",

            is_completed: "1",

            is_playoffs:
              isPlayoffs ? "1" : "0",

            is_consolation: "0",

            is_tied: "0",

            winner_team_key:
              teamA.teamKey,

            teams: [
              {
                team: [
                  {
                    team_key:
                      teamA.teamKey,

                    name:
                      teamA.teamName,
                  },
                  {
                    team_points: {
                      total:
                        String(pointsA),
                    },
                  },
                ],
              },
              {
                team: [
                  {
                    team_key:
                      teamB.teamKey,

                    name:
                      teamB.teamName,
                  },
                  {
                    team_points: {
                      total:
                        String(pointsB),
                    },
                  },
                ],
              },
            ],
          },
        };
      }
    );

    scoreboards.push({
      week,

      payload: {
        fantasy_content: {
          league: [
            {
              league_key: leagueKey,
              season: String(season),
            },
            {
              scoreboard: {
                week: String(week),
                matchups,
              },
            },
          ],
        },
      },
    });
  }

  // Generate 14 regular-season weeks
  // using a rotating ten-team schedule.

  let rotation = [
    0, 1, 2, 3, 4,
    5, 6, 7, 8, 9,
  ];

  for (let week = 1; week <= 14; week++) {
    const pairs:
      [number, number][] = [];

    for (let i = 0; i < 5; i++) {
      const a = rotation[i];
      const b = rotation[9 - i];

      pairs.push(
        a < b ? [a, b] : [b, a]
      );
    }

    createWeek(
      week,
      pairs,
      false
    );

    rotation = [
      rotation[0],
      rotation[9],
      ...rotation.slice(1, 9),
    ];
  }

  // Seed the fictional playoff teams
  // from their regular-season records.

  const seeds = standings
    .map((standing, index) => ({
      index,
      wins: standing.wins,
      pointsFor: standing.pointsFor,
    }))
    .sort(
      (a, b) =>
        b.wins - a.wins ||
        b.pointsFor - a.pointsFor ||
        a.index - b.index
    )
    .map(team => team.index);

  const quarterfinals:
    [number, number][] = [
      [seeds[0], seeds[7]],
      [seeds[3], seeds[4]],
      [seeds[1], seeds[6]],
      [seeds[2], seeds[5]],
    ];

  const semifinals:
    [number, number][] = [
      [
        quarterfinals[0][0],
        quarterfinals[1][0],
      ],
      [
        quarterfinals[2][0],
        quarterfinals[3][0],
      ],
    ];

  const championship:
    [number, number][] = [
      [
        semifinals[0][0],
        semifinals[1][0],
      ],
    ];

  const playoffRounds = [
    {
      week: 15,
      round: "quarterfinal",
      pairs: quarterfinals,
    },
    {
      week: 16,
      round: "semifinal",
      pairs: semifinals,
    },
    {
      week: 17,
      round: "championship",
      pairs: championship,
    },
  ] as const;

  for (const round of playoffRounds) {
    createWeek(
      round.week,
      round.pairs,
      true
    );

    rounds.push({
      week: round.week,
      round: round.round,

      matchups: round.pairs.map(
        ([a, b]) => ({
          teamAKey: teams[a].teamKey,
          teamBKey: teams[b].teamKey,
        })
      ),

      byeTeamKeys: [],
    });
  }

  const champion =
    championship[0][0];

  const runnerUp =
    championship[0][1];

  const finalOrder = [
    champion,
    runnerUp,

    ...semifinals.map(
      pair => pair[1]
    ),

    ...quarterfinals.map(
      pair => pair[1]
    ),

    ...seeds.slice(8),
  ];

  const evidence:
    HistoricalSeasonEvidence = {
      season,
      leagueKey,
      throughWeek: 17,
      teams,
      scoreboards,

      schedule: {
        season,
        leagueKey,
        throughWeek: 17,
        regularSeasonEndWeek: 14,
        sourceVerified: true,
        matchups: schedule,
      },

      standings: {
        season,
        leagueKey,
        throughWeek: 14,
        sourceVerified: true,
        teams: standings,
      },

      bracket: {
        season,
        leagueKey,
        sourceVerified: true,

        playoffTeamKeys:
          seeds.slice(0, 8).map(
            index => teams[index].teamKey
          ),

        rounds,
      },

      finalResults: {
        season,
        leagueKey,
        finished: true,
        sourceVerified: true,

        placements: finalOrder.map(
          (index, rank) => ({
            teamKey:
              teams[index].teamKey,

            teamName:
              teams[index].teamName,

            rank: rank + 1,
          })
        ),
      },
    };

  return {
    league,
    evidence,
  };
}

function createInput(
  throughSeason = 2020
): HistoricalPipelineInput {
  const leagues: HistoricalLeague[] = [];

  const seasons:
    HistoricalSeasonEvidence[] = [];

  let previousKey: string | null =
    null;

  for (
    let season = 2020;
    season <= throughSeason;
    season++
  ) {
    const fixture =
      createFictionalSeason(
        season,
        previousKey
      );

    leagues.push(fixture.league);
    seasons.push(fixture.evidence);

    previousKey =
      fixture.league.key;
  }

  return {
    throughSeason,

    leagueCandidates: leagues,

    verifiedLeagueIdentities: [
      {
        season: throughSeason,

        leagueKey:
          leagues[leagues.length - 1].key,
      },
    ],

    verifiedManagerIdentities:
      ACTIVE_MANAGERS.map(
        manager => ({
          managerId: manager.id,
          managerName: manager.name,

          yahooGuids: [
            `fictional-guid-${manager.id}`,
          ],
        })
      ),

    confirmedTeamAssignments: [],

    seasons,
  };
}

function modifySeason(
  input: HistoricalPipelineInput,
  change: (
    season: HistoricalSeasonEvidence
  ) => HistoricalSeasonEvidence
): HistoricalPipelineInput {
  return {
    ...input,

    seasons: input.seasons.map(
      (season, index) =>
        index === 0
          ? change(season)
          : season
    ),
  };
}

export function runHistoricalPipelineTests() {
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

  function rejects(
    input: HistoricalPipelineInput
  ): boolean {
    const result =
      runHistoricalPipeline(input);

    return (
      !result.verified &&
      result.records === null &&
      result.readyForPublication === false
    );
  }

  test(
    "Complete ten-team season",
    () => {
      const result =
        runHistoricalPipeline(
          createInput()
        );

      return (
        result.verified &&
        result.matchupsVerified === 77 &&
        result.completedChampionships === 1 &&
        result.records !== null
      );
    }
  );

  test(
    "Six completed historical seasons",
    () => {
      const result =
        runHistoricalPipeline(
          createInput(2025)
        );

      return (
        result.verified &&
        result.seasonsVerified === 6 &&
        result.matchupsVerified === 462 &&
        result.completedChampionships === 6
      );
    }
  );

  test(
    "Missing historical season",
    () => {
      const input = createInput(2025);

      return rejects({
        ...input,
        seasons: input.seasons.slice(1),
      });
    }
  );

  test(
    "Missing historical league",
    () => {
      const input = createInput(2025);

      return rejects({
        ...input,

        leagueCandidates:
          input.leagueCandidates.slice(1),
      });
    }
  );

  test(
    "Duplicate season evidence",
    () => {
      const input = createInput();

      return rejects({
        ...input,

        seasons: [
          ...input.seasons,
          input.seasons[0],
        ],
      });
    }
  );

  test(
    "Unverified league identity",
    () => rejects({
      ...createInput(),
      verifiedLeagueIdentities: [],
    })
  );

  test(
    "Missing manager identity",
    () => {
      const input = createInput();

      return rejects({
        ...input,

        verifiedManagerIdentities:
          input.verifiedManagerIdentities.slice(1),
      });
    }
  );

  test(
    "Changed manager nickname",
    () => {
      const input = modifySeason(
        createInput(),
        season => ({
          ...season,

          teams: season.teams.map(
            team => ({
              ...team,
              yahooNickname:
                "Changed Fictional Nickname",
            })
          ),
        })
      );

      return runHistoricalPipeline(
        input
      ).verified;
    }
  );

  test(
    "Missing weekly scoreboard",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,

          scoreboards:
            season.scoreboards.slice(1),
        })
      )
    )
  );

  test(
    "Duplicate weekly scoreboard",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,

          scoreboards: [
            ...season.scoreboards,
            season.scoreboards[0],
          ],
        })
      )
    )
  );

  test(
    "Incorrect standings points",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,

          standings: {
            ...season.standings,

            teams:
              season.standings.teams.map(
                (team, index) =>
                  index === 0
                    ? {
                        ...team,

                        pointsFor:
                          team.pointsFor + 10,
                      }
                    : team
              ),
          },
        })
      )
    )
  );

  test(
    "Incorrect standings wins",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,

          standings: {
            ...season.standings,

            teams:
              season.standings.teams.map(
                (team, index) =>
                  index === 0
                    ? {
                        ...team,
                        wins: team.wins + 1,
                      }
                    : team
              ),
          },
        })
      )
    )
  );

  test(
    "Incorrect opponent pairing",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,

          schedule: {
            ...season.schedule,

            matchups:
              season.schedule.matchups.map(
                (matchup, index) =>
                  index === 0
                    ? {
                        ...matchup,

                        teamBKey:
                          season.teams[1].teamKey,
                      }
                    : matchup
              ),
          },
        })
      )
    )
  );

  test(
    "Unverified schedule source",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,

          schedule: {
            ...season.schedule,
            sourceVerified: false,
          },
        })
      )
    )
  );

  test(
    "Unverified standings source",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,

          standings: {
            ...season.standings,
            sourceVerified: false,
          },
        })
      )
    )
  );

  test(
    "Incorrect playoff team count",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,

          bracket: season.bracket
            ? {
                ...season.bracket,

                playoffTeamKeys:
                  season.bracket
                    .playoffTeamKeys.slice(0, 6),
              }
            : undefined,
        })
      )
    )
  );

  test(
    "Invalid playoff bye",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,

          bracket: season.bracket
            ? {
                ...season.bracket,

                rounds:
                  season.bracket.rounds.map(
                    (round, index) =>
                      index === 0
                        ? {
                            ...round,

                            byeTeamKeys: [
                              season.teams[0].teamKey,
                            ],
                          }
                        : round
                  ),
              }
            : undefined,
        })
      )
    )
  );

  test(
    "Missing championship round",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,

          bracket: season.bracket
            ? {
                ...season.bracket,

                rounds:
                  season.bracket.rounds.slice(0, 2),
              }
            : undefined,
        })
      )
    )
  );

  test(
    "Incorrect official champion",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,

          finalResults:
            season.finalResults
              ? {
                  ...season.finalResults,

                  placements:
                    season.finalResults
                      .placements.map(
                        team => ({
                          ...team,

                          rank:
                            team.rank === 1
                              ? 2
                              : team.rank === 2
                                ? 1
                                : team.rank,
                        })
                      ),
                }
              : undefined,
        })
      )
    )
  );

  test(
    "Missing championship evidence",
    () => rejects(
      modifySeason(
        createInput(),
        season => ({
          ...season,
          bracket: undefined,
          finalResults: undefined,
        })
      )
    )
  );

  test(
    "No external requests or publication",
    () => {
      const result =
        runHistoricalPipeline(
          createInput()
        );

      return (
        result.verified &&
        result.yahooRequests === 0 &&
        result.aiRequests === 0 &&
        result.databaseWrites === 0 &&
        result.emailsSent === 0 &&
        result.readyForPublication === false
      );
    }
  );

  const passed = results.filter(
    result => result.passed
  ).length;

  return {
    ok: passed === results.length,

    mode:
      "fictional-historical-pipeline-tests",

    total: results.length,
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
