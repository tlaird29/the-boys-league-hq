
import { NextResponse } from "next/server";
import { commissioner } from "../../../../lib/server-auth";
import { analyzeWeek } from "../../../../lib/matchup-analysis";
import { testWeekData } from "../../../../lib/test-week-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await commissioner();

  if (!user) {
    return NextResponse.json(
      { error: "Commissioner login required." },
      { status: 403 }
    );
  }

  try {
    const analysis = analyzeWeek(testWeekData);

    return NextResponse.json(
      {
        success: true,
        warning: "FICTIONAL TEST DATA ONLY",
        message:
          "Player-impact analysis engine is running.",
        analysis,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Analysis test failed:", error);

    return NextResponse.json(
      { error: "Analysis engine test failed." },
      { status: 500 }
    );
  }
}
