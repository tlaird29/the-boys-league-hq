
import Link from "next/link";

const seasons = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020
];

export default function SeasonsPage() {
  return (
    <main className="shell">
      <div className="kicker">THE BOYS • EST. 2020</div>
      <h1>SEASON ARCHIVES</h1>
      <p className="muted">
        Seven seasons of champions, heartbreak,
        terrible trades, and legendary performances.
      </p>

      <div className="grid">
        {seasons.map((year) => (
          <section className="card span4" key={year}>
            <div className="label">LEAGUE HISTORY</div>
            <h2>{year} Season</h2>
            <p className="muted">
              Final standings, playoff results,
              champions, and weekly scores.
            </p>
            <span className="pill">IMPORT PENDING</span>
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
  