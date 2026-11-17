
import { NextResponse } from "next/server";
import { commissioner } from "../../../../lib/server-auth";
import { yahooAccessToken } from "../../../../lib/yahoo";

export async function GET() {
  const user = await commissioner();

  if (!user) {
    return NextResponse.json(
      { error: "Commissioner sign-in required" },
      { status: 403 }
    );
  }

  try {
    const accessToken = await yahooAccessToken(user.id);

    const yahooUrl =
      "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1/games;game_codes=nfl/leagues?format=json";

    const response = await fetch(yahooUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Yahoo league lookup failed",
          status: response.status,
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Could not retrieve Yahoo leagues" },
      { status: 500 }
    );
  }
}
