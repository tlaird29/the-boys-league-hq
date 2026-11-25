
import Link from "next/link";

import {
  getSeasonRecaps,
  FIRST_SEASON,
} from "../season-recaps";

export const dynamic = "force-dynamic";

export default function SeasonsPage() {
  const recaps = getSeasonRecaps();

  const latest = recaps[0];

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • FANTASY FOOTBALL • EST. 2020
      </div>

      <h1>SEASON ARCHIVES</h1>

      <p
        className="muted"
        style={{
          maxWidth: 740,
          lineHeight: 1.7,
        }}
      >
        Every season. Every championship.
        Every questionable decision.
        Explore the history of The Boys
        Fantasy Football League.
      </p>

      <section
        style={{
          background: "#14251f",
          color: "#ffffff",
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
            fontSize:
              "clamp(36px, 6vw, 62px)",
            margin: "16px 0",
            lineHeight: 1.05,
          }}
        >
          {recaps.length} SEASONS.
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
          From the inaugural {FIRST_SEASON}
          {" "}season through {latest.year},
          every year has its own chapter
          in league history.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 22,
          }}
        >
          <Link
            href={`/seasons/${latest.year}`}
            className="button"
          >
            Explore {latest.year}
          </Link>

          <Link
            href="/awards"
            className="button"
          >
            Annual Season Finales
          </Link>
        </div>
      </section>

      <div style={{ marginTop: 35 }}>
        <div className="label">
          CHOOSE YOUR SEASON
        </div>

        <h2 style={{ marginTop: 8 }}>
          THE HISTORY BOOKS
        </h2>
      </div>

      <div className="grid">
        {recaps.map((recap, index) => (
          <section
            key={recap.year}
            className="card span4"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 14,
              border:
                index === 0
                  ? "2px solid #197655"
                  : "1px solid #dce7df",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <div className="label">
                {index === 0
                  ? "LATEST SEASON"
                  : "LEAGUE HISTORY"}
              </div>

              <span className="pill">
                {recap.videoUrl
                  ? "VIDEO AVAILABLE"
                  : "RECAP PENDING"}
              </span>
            </div>

            <div
              style={{
                fontFamily:
                  "'Barlow Condensed', Impact, sans-serif",
                fontSize: 76,
                fontWeight: 900,
                color: "#14251f",
                lineHeight: 1,
              }}
            >
              {recap.year}
            </div>

            <h3 style={{ margin: 0 }}>
              {recap.title}
            </h3>

            <p
              className="muted"
              style={{
                lineHeight: 1.6,
              }}
            >
              {recap.tagline}
            </p>

            <div
              style={{
                background: "#edf5f0",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <div
                style={{
                  color: "#52665a",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                }}
              >
                🏆 LEAGUE CHAMPION
              </div>

              <div
                style={{
                  fontWeight: 800,
                  fontSize: 14,
                  marginTop: 8,
                }}
              >
                {recap.champion ??
                  "Awaiting verified results"}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(0, 1fr))",
                gap: 10,
                fontSize: 12,
                color: "#52665a",
                flexGrow: 1,
                padding: "6px 0",
              }}
            >
              {[
                "Season Overview",
                "Final Standings",
                "Playoff Bracket",
                "Season Awards",
                "Hall of Shame",
                "Weekly Newsletters",
              ].map(label => (
                <span key={label}>
                  • {label}
                </span>
              ))}
            </div>

            <Link
              href={`/seasons/${recap.year}`}
              className="button"
              style={{
                display: "block",
                textAlign: "center",
              }}
            >
              VIEW {recap.year} ARCHIVE →
            </Link>
          </section>
        ))}
      </div>

      <section
        className="card"
        style={{ marginTop: 26 }}
      >
        <div className="label">
          THE OFFICIAL RECORD
        </div>

        <h2>BUILT FOR THE LONG HAUL</h2>

        <p
          className="muted"
          style={{ lineHeight: 1.7 }}
        >
          A new season archive becomes
          available each September.
          Historical team names, participating
          managers, standings and championship
          results will be included when
          verified and authorized for
          retention and publication.
        </p>

        <p
          className="muted"
          style={{ lineHeight: 1.7 }}
        >
          Consolation games are excluded
          from official league statistics.
          Unverified results are never
          presented as historical facts.
        </p>
      </section>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 28,
        }}
      >
        <Link href="/" className="button">
          🏠 Home / League HQ
        </Link>

        <Link
          href="/records"
          className="button"
        >
          Record Book
        </Link>

        <Link
          href="/rafters"
          className="button"
        >
          Championship Rafters
        </Link>
      </div>
    </main>
  );
}
