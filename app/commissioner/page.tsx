
import Link from "next/link";
import SignOutButton from "../sign-out-button";
import { commissioner } from "../../lib/server-auth";

export default async function CommissionerPage() {
  const user = await commissioner();

  if (!user) {
    return (
      <main className="shell">
        <div className="kicker">
          THE BOYS • COMMISSIONER
        </div>

        <h1>COMMISSIONER SIGN IN REQUIRED</h1>

        <Link href="/login" className="button">
          Commissioner Sign In
        </Link>
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • COMMISSIONER
      </div>

      <h1>COMMISSIONER HQ</h1>

      <p className="muted">
        League history, Yahoo integration,
        newsletter editing, email delivery,
        season analysis, and championship automation.
      </p>

      <div className="grid" style={{ marginTop: 24 }}>
        <section className="card span6">
          <div className="label">
            WEEKLY NEWSPAPER
          </div>

          <h2>📰 Newsletter Editor</h2>

          <p className="muted">
            Edit weekly storylines, regenerate
            matchup paragraphs, restore revisions,
            and approve newsletter drafts.
          </p>

          <Link
            className="button"
            href="/commissioner/newsletters"
          >
            Open Newsletter Editor
          </Link>
        </section>

        <section className="card span6">
          <div className="label">
            EMAIL AUTOMATION
          </div>

          <h2>✉️ Email Delivery Test</h2>

          <p className="muted">
            Send a test email directly to your
            commissioner inbox and verify
            the Resend connection.
          </p>

          <Link
            className="button"
            href="/commissioner/test-email"
          >
            TEST EMAIL CONNECTION
          </Link>
        </section>

        <section className="card span6">
          <div className="label">
            LEAGUE INTELLIGENCE
          </div>

          <h2>🏈 Season Analysis</h2>

          <p className="muted">
            Manually review Yahoo scoring,
            GOAT/BUM and rivalry statistics.
          </p>

          <Link
            className="button"
            href="/commissioner/season-analysis"
          >
            Open Season Analysis
          </Link>
        </section>

        <section className="card span6">
          <div className="label">
            CHAMPIONSHIP AUTOMATION
          </div>

          <h2>🎙️ Season Finale Queue</h2>

          <p className="muted">
            See automatically prepared data drafts
            after championship results are confirmed.
            Nothing publishes without approval.
          </p>

          <Link
            className="button"
            href="/commissioner/season-finales"
          >
            View Finale Queue
          </Link>
        </section>

        <section className="card span6">
          <div className="label">
            YAHOO FANTASY
          </div>

          <h2>🔗 League Connection</h2>

          <p className="muted">
            Authorize read-only access to your
            Yahoo fantasy league.
          </p>

          <Link
            className="button"
            href="/api/yahoo/connect"
          >
            Connect Yahoo Fantasy
          </Link>
        </section>
      </div>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Link href="/" className="button">
          Back to Dashboard
        </Link>

        <SignOutButton />
      </div>
    </main>
  );
}
