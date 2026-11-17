
import Link from "next/link";

const seasons = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020,
];

export default function SeasonsPage() {
  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • FANTASY FOOTBALL • EST. 2020
      </div>

      <h1>SEASON ARCHIVES</h1>

      <p className="muted">
        Seven seasons of champions, heartbreak,
        questionable trades, and legendary performances.
        Every season has its own permanent place in
        league history.
      </p>

      <section
        style={{
          background: "#14251f",
          color: "white",
          borderRadius: 16,
          padding: 26,
          marginTop: 25,
        }}
      >
        <div
          style={{
            color: "#48d6a8",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          THE BOYS • HISTORICAL ARCHIVE
        </div>

        <h2
          style={{
            fontSize: 44,
            marginTop: 12,
          }}
        >
          SEVEN SEASONS.
          <br />
          ONE LEGACY.
        </h2>

        <p
          style={{
            color: "#c5d4cd",
            lineHeight: 1.7,
            maxWidth: 680,
          }}
        >
          From the inaugural 2020 season to the
          present day, explore final standings,
          playoff battles, championship games,
          awards, and the performances that
          defined each year.
        </p>

        <span
          className="pill"
          style={{
            background: "#263d32",
            color: "#48d6a8",
          }}
        >
          ESTABLISHED 2020
        </span>
      </section>

      <div style={{ marginTop: 35 }}>
        <div className="label">
          CHOOSE YOUR SEASON
        </div>

        <h2 style={{ marginTop: 8 }}>
          THE HISTORY BOOKS
        </h2>

        <p className="muted">
          Select a season to open its complete
          historical archive.
        </p>
      </div>

      <div className="grid">
        {seasons.map((year) => (
          <section
            className="card span4"
            key={year}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div className="row">
              <div className="label">
                LEAGUE HISTORY
              </div>

              {year === 2026 ? (
                <span
                  className="pill"
                  style={{
                    background: "#dff4ed",
                    color: "#167d5b",
                  }}
                >
                  CURRENT
                </span>
              ) : (
                <span
                  className="pill"
                  style={{
                    background: "#f5e8bd",
                    color: "#6d5310",
                  }}
                >
                  ARCHIVE
                </span>
              )}
            </div>

            <div
              style={{
                fontFamily:
                  "'Barlow Condensed', Impact, sans-serif",
                fontSize: 66,
                fontWeight: 900,
                color: "#14251f",
                lineHeight: 1,
              }}
            >
              {year}
            </div>

            <h3>
              {year === 2020
                ? "THE INAUGURAL SEASON"
                : `${year} SEASON`}
            </h3>

            <p
              className="muted"
              style={{ flexGrow: 1 }}
            >
              Standings, weekly results, playoff
              bracket, championship game,
              season awards, and historical records.
            </p>

            <div
              style={{
                borderTop: "1px solid #e2e9e4",
                paddingTop: 14,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#68736d",
                  fontWeight: 800,
                  marginBottom: 12,
                }}
              >
                HISTORICAL DATA IMPORT PENDING
              </div>

              <Link
                href={`/seasons/${year}`}
                className="button"
                style={{
                  display: "block",
                  textAlign: "center",
                }}
              >
                VIEW {year} ARCHIVE
              </Link>
            </div>
          </section>
        ))}
      </div>

      <section
        className="card"
        style={{ marginTop: 22 }}
      >
        <div className="label">
          THE OFFICIAL RECORD
        </div>

        <h2 style={{ marginTop: 8 }}>
          BUILT FOR THE LONG HAUL
        </h2>

        <p className="muted">
          Each season will preserve its original
          team names, manager identities, final
          standings, postseason results, and
          championship history.
        </p>

        <p className="muted">
          Former managers will remain in the
          seasons they participated in, even
          though they are excluded from current
          manager rankings.
        </p>

        <p
          style={{
            color: "#159c73",
            fontWeight: 800,
          }}
        >
          Historical results will populate
          after Yahoo API access is approved
          and the league data is imported.
        </p>
      </section>

      <div style={{ marginTop: 28 }}>
        <Link href="/" className="button">
          🏠 Home / League HQ
        </Link>
      </div>
    </main>
  );
}
