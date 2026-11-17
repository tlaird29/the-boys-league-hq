
import Link from "next/link";

const seasons = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

export default function RaftersPage() {
  return (
    <main className="shell">
      <div className="kicker">THE BOYS • EST. 2020</div>
      <h1>CHAMPIONSHIP RAFTERS</h1>

      <p className="muted">
        Legends are made on Sundays. Championships
        live forever. Welcome to the rafters.
      </p>

      <div className="grid">
        {seasons.map((year) => (
          <section className="card span4" key={year}>
            <div className="label">{year} SEASON</div>
            <h2 style={{ marginTop: 12 }}>🏆 {year}</h2>
            <p className="muted">
              Champion awaiting historical import.
            </p>
            <span className="pill">BANNER PENDING</span>
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
