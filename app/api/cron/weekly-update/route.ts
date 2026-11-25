
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
  runLeagueTests,
} from "../../../../lib/league-test-runner";

export const runtime = "nodejs";

export const dynamic =
  "force-dynamic";

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

export async function GET(
  req: NextRequest
) {
  const secret =
    process.env.CRON_SECRET;

  if (
    !secret ||
    req.headers.get("authorization") !==
      `Bearer ${secret}`
  ) {
    return result(
      {
        error: "Unauthorized",
      },
      401
    );
  }

  const now = new Date();

  const weekday =
    new Intl.DateTimeFormat(
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

      reason:
        "Wednesday-only schedule.",
    });
  }

  const runDate =
    getBoiseDate(now);

  let claimed = false;
  let finalized = false;

  try {
    claimed =
      await claimWeeklyRun(
        runDate,
        "dry-run"
      );

    if (!claimed) {
      return result({
        ok: true,
        executed: false,

        reason:
          "Weekly dry run already claimed.",

        runDate,
      });
    }

    // All tests use fictional data.
    // No Yahoo or AI requests.

    const tests =
      runLeagueTests();

    const report = {
      ...tests,

      executed: true,

      mode:
        "fictional-dry-run",

      runDate,

      liveProcessing: false,
      recordsPublished: false,

      newsletterGenerated: false,
      newsletterPublished: false,

      yahooRequests: 0,
      aiRequests: 0,
      emailsSent: 0,
    };

    await finishWeeklyRun(
      runDate,

      tests.ok
        ? "completed"
        : "failed",

      "dry-run"
    );

    finalized = true;

    if (!tests.ok) {
      console.error(
        "Weekly league tests failed.",
        report
      );

      return result(
        report,
        500
      );
    }

    console.info(
      "Weekly league tests passed.",
      report
    );

    return result(report);

  } catch (error) {
    if (
      claimed &&
      !finalized
    ) {
      try {
        await finishWeeklyRun(
          runDate,
          "failed",
          "dry-run"
        );

      } catch {
        console.error(
          "Could not finalize weekly dry run."
        );
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Unexpected weekly automation error.";

    console.error(
      "Weekly dry run failed.",
      message
    );

    return result(
      {
        ok: false,

        mode:
          "fictional-dry-run",

        runDate,

        error: message,

        yahooRequests: 0,
        aiRequests: 0,
        emailsSent: 0,

        liveProcessing: false,
        recordsPublished: false,

        newsletterGenerated: false,
        newsletterPublished: false,
      },
      500
    );
  }
}
