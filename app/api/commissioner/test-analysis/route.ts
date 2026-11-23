
import { NextResponse } from "next/server";
import { commissioner } from "../../../../lib/server-auth";
import { analyzeWeek } from "../../../../lib/matchup-analysis";
import { analyzeClutchImpact } from "../../../../lib/clutch-impact";
import { testWeekData } from "../../../../lib/test-week-data";
import { testGameTimings } from "../../../../lib/test-game-timings";

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

    const clutch = analyzeClutchImpact(
      testWeekData,
      analysis,
      testGameTimings
    );

    return NextResponse.json(
      {
        success: true,
        warning: "FICTIONAL TEST DATA ONLY",
        message:
          "Matchup and clutch-impact engines are running.",
        analysis,
        clutch,
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
