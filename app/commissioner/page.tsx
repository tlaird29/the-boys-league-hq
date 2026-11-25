import Link from "next/link";

import SignOutButton from "../sign-out-button";

import {
  commissioner,
} from "../../lib/server-auth";

export default async function CommissionerPage() {
  const user = await commissioner();

  if (!user) {
    return (
      <main className="shell">
        <div className="kicker">
          THE BOYS • COMMISSIONER
        </div>

        <h1>COMMISSIONER SIGN IN REQUIRED</h1>

        <Link
          href="/login"
          className="button"
        >
          Commissioner Sign In
        </Link>
      </main>
    );
  }

  const tools = [
    {
      label: "WEEKLY NEWSPAPER",
      title: "📰 Newsletter Editor",
      description:
        "Edit storylines, regenerate sections, restore revisions, and approve newsletters for publication.",
      href: "/commissioner/newsletters",
      button: "OPEN NEWSLETTER EDITOR",
    },
    {
      label: "AUTOMATIC SPORTS JOURNALISM",
      title: "✍️ Article Writer",
      description:
        "Generate complete sports-column newsletters using player impacts, matchup analysis, game timing, and original league trash talk.",
      href: "/commissioner/article-writer",
      button: "OPEN ARTICLE WRITER",
    },
    {
      label: "PLAYER IMPACT ENGINE",
      title: "🏈 Matchup Analysis Lab",
      description:
        "Review matchup scores, player MVPs, projection busts, bench opportunities, positional advantages, and awards using fictional test data.",
      href: "/commissioner/analysis-lab",
      button: "OPEN ANALYSIS LAB",
    },
    {
      label: "ORIGINAL PRODUCTIONS",
      title: "🎬 Documentary HQ",
      description:
        "Preview season storylines, documentary narration, dynamic storyboards, supporting evidence and commissioner review. Currently in fictional preview mode.",
      href: "/commissioner/documentaries",
      button: "OPEN DOCUMENTARY HQ",
    },
    {
      label: "EMAIL AUTOMATION",
      title: "✉️ Email Delivery Test",
      description:
        "Test the Resend connection and commissioner email delivery.",
      href: "/commissioner/test-email",
      button: "TEST EMAIL CONNECTION",
    },
    {
      label: "LEAGUE INTELLIGENCE",
      title: "📊 Season Analysis",
      description:
        "Review league scoring, historical statistics, and rivalries.",
      href: "/commissioner/season-analysis",
      button: "OPEN SEASON ANALYSIS",
    },
    {
      label: "CHAMPIONSHIP AUTOMATION",
      title: "🎙️ Season Finale Queue",
      description:
        "Review prepared championship analysis and finale drafts.",
      href: "/commissioner/season-finales",
      button: "VIEW FINALE QUEUE",
    },
    {
      label: "YAHOO FANTASY",
      title: "🔗 League Connection",
      description:
        "Authorize read-only access to your Yahoo fantasy league.",
      href: "/api/yahoo/connect",
      button: "CONNECT YAHOO FANTASY",
    },
  ];

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • COMMISSIONER
      </div>

      <h1>COMMISSIONER HQ</h1>

      <p className="muted">
        Manage league analysis, weekly newspapers,
        season documentaries, Yahoo integration,
        email automation, and championship coverage.
      </p>

      <div
        className="grid"
        style={{ marginTop: 24 }}
      >
        {tools.map(tool => (
          <section
            className="card span6"
            key={tool.href}
          >
            <div className="label">
              {tool.label}
            </div>

            <h2>{tool.title}</h2>

            <p className="muted">
              {tool.description}
            </p>

            <Link
              className="button"
              href={tool.href}
            >
              {tool.button}
            </Link>
          </section>
        ))}
      </div>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          className="button"
        >
          BACK TO DASHBOARD
        </Link>

        <SignOutButton />
      </div>
    </main>
  );
}