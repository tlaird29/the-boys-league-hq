
import Link from "next/link";
import { notFound } from "next/navigation";
import { activeManagers } from "../../../lib/managers";

type Props = {
  params: Promise<{ slug: string }>;
};

const careerStats = [
  "Lifetime Wins",
  "Lifetime Losses",
  "Lifetime Win %",
  "Seasons Played",
  "Regular-Season Record",
  "Playoff Record",
  "Playoff Wins",
  "Championships",
  "Championship Appearances",
  "Playoff Appearances",
  "Lifetime Points For",
  "Lifetime Points Against",
  "Point Differential",
  "Average Points Per Game",
  "Longest Winning Streak",
  "Longest Losing Streak",
];

const years = [
  2026, 2025, 2024, 2023, 2022, 2021, 2020
];

export function generateStaticParams() {
  return activeManagers.map((manager) => ({
    slug: manager.slug,
  }));
}

export default async function ManagerProfile({ params }: Props) {
  const { slug } = await params;

  const manager = activeManagers.find(
    (person) => person.slug === slug
  );

  if (!manager) {
    notFound();
  }

  const initials = manager.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <main className="shell">
      <Link
        href="/managers"
        style={{
          color: "#159c73",
          fontWeight: 800,
          fontSize: 13,
        }}
      >
        ← ALL MANAGERS
      </Link>

      <section
        style={{
          background: "#14251f",
          color: "#ffffff",
          borderRadius: 18,
          padding: 26,
          marginTop: 22,
          marginBottom: 24,
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
          THE BOYS LEAGUE • MANAGER LEGACY
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 20,
            marginTop: 22,
          }}
        >
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: 18,
              background: "#263d32",
              color: "#48d6a8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 900,
              fontSize: 34,
            }}
          >
            {initials}
          </div>

          <div>
            <h1
              style={{
                fontSize: "clamp(38px, 7vw, 65px)",
                margin: 0,
              }}
            >
              {manager.name}
            </h1>

            <p style={{ color: "#c5d4cd" }}>
              Active Manager • Career History
            </p>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid #476055",
            marginTop: 24,
            paddingTop: 20,
            color: "#c5d4cd",
            fontSize: 13,
          }}
        >
          Lifetime statistics include regular-season and
          playoff results. Historical data import pending.
        </div>
      </section>

      <section>
        <div className="label">THE CAREER NUMBERS</div>
        <h2 style={{ marginTop: 8 }}>
          LIFETIME STATISTICS
        </h2>

        <div className="grid">
          {careerStats.map((stat) => (
            <div
              className="card span4"
              key={stat}
            >
              <div className="label">{stat}</div>

              <div
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  marginTop: 12,
                  color: "#14251f",
                }}
              >
                —
              </div>

              <div
                style={{
                  color: "#68736d",
                  fontSize: 11,
                  marginTop: 6,
                }}
              >
                Awaiting import
              </div>
            </div>
          ))}
        </div>
      </section>

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <div className="label">THE TROPHY CASE</div>

        <h2 style={{ marginTop: 8 }}>
          CHAMPIONSHIP LEGACY
        </h2>

        <p className="muted">
          Championship seasons, runner-up finishes,
          playoff appearances, and postseason results
          will appear here once verified.
        </p>

        <div
          style={{
            background: "#f4f8f5",
            borderRadius: 12,
            padding: 24,
            textAlign: "center",
            color: "#68736d",
          }}
        >
          🏆 Championship history awaiting import
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <div className="label">YEAR BY YEAR</div>

        <h2 style={{ marginTop: 8 }}>
          SEASON HISTORY
        </h2>

        <p className="muted">
          Historical fantasy team names, records,
          points scored, final standings, and playoff
          finishes will be connected automatically
          where Yahoo data is available.
        </p>

        <div className="grid">
          {years.map((year) => (
            <div
              className="card span6"
              key={year}
            >
              <div className="label">
                HISTORICAL SEASON
              </div>

              <h3 style={{ marginTop: 8 }}>
                {year}
              </h3>

              <p className="muted">
                Participation and team history
                not yet verified.
              </p>

              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#159c73",
                }}
              >
                IMPORT PENDING
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <div className="label">THE RECEIPTS</div>

        <h2 style={{ marginTop: 8 }}>
          HEAD-TO-HEAD RIVALRIES
        </h2>

        <p className="muted">
          Lifetime records against other active managers,
          including playoff matchups, will appear here.
        </p>

        <span className="pill">
          AWAITING MATCHUP HISTORY
        </span>
      </section>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          marginTop: 28,
        }}
      >
        <Link href="/managers" className="button">
          ← All Managers
        </Link>

        <Link href="/records" className="button">
          View Record Book
        </Link>
      </div>
    </main>
  );
}
