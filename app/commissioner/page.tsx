
import Link from "next/link";
import SignOutButton from "../sign-out-button";
import { commissioner } from "../../lib/server-auth";

const tools = [
  {
    title: "Yahoo Fantasy Connection",
    description: "Connect the league to Yahoo Fantasy."
  },
  {
    title: "League Data Import",
    description: "Import historical seasons and weekly results."
  },
  {
    title: "Newsletter Management",
    description: "Prepare and publish weekly league recaps."
  },
  {
    title: "League Settings",
    description: "Manage teams, seasons, and award categories."
  }
];

export default async function CommissionerPage() {
  const user = await commissioner();

  if (!user) {
    return (
      <main className="shell">
        <div className="kicker">THE BOYS • COMMISSIONER</div>
        <h1>COMMISSIONER SIGN IN REQUIRED</h1>
        <p className="muted">
          This area is restricted to the league commissioner.
        </p>
        <p className="muted">
          Secure sign-in setup is coming next.
        </p>
        <Link href="/" className="button">
          Back to Dashboard
        </Link>
      </main>
    );
  }

  return (
    <main className="shell">
      <div className="kicker">THE BOYS • COMMISSIONER</div>
      <h1>COMMISSIONER HQ</h1>
      <p className="muted">
        The control center for league history,
        Yahoo integration, and weekly newsletters.
      </p>

      <div style={{ marginTop: 24, display: "flex", gap: 12, flexWrap: "wrap" }}>
  <Link href="/" className="button">
    Back to Dashboard
  </Link>
  <SignOutButton />

<Link href="/api/yahoo/connect" className="button">
  Connect Yahoo Fantasy
</Link>

</div>

      <div style={{ marginTop: 24 }}>
        <Link href="/" className="button">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
