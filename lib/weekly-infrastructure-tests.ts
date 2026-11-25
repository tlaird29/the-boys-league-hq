
import {
  ACTIVE_MANAGERS,
  selectLeague,
  validateManagerCoverage,
} from "./league-managers";

import {
  getFantasySeason,
  extractLeagueCandidates,
  extractManagerIds,
  getCandidateWeek,
} from "./yahoo-week-discovery";

export function runWeeklyInfrastructureTests() {
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

  const season = 2026;
  const leagueKey = "999.l.12345";

  const fictionalLeague = {
    fantasy_content: {
      league: [
        {
          league_key: leagueKey,
          name: "Fictional Test League",
          season: "2026",
          current_week: "13",
          start_week: "1",
          end_week: "17",
          num_teams: "10",
          is_finished: "0",
        },
      ],
    },
  };

  const fictionalTeams = {
    fantasy_content: {
      teams: ACTIVE_MANAGERS.map(
        (manager, index) => ({
          team: [
            {
              team_key:
                `${leagueKey}.t.${index + 1}`,

              name:
                `Test Team ${index + 1}`,

              managers: [
                {
                  manager: {
                    nickname: manager.name,
                  },
                },
              ],
            },
          ],
        })
      ),
    },
  };

  function getManagers() {
    return extractManagerIds(
      fictionalTeams,
      leagueKey
    );
  }

  function getLeague() {
    const candidates =
      extractLeagueCandidates(
        fictionalLeague,
        season
      );

    return selectLeague(
      candidates.map(candidate => ({
        ...candidate,
        managerIds: getManagers(),
      })),
      season
    );
  }

  test(
    "League discovery",
    () => {
      const candidates =
        extractLeagueCandidates(
          fictionalLeague,
          season
        );

      return (
        candidates.length === 1 &&
        candidates[0].key === leagueKey
      );
    }
  );

  test(
    "Manager identification",
    () =>
      validateManagerCoverage(
        getManagers()
      ).valid
  );

  test(
    "Completed week selection",
    () =>
      getCandidateWeek(
        getLeague()
      ) === 12
  );

  test(
    "January season rollover",
    () =>
      getFantasySeason(
        new Date(
          "2027-01-06T16:00:00Z"
        )
      ) === 2026
  );

  test(
    "Offseason handling",
    () =>
      getFantasySeason(
        new Date(
          "2027-06-09T16:00:00Z"
        )
      ) === null
  );

  test(
    "Opening week protection",
    () =>
      getCandidateWeek({
        ...getLeague(),
        currentWeek: 1,
      }) === null
  );

  test(
    "Final week handling",
    () =>
      getCandidateWeek({
        ...getLeague(),
        finished: true,
      }) === 17
  );

  test(
    "Missing manager protection",
    () =>
      !validateManagerCoverage(
        getManagers().slice(0, 9)
      ).valid
  );

  test(
    "Duplicate manager protection",
    () => {
      const managers = getManagers();

      return !validateManagerCoverage([
        ...managers,
        managers[0],
      ]).valid;
    }
  );

  const passed = results.filter(
    result => result.passed
  ).length;

  return {
    ok: passed === results.length,

    mode:
      "fictional-infrastructure-tests",

    total: results.length,
    passed,

    failed:
      results.length - passed,

    results,
  };
}
