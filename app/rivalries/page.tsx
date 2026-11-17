
import Link from "next/link";

const features = [
  {
    title: "Head-to-Head Records",
    description: "Every matchup. Every win. Every receipt."
  },
  {
    title: "Longest Winning Streaks",
    description: "Who owns the longest streak against a rival?"
  },
  {
    title: "Biggest Blowouts",
    description: "The most embarrassing defeats in league history."
  },
  {
    title: "Closest Matchups",
    description: "Games decided by the smallest margins."
  }
];

export default function RivalriesPage() {
  return (
    <main className="shell">
      <div className="kicker">THE BOYS • EST. 2020</div>
      <h1>LEAGUE RIVALRIES</h1>
      <p className="muted">
        Friendships are temporary. Fantasy football
        receipts are forever.
      </p>

      <div className="grid">
        {features.map((feature) => (
          <section className="card span6" key={feature.title}>
            <div className="label">RIVALRY TRACKER</div>
            <h2>{feature.title}</h2>
            <p className="muted">{feature.description}</p>
            <span className="pill">DATA COMING SOON</span>
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
  