
import Link from "next/link";

const awards = [
  {
    icon: "🏆",
    title: "League MVP",
    description: "The most dominant fantasy performer of the season."
  },
  {
    icon: "🔥",
    title: "Highest Scoring Team",
    description: "The team that put up the most points in a season."
  },
  {
    icon: "💀",
    title: "Biggest Bust",
    description: "The most disappointing fantasy performance."
  },
  {
    icon: "👑",
    title: "Manager of the Year",
    description: "The manager who dominated the competition."
  },
  {
    icon: "🤡",
    title: "Last Place Finisher",
    description: "The manager who finished at the bottom."
  },
  {
    icon: "⚡",
    title: "Performance of the Year",
    description: "The most legendary single-week performance."
  }
];

export default function AwardsPage() {
  return (
    <main className="shell">
      <div className="kicker">THE BOYS • EST. 2020</div>
      <h1>SEASON AWARDS</h1>

      <p className="muted">
        Celebrating greatness, exposing frauds, and
        preserving the most unforgettable moments
        in league history.
      </p>

      <div className="grid">
        {awards.map((award) => (
          <section className="card span6" key={award.title}>
            <div className="label">THE BOYS AWARDS</div>
            <h2 style={{ marginTop: 12 }}>
              {award.icon} {award.title}
            </h2>
            <p className="muted">{award.description}</p>
            <span className="pill">WINNER PENDING</span>
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
