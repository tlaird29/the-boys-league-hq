
import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  getBoiseDate,
  claimWeeklyRun,
  finishWeeklyRun,
} from "../../../../lib/weekly-run-lock";

import {
  ACTIVE_MANAGERS,
  selectLeague,
  validateManagerCoverage,
} from "../../../../lib/league-managers";

import {
  getFantasySeason,
  extractLeagueCandidates,
  extractManagerIds,
  getCandidateWeek,
} from "../../../../lib/yahoo-week-discovery";

import {
  runHistoricalTests,
} from "../../../../lib/historical-tests";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function result(
  data: Record<string, unknown>,
  status = 200
) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(message);
  }
}

function runFictionalTest() {
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
              name: `Test Team ${index + 1}`,
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

  const candidates =
    extractLeagueCandidates(
      fictionalLeague,
      season
    );

  assert(
    candidates.length === 1,
    "League discovery test failed."
  );

  const managerIds = extractManagerIds(
    fictionalTeams,
    leagueKey
  );

  const coverage =
    validateManagerCoverage(managerIds);

  assert(
    coverage.valid,
    "Manager identification test failed."
  );

  const league = selectLeague(
    [
      {
        ...candidates[0],
        managerIds,
      },
    ],
    season
  );

  const week = getCandidateWeek(league);

  assert(
    week === 12,
    "Completed-week selection test failed."
  );

  assert(
    getFantasySeason(
      new Date("2027-01-06T16:00:00Z")
    ) === 2026,
    "January rollover test failed."
  );

  assert(
    getFantasySeason(
      new Date("2027-06-09T16:00:00Z")
    ) === null,
    "Offseason test failed."
  );

  assert(
    getCandidateWeek({
      ...league,
      currentWeek: 1,
    }) === null,
    "Opening-week test failed."
  );

  assert(
    getCandidateWeek({
      ...league,
      finished: true,
    }) === 17,
    "Final-week test failed."
  );

  assert(
    !validateManagerCoverage(
      managerIds.slice(0, 9)
    ).valid,
    "Missing-manager test failed."
  );

  assert(
    !validateManagerCoverage([
      ...managerIds,
      managerIds[0],
    ]).valid,
    "Duplicate-manager test failed."
  );

  return {
    leagueDiscovery: "passed",
    managerIdentification: "passed",
    completedWeekSelection: "passed",
    januaryRollover: "passed",
    offseasonHandling: "passed",
    openingWeekHandling: "passed",
    finalWeekHandling: "passed",
    missingManagerProtection: "passed",
    duplicateManagerProtection: "passed",
  };
}

export async function GET(
  req: NextRequest
) {
  const secret = process.env.CRON_SECRET;

  if (
    !secret ||
    req.headers.get("authorization") !==
      `Bearer ${secret}`
  ) {
    return result(
      { error: "Unauthorized" },
      401
    );
  }

  const now = new Date();

  const weekday = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "America/Boise",
      weekday: "long",
    }
  ).format(now);

  if (weekday !== "Wednesday") {
    return result({
      ok: true,
      executed: false,
      reason: "Wednesday-only schedule.",
    });
  }

  const runDate = getBoiseDate(now);

  let claimed = false;

  try {
    claimed = await claimWeeklyRun(
      runDate,
      "dry-run"
    );

    if (!claimed) {
      return result({
        ok: true,
        executed: false,
        reason: "Weekly dry run already claimed.",
        runDate,
      });
    }

    // Test weekly league discovery
    // and scheduling infrastructure.

    const infrastructureTests =
      runFictionalTest();

    // Test all historical record engines.

    const historicalTests =
      runHistoricalTests();

    const infrastructureCount =
      Object.keys(
        infrastructureTests
      ).length;

    const totalTests =
      infrastructureCount +
      historicalTests.total;

    const passedTests =
      infrastructureCount +
      historicalTests.passed;

    const failedTests =
      historicalTests.failed;

    const report = {
      ok: historicalTests.ok,
      executed: true,
      mode: "fictional-dry-run",
      runDate,

      summary: {
        totalTests,
        passedTests,
        failedTests,

        passPercentage:
          totalTests > 0
            ? Math.round(
                passedTests /
                totalTests * 10000
              ) / 100
            : 0,
      },

      infrastructureTests,

      historicalTests,

      yahooRequests: 0,
      aiRequests: 0,
      emailsSent: 0,

      liveProcessing: false,
      recordsPublished: false,
    };

    if (!historicalTests.ok) {
      await finishWeeklyRun(
        runDate,
        "failed",
        "dry-run"
      );

      console.error(
        "Historical accuracy tests failed.",
        report
      );

      return result(report, 500);
    }

    await finishWeeklyRun(
      runDate,
      "completed",
      "dry-run"
    );

    console.info(
      "Weekly automation and historical tests passed.",
      report
    );

    return result(report);

  } catch (error) {
    if (claimed) {
      try {
        await finishWeeklyRun(
          runDate,
          "failed",
          "dry-run"
        );
      } catch {
        console.error(
          "Could not finalize weekly run."
        );
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unknown infrastructure error.";

    console.error(
      "Weekly automation dry run failed.",
      message
    );

    return result(
      {
        ok: false,
        mode: "fictional-dry-run",
        runDate,
        error: message,

        yahooRequests: 0,
        aiRequests: 0,
        emailsSent: 0,

        liveProcessing: false,
        recordsPublished: false,
      },
      500
    );
  }
}
