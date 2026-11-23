
import Link from "next/link";
import { commissioner } from "../../../lib/server-auth";
import { yahooAccessToken } from "../../../lib/yahoo";
import { nodes } from "../../../lib/season-analysis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type League = {
  key: string;
  name: string;
  season: string;
  gameCode: string;
  teams: string;
};

type Discovery = {
  leagues: League[];
  message: string;
  httpStatus: number | null;
};

async function discoverLeagues(
  userId: string
): Promise<Discovery> {
  const result: Discovery = {
    leagues: [],
    message: "",
    httpStatus: null,
  };

  let token: string;

  try {
    token = await yahooAccessToken(userId);
  } catch {
    result.message =
      "Yahoo is not connected or its access token " +
      "could not be refreshed.";
    return result;
  }

  try {
    const response = await fetch(
      "https://fantasysports.yahooapis.com/fantasy/v2/" +
        "users;use_login=1/games;game_codes=nfl/leagues" +
        "?format=json",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      }
    );

    result.httpStatus = response.status;

    if (!response.ok) {
      result.message =
        response.status === 403
          ? "Yahoo returned HTTP 403. Fantasy API access " +
            "is currently forbidden. Approval or " +
            "application permissions may be required."
          : `Yahoo returned HTTP ${response.status}. ` +
            "League discovery could not be completed.";

      return result;
    }

    const payload: unknown = await response.json();

    if (
      !payload ||
      typeof payload !== "object" ||
      !("fantasy_content" in payload)
    ) {
      result.message =
        "Yahoo returned an unexpected response format.";
      return result;
    }

    const found = new Map<string, League>();

    for (const item of nodes(payload)) {
      if (typeof item.league_key !== "string") {
        continue;
      }

      const key = item.league_key;

      if (!/^\d+\.l\.\d+$/.test(key)) {
        continue;
      }

      const name =
        typeof item.name === "string"
          ? item.name
          : "Unnamed League";

      const season =
        typeof item.season === "string" ||
        typeof item.season === "number"
          ? String(item.season)
          : "Unknown";

      const gameCode =
        typeof item.game_code === "string"
          ? item.game_code
          : "nfl";

      const teams =
        typeof item.num_teams === "string" ||
        typeof item.num_teams === "number"
          ? String(item.num_teams)
          : "Unknown";

      found.set(key, {
        key,
        name,
        season,
        gameCode,
        teams,
      });
    }

    result.leagues = [...found.values()].sort(
      (a, b) =>
        Number(b.season || 0) -
        Number(a.season || 0)
    );

    result.message =
      result.leagues.length > 0
        ? `Found ${result.leagues.length} NFL fantasy league entries.`
        : "Yahoo responded successfully, but no NFL " +
          "leagues were found in the returned data.";

    return result;
  } catch {
    result.message =
      "Yahoo league discovery failed. " +
      "Try again or review Vercel logs.";
    return result;
  }
}

export default async function YahooLeaguesPage() {
  const user = await commissioner();

  if (!user) {
    return (
      <main className="shell">
        <div className="kicker">
          THE BOYS • COMMISSIONER
        </div>

        <h1>SIGN IN REQUIRED</h1>

        <Link href="/login" className="button">
          COMMISSIONER SIGN IN
        </Link>
      </main>
    );
  }

  const discovery = await discoverLeagues(user.id);

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • YAHOO INTEGRATION
      </div>

      <h1>LEAGUE DISCOVERY</h1>

      <p className="muted">
        Find your Yahoo Fantasy Football leagues
        and their season-specific league keys.
      </p>

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <div className="label">
          YAHOO API RESPONSE
        </div>

        <h2>
          {discovery.httpStatus === 200
            ? "CONNECTED"
            : "AWAITING ACCESS"}
        </h2>

        <p>{discovery.message}</p>

        {discovery.httpStatus !== null && (
          <p className="muted">
            HTTP Status: {discovery.httpStatus}
          </p>
        )}
      </section>

      {discovery.leagues.length > 0 && (
        <div
          className="grid"
          style={{ marginTop: 20 }}
        >
          {discovery.leagues.map((league) => (
            <section
              key={league.key}
              className="card span6"
            >
              <div className="label">
                SEASON {league.season}
              </div>

              <h2>{league.name}</h2>

              <p>
                <strong>League key:</strong>{" "}
                {league.key}
              </p>

              <p>
                <strong>Teams:</strong>{" "}
                {league.teams}
              </p>

              <p className="muted">
                Game: {league.gameCode}
              </p>
            </section>
          ))}
        </div>
      )}

      <section
        className="card"
        style={{ marginTop: 20 }}
      >
        <h2>IMPORT SAFETY</h2>

        <p className="muted">
          This page only reads Yahoo's league
          discovery response. It does not save
          league selections, import matchups,
          update historical records, or
          publish newsletters.
        </p>

        <p className="muted">
          Once your league is identified, we'll
          validate its identity across seasons
          before allowing any official data
          to enter the analysis pipeline.
        </p>
      </section>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 24,
        }}
      >
        <Link
          href="/commissioner"
          className="button"
        >
          BACK TO COMMISSIONER HQ
        </Link>

        <Link
          href="/commissioner/yahoo-status"
          className="button"
        >
          CONNECTION CHECK
        </Link>
      </div>
    </main>
  );
}
