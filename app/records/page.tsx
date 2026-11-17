
import Link from "next/link";

export default function RecordsPage() {
  return (
    <main className="shell">
      <div className="kicker">THE BOYS • EST. 2020</div>
      <h1>THE RECORD BOOK</h1>
      <p className="muted">
        Every legendary performance, historic season,
        and embarrassing defeat deserves a permanent
        place in league history.
      </p>

      <section className="card">
        <div className="label">LEAGUE HISTORY</div>
        <h2>Records Coming Soon</h2>
        <p className="muted">
          All-time wins, highest scores, biggest
          blowouts, championship records, and more
          will appear here once league history
          is imported.
        </p>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link href="/" className="button">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
