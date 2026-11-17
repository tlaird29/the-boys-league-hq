
import Link from "next/link";

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

export default function CommissionerPage() {
  return (
    <main className="shell">
      <div className="kicker">THE BOYS • COMMISSIONER</div>
      <h1>COMMISSIONER HQ</h1>
      <p className="muted">
        The control center for league history,
        Yahoo integration, and weekly newsletters.
      </p>

      <div className="grid">
        {tools.map((tool) => (
          <section className="card span6" key={tool.title}>
            <div className="label">ADMIN TOOL</div>
            <h2>{tool.title}</h2>
            <p className="muted">{tool.description}</p>
            <span className="pill">SETUP PENDING</span>
          </section>
        ))}
      </div>

      <div style={{ marginTop: 24 }}>
        <Link href="/" className="button">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
  