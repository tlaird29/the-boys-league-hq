
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
        Manage league analysis, weekly newspapers,
        Yahoo integration, email automation,
        and championship coverage.
      </p>

      <div className="grid" style={{ marginTop: 24 }}>
        <section className="card span6">
          <div className="label">
            WEEKLY NEWSPAPER
          </div>

          <h2>📰 Newsletter Editor</h2>

          <p className="muted">
            Edit storylines, regenerate sections,
            restore revisions, and approve
            newsletters for publication.
          </p>

          <Link
            className="button"
            href="/commissioner/newsletters"
          >
            OPEN NEWSLETTER EDITOR
          </Link>
        </section>

        <section className="card span6">
          <div className="label">
            AUTOMATIC SPORTS JOURNALISM
          </div>

          <h2>✍️ Article Writer</h2>

          <p className="muted">
            Generate complete sports-column
            newsletters using player impacts,
            matchup analysis, game timing,
            and original league trash talk.
          </p>

          <Link
            className="button"
            href="/commissioner/article-writer"
          >
            OPEN ARTICLE WRITER
          </Link>
        </section>

        <section className="card span6">
          <div className="label">
            PLAYER IMPACT ENGINE
          </div>

          <h2>🏈 Matchup Analysis Lab</h2>

          <p className="muted">
            Review matchup scores, player MVPs,
            projection busts, bench opportunities,
            positional advantages, and awards
            using fictional test data.
          </p>

          <Link
            className="button"
            href="/commissioner/analysis-lab"
          >
            OPEN ANALYSIS LAB
          </Link>
        </section>

        <section className="card span6">
          <div className="label">
            EMAIL AUTOMATION
          </div>

          <h2>✉️ Email Delivery Test</h2>

          <p className="muted">
            Test the Resend connection and
            commissioner email delivery.
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

          <h2>📊 Season Analysis</h2>

          <p className="muted">
            Review league scoring,
            historical statistics, and rivalries.
          </p>

          <Link
            className="button"
            href="/commissioner/season-analysis"
          >
            OPEN SEASON ANALYSIS
          </Link>
        </section>

        <section className="card span6">
          <div className="label">
            CHAMPIONSHIP AUTOMATION
          </div>

          <h2>🎙️ Season Finale Queue</h2>

          <p className="muted">
            Review prepared championship
            analysis and finale drafts.
          </p>

          <Link
            className="button"
            href="/commissioner/season-finales"
          >
            VIEW FINALE QUEUE
          </Link>
        </section>

        <section className="card span6">
          <div className="label">
            YAHOO FANTASY
          </div>

          <h2>🔗 League Connection</h2>

          <p className="muted">
            Authorize read-only access to
            your Yahoo fantasy league.
          </p>

          <Link
            className="button"
            href="/api/yahoo/connect"
          >
            CONNECT YAHOO FANTASY
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
          BACK TO DASHBOARD
        </Link>

        <SignOutButton />
      </div>
    </main>
  );
}
