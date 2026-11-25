
import { NextRequest, NextResponse } from "next/server";

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

export async function GET(req: NextRequest) {
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

  const userId =
    process.env.COMMISSIONER_USER_ID;

  if (!userId) {
    return result(
      {
        error:
          "Commissioner configuration missing.",
      },
      503
    );
  }

  const permissions = {
    yahooRetrieval:
      process.env.YAHOO_WEEKLY_ACCESS ===
      "enabled",

    derivedRetention:
      process.env.YAHOO_DERIVED_RETENTION ===
      "enabled",

    aiProcessing:
      process.env.YAHOO_AI_PROCESSING ===
      "enabled",

    leagueSharing:
      process.env.YAHOO_LEAGUE_SHARING ===
      "enabled",

    newsletterDelivery:
      process.env.NEWSLETTER_VERIFIED_DELIVERY ===
      "enabled",
  };

  // No Yahoo requests, AI processing,
  // database writes or newsletter delivery
  // occur during this preparation stage.

  return result({
    ok: true,
    executed: false,
    mode: "preparation",
    schedule: "Wednesday only",
    checkedAt: now.toISOString(),
    permissions,
    yahooRequests: 0,
    aiRequests: 0,
    emailsSent: 0,
    message:
      "Weekly controller is installed. " +
      "Live processing remains disabled " +
      "until integration and permissions " +
      "have been verified.",
  });
}
