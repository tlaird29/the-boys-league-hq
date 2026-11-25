import Link from "next/link";

import {
  getSeasonRecaps,
} from "../season-recaps";

import AnnualAwardsCollection,
  {
    type AnnualAwardsEdition,
  } from "../components/annual-awards-collection";

export const dynamic = "force-dynamic";

// Historical award results remain disconnected
// until source verification and publication
// authorization are complete.
//
// Do not pass unauthorized Yahoo information
// to client-side components.

const authorizedEditions:
  readonly AnnualAwardsEdition[] = [];

export default function AwardsPage() {
  const recaps = getSeasonRecaps();

  const earliestSeason =
    recaps.at(-1)?.year ?? 2020;

  const latestSeason =
    recaps[0]?.year ?? earliestSeason;

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • EST. 2020 • ANNUAL SEASON FINALES
      </div>

      <h1>THE BOYS: YEAR IN REVIEW</h1>

      <p
        className="muted"
        style={{
          maxWidth: 800,
          lineHeight: 1.8,
          fontSize: 16,
        }}
      >
        Every season has its own story.
        Championship celebrations,
        legendary performances,
        questionable decisions and
        a permanent Hall of Shame.
        Welcome to the official annual
        awards collection.
      </p>

      <section
        style={{
          background: "#f4f0e4",
          color: "#211f19",
          padding: "clamp(20px, 4vw, 34px)",
          border: "1px solid #c6beac",
          borderRadius: 12,
          marginTop: 24,
        }}
      >
        <div
          style={{
            fontSize: 11,
            letterSpacing: 2,
            fontWeight: 900,
          }}
        >
          THE OFFICIAL SEASON FINALE COLLECTION
        </div>

        <h2
          style={{
            fontFamily: "Georgia, serif",
            fontSize: "clamp(30px, 5vw, 50px)",
            lineHeight: 1.1,
            margin: "14px 0",
          }}
        >
          EVERY SEASON.
          <br />
          EVERY STORY.
        </h2>

        <p
          style={{
            fontFamily: "Georgia, serif",
            lineHeight: 1.8,
            maxWidth: 850,
          }}
        >
          From the inaugural season to
          the latest chapter, every annual
          edition will celebrate its own
          champions, upsets, rivalries,
          unforgettable moments and
          spectacular failures.
        </p>

        <p
          style={{
            fontFamily: "Georgia, serif",
            lineHeight: 1.8,
            maxWidth: 850,
          }}
        >
          Each season finale is planned
          as an original, approximately
          two-minute sports-radio-style
          recap. The same finished video
          will appear here and in its
          individual season archive.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            marginTop: 20,
          }}
        >
          <span
            style={{
              background: "#14251f",
              color: "#ffffff",
              padding: "9px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {recaps.length} SEASON EDITIONS
          </span>

          <span
            style={{
              background: "#e7dfcb",
              color: "#211f19",
              padding: "9px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {earliestSeason}–{latestSeason}
          </span>

          <span
            style={{
              background: "#e7dfcb",
              color: "#211f19",
              padding: "9px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            13 AWARD CATEGORIES
          </span>
        </div>
      </section>

      <AnnualAwardsCollection
        recaps={recaps}
        editions={authorizedEditions}
      />

      <section
        className="card"
        style={{ marginTop: 32 }}
      >
        <div className="label">
          THE OFFICIAL SELECTION PROCESS
        </div>

        <h2>HOW AWARDS ARE DETERMINED</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 20,
            marginTop: 20,
          }}
        >
          <div
            style={{
              background: "#edf5f0",
              color: "#14251f",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <div
              style={{
                color: "#197655",
                fontSize: 32,
                fontWeight: 900,
              }}
            >
              5
            </div>

            <h3>AUTOMATIC AWARDS</h3>

            <p
              style={{
                fontSize: 13,
                lineHeight: 1.8,
              }}
            >
              Championship results,
              season scoring totals,
              weekly scoring records and
              official final placement
              are calculated from verified
              completed-season evidence.
            </p>
          </div>

          <div
            style={{
              background: "#edf5f0",
              color: "#14251f",
              borderRadius: 10,
              padding: 20,
            }}
          >
            <div
              style={{
                color: "#197655",
                fontSize: 32,
                fontWeight: 900,
              }}
            >
              8
            </div>

            <h3>REVIEWED AWARDS</h3>

            <p
              style={{
                fontSize: 13,
                lineHeight: 1.8,
              }}
            >
              Player impact, draft value,
              trades, management decisions
              and season storylines require
              supporting evidence and
              commissioner approval.
            </p>
          </div>
        </div>

        <div
          className="muted"
          style={{
            fontSize: 13,
            lineHeight: 1.8,
            marginTop: 22,
          }}
        >
          <p>
            Statistical awards count
            official regular-season and
            championship-playoff results.
            Consolation scoring is excluded.
          </p>

          <p>
            The Highest Scoring Team award
            includes all official season
            points, including championship
            playoff appearances.
          </p>

          <p>
            Tied statistical results may
            produce shared award recipients.
            Historical awards recognize
            eligible participants from
            their original season.
          </p>

          <p>
            No award recipient is published
            solely because a season appears
            in the archive. Completed-season
            verification and applicable
            publication authorization are
            required.
          </p>
        </div>
      </section>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 28,
        }}
      >
        <Link
          href="/seasons"
          className="button"
        >
          Browse Season Archives
        </Link>

        <Link
          href="/rafters"
          className="button"
        >
          Championship Rafters
        </Link>

        <Link
          href="/"
          className="button"
        >
          🏠 League HQ
        </Link>
      </div>
    </main>
  );
}