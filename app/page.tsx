
import Link from "next/link";

const nav = [
  ["Dashboard", "/"],
  ["Manager Profiles", "/managers"],
  ["Record Book", "/records"],
  ["Rafters", "/rafters"],
  ["Season Awards", "/awards"],
  ["Rivalries", "/rivalries"],
  ["Season Archives", "/seasons"],
  ["Commissioner", "/commissioner"],
];

export default function Home() {
  return (
    <>
      <header className="top">
        <div className="kicker">
          THE BOYS • FANTASY FOOTBALL • EST. 2020
        </div>

        <h1>
          THE BOYS
          <br />
          <span style={{ color: "var(--mint)" }}>
            LEAGUE HQ
          </span>
        </h1>

        <div className="sub">
          SEVEN SEASONS OF GLORY, DISASTER & RECEIPTS.
        </div>

        <nav className="nav">
          {nav.map(([name, url]) => (
            <Link
              key={url}
              href={url}
              className={url === "/" ? "active" : ""}
            >
              {name}
            </Link>
          ))}
        </nav>
      </header>

      <main className="shell">
        <div className="grid">
          {/* THE MISSION */}

          <section className="card span8">
            <div className="label">THE MISSION</div>

            <h2 style={{ marginTop: 8 }}>
              RECORDS ARE FOREVER.
            </h2>

            <p className="muted">
              A permanent home for every champion,
              rivalry, legendary performance, and
              historically embarrassing Sunday since 2020.
            </p>

            <Link href="/records" className="button">
              Explore the Record Book
            </Link>
          </section>

          {/* LEAGUE STATUS */}

          <section className="card span4">
            <div className="label">LEAGUE STATUS</div>

            <div className="stat mint">
              2020–2026
            </div>

            <p className="muted">
              Seven seasons of league history.
              Historical statistics are awaiting
              Yahoo Fantasy Sports API access.
            </p>

            <span
              className="pill"
              style={{
                background: "#dff4ed",
                color: "#167d5b",
              }}
            >
              YAHOO IMPORT PENDING
            </span>
          </section>

          {/* MANAGER PROFILES */}

          <section className="card span6">
            <div className="row">
              <h2>MANAGER PROFILES</h2>

              <span
                className="pill"
                style={{
                  background: "#dff4ed",
                  color: "#167d5b",
                }}
              >
                10 MANAGERS
              </span>
            </div>

            <p className="muted">
              Explore every active manager's career
              history, lifetime wins, playoff records,
              scoring totals, winning streaks,
              and championship legacy.
            </p>

            <Link href="/managers" className="button">
              Meet the Managers
            </Link>
          </section>

          {/* CHAMPIONSHIP RAFTERS */}

          <section className="card span6">
            <div className="row">
              <h2>CHAMPIONSHIP RAFTERS</h2>

              <span
                className="pill"
                style={{
                  background: "#f5e8bd",
                  color: "#6d5310",
                }}
              >
                HISTORY
              </span>
            </div>

            <p className="muted">
              Every season's champion gets a permanent
              banner hanging in The Boys League rafters.
            </p>

            <Link href="/rafters" className="button">
              Visit the Rafters
            </Link>
          </section>

          {/* MANAGER LEGACY */}

          <section className="card span6">
            <div className="label">
              THE HISTORY BOOKS
            </div>

            <h2 style={{ marginTop: 8 }}>
              MANAGER LEGACY
            </h2>

            <p className="muted">
              All-time career records, points scored,
              points against, playoff wins,
              winning streaks, and championship history.
            </p>

            <Link href="/records" className="button">
              Explore Manager Legacy
            </Link>
          </section>

          {/* WEDNESDAY REPORT */}

          <section className="card span6">
            <div className="label">
              THE WEEKLY RECEIPTS
            </div>

            <h2 style={{ marginTop: 8 }}>
              WEDNESDAY REPORT
            </h2>

            <p className="muted">
              Weekly matchup analysis, player-performance
              breakdowns, and fresh fantasy football
              trash talk.
            </p>

            <span
              className="pill"
              style={{
                background: "#dff4ed",
                color: "#167d5b",
              }}
            >
              AUTOMATION PLANNED
            </span>
          </section>

          {/* BUILD STATUS */}

          <section className="card span12">
            <h2>BUILD STATUS</h2>

            <div className="list">
              <div className="item">
                <span>Branding & Site Foundation</span>
                <b className="mint">LIVE</b>
              </div>

              <div className="item">
                <span>Record Book & Manager Legacy</span>
                <b className="mint">LIVE</b>
              </div>

              <div className="item">
                <span>Manager Profiles</span>
                <b className="mint">BUILT</b>
              </div>

              <div className="item">
                <span>Yahoo Account Connection</span>
                <b className="mint">CONNECTED</b>
              </div>

              <div className="item">
                <span>Yahoo Fantasy Sports API Access</span>
                <b>AWAITING APPROVAL</b>
              </div>

              <div className="item">
                <span>2020–2026 Historical Import</span>
                <b>AWAITING API ACCESS</b>
              </div>

              <div className="item">
                <span>Wednesday Newsletter Automation</span>
                <b>NOT ACTIVATED</b>
              </div>
            </div>
          </section>
        </div>

        <footer>
          THE BOYS • PRIVATE LEAGUE HISTORY • EST. 2020
        </footer>
      </main>
    </>
  );
}
