import Link from "next/link";
import SignOutButton from "../sign-out-button";
import { commissioner } from "../../lib/server-auth";

export default async function CommissionerPage() {
  const user = await commissioner();

  if (!user) {
    return (
      <main className="shell">
        <div className="kicker">THE BOYS • COMMISSIONER</div>
        <h1>COMMISSIONER SIGN IN REQUIRED</h1>
        <p className="muted">This area is restricted to the league commissioner.</p>
        <Link href="/login" className="button">Commissioner Sign In</Link>
        <div style={{ marginTop: 16 }}>
          <Link href="/" className="button">Back to Dashboard</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="kicker">THE BOYS • COMMISSIONER</div>
      <h1>COMMISSIONER HQ</h1>
      <p className="muted">
        The control center for league history, Yahoo integration,
        season analysis, and weekly newsletters.
      </p>

      <div className="grid" style={{ marginTop: 24 }}>
        <section className="card span6">
          <div className="label">LEAGUE INTELLIGENCE</div>
          <h2 style={{ marginTop: 12 }}>🏈 Season Analysis</h2>
          <p className="muted">
            Analyze verified Yahoo matchup data, scoring records, weekly GOATs
            and BUMs, and the season's biggest performances.
          </p>
          <Link href="/commissioner/season-analysis" className="button">
            Open Season Analysis
          </Link>
        </section>
        <section className="card span6">
          <div className="label">YAHOO FANTASY</div>
          <h2 style={{ marginTop: 12 }}>🔗 League Connection</h2>
          <p className="muted">
            Connect your Yahoo account to authorize read-only access to
            available league information. Yahoo API approval may still be required.
          </p>
          <Link href="/api/yahoo/connect" className="button">
            Connect Yahoo Fantasy
          </Link>
        </section>
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href="/" className="button">Back to Dashboard</Link>
        <SignOutButton />
      </div>
    </main>
  );
}
