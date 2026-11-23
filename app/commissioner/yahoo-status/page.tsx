
import Link from "next/link";
import { commissioner } from "../../../lib/server-auth";
import {
  db,
  yahooAccessToken,
} from "../../../lib/yahoo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ConnectionStatus = {
  connected: boolean;
  tokenValid: boolean;
  yahooResponding: boolean;
  expiresAt: string | null;
  message: string;
};

async function checkYahooConnection(
  userId: string
): Promise<ConnectionStatus> {
  const status: ConnectionStatus = {
    connected: false,
    tokenValid: false,
    yahooResponding: false,
    expiresAt: null,
    message: "Yahoo has not been connected yet.",
  };

  try {
    const { data, error } = await db()
      .from("yahoo_connections")
      .select("expires_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      status.message =
        "Could not check the Yahoo connection database.";
      return status;
    }

    if (!data) {
      return status;
    }

    status.connected = true;
    status.expiresAt = data.expires_at;

    let token: string;

    try {
      token = await yahooAccessToken(userId);
      status.tokenValid = true;
    } catch {
      status.message =
        "Yahoo is connected, but the access token " +
        "could not be retrieved or refreshed. " +
        "Reauthorization may be required.";
      return status;
    }

    try {
      const response = await fetch(
        "https://fantasysports.yahooapis.com/fantasy/v2/users;use_login=1?format=json",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
        }
      );

      if (!response.ok) {
        status.message =
          `Yahoo Fantasy API returned HTTP ${response.status}. ` +
          "The connection exists, but Fantasy API " +
          "access is not yet confirmed.";
        return status;
      }

      const payload = await response.json();

      if (
        !payload ||
        typeof payload !== "object" ||
        !("fantasy_content" in payload)
      ) {
        status.message =
          "Yahoo responded, but its Fantasy API " +
          "response was not in the expected format.";
        return status;
      }

      status.yahooResponding = true;
      status.message =
        "Yahoo Fantasy API authentication succeeded. " +
        "League discovery and matchup syncing " +
        "still need to be tested.";

      return status;
    } catch {
      status.message =
        "Could not reach the Yahoo Fantasy API. " +
        "Try again later.";
      return status;
    }
  } catch {
    status.message =
      "The connection check could not be completed. " +
      "Review the Vercel function logs.";
    return status;
  }
}

function StatusRow({
  label,
  ready,
}: {
  label: string;
  ready: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        padding: "14px 0",
        borderBottom:
          "1px solid rgba(128,128,128,0.25)",
      }}
    >
      <strong>{label}</strong>
      <span>{ready ? "✅ PASS" : "○ NOT READY"}</span>
    </div>
  );
}

export default async function YahooStatusPage() {
  const user = await commissioner();

  if (!user) {
    return (
      <main className="shell">
        <div className="kicker">
          THE BOYS • COMMISSIONER
        </div>

        <h1>COMMISSIONER LOGIN REQUIRED</h1>

        <Link href="/login" className="button">
          SIGN IN
        </Link>
      </main>
    );
  }

  const status = await checkYahooConnection(user.id);

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • YAHOO INTEGRATION
      </div>

      <h1>YAHOO CONNECTION CHECK</h1>

      <p className="muted">
        Private diagnostic tools for the
        commissioner's Yahoo Fantasy connection.
      </p>

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <h2>CONNECTION STATUS</h2>

        <StatusRow
          label="Yahoo account connected"
          ready={status.connected}
        />

        <StatusRow
          label="Yahoo access token available"
          ready={status.tokenValid}
        />

        <StatusRow
          label="Fantasy API responding"
          ready={status.yahooResponding}
        />

        <div style={{ marginTop: 24 }}>
          <div className="label">
            DIAGNOSTIC RESULT
          </div>

          <p>{status.message}</p>
        </div>

        {status.expiresAt && (
          <p className="muted">
            Last stored token expiry:
            {" "}
            {new Date(
              status.expiresAt
            ).toLocaleString()}
          </p>
        )}
      </section>

      <section
        className="card"
        style={{ marginTop: 20 }}
      >
        <h2>WHAT THIS CHECK DOES</h2>

        <p className="muted">
          Checks whether your commissioner
          account has a saved Yahoo connection,
          whether an access token can be
          retrieved or refreshed, and whether
          Yahoo's Fantasy API accepts it.
        </p>

        <p className="muted">
          This does not import league data,
          generate articles, modify records,
          or publish newsletters.
        </p>

        <p className="muted">
          After authentication succeeds,
          the next step is identifying your
          fantasy league and validating its
          matchups, rosters, and scoring.
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
          className="button"
          href="/commissioner"
        >
          BACK TO COMMISSIONER HQ
        </Link>

        <Link
          className="button"
          href="/api/yahoo/connect"
        >
          CONNECT YAHOO
        </Link>
      </div>
    </main>
  );
}
