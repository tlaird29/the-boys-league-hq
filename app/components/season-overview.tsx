
import Link from "next/link";

export type SeasonEdition = {
  year: number;
  week: number;
  headline: string;
  publishedAt?: string;
};

export type SeasonSummary = {
  championName: string | null;
  championTeamName: string | null;
  runnerUpName: string | null;
  highestScoringTeam: string | null;
  highestWeeklyScore: number | null;
  officialMatchups: number | null;
  totalPoints: number | null;
  regularSeasonWeeks: number | null;
  completed: boolean;
};

type Props = {
  year: number;
  summary?: SeasonSummary | null;
  editions?: readonly SeasonEdition[];
};

export default function SeasonOverview({
  year,
  summary = null,
  editions = [],
}: Props) {
  const weeklyEditions = [...editions]
    .filter(
      edition => edition.year === year
    )
    .sort(
      (a, b) => a.week - b.week
    );

  const stats = [
    {
      label: "LEAGUE CHAMPION",
      value:
        summary?.championTeamName ?? "—",
      detail:
        summary?.championName ??
        "Awaiting verification",
    },
    {
      label: "RUNNER-UP",
      value:
        summary?.runnerUpName ?? "—",
      detail: "Championship finalist",
    },
    {
      label: "HIGHEST SCORING TEAM",
      value:
        summary?.highestScoringTeam ?? "—",
      detail: "Regular-season points",
    },
    {
      label: "HIGHEST WEEKLY SCORE",
      value:
        summary?.highestWeeklyScore
          ?.toFixed(2) ?? "—",
      detail: "Official matchups",
    },
    {
      label: "OFFICIAL MATCHUPS",
      value:
        summary?.officialMatchups ?? "—",
      detail: "Excludes consolation",
    },
    {
      label: "TOTAL LEAGUE POINTS",
      value:
        summary?.totalPoints
          ?.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) ?? "—",
      detail: "Official scoring",
    },
  ];

  return (
    <section
      style={{
        marginTop: 24,
      }}
    >
      <div
        style={{
          background: "#14251f",
          color: "#ffffff",
          padding: 24,
          borderRadius: 16,
        }}
      >
        <div
          style={{
            color: "#48d6a8",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 2,
          }}
        >
          THE BOYS • {year} SEASON
        </div>

        <h2
          style={{
            fontSize:
              "clamp(28px, 4vw, 42px)",
            margin: "12px 0",
          }}
        >
          THE SEASON AT A GLANCE
        </h2>

        <p
          style={{
            color: "#c5d4cd",
            lineHeight: 1.7,
          }}
        >
          {summary
            ? summary.completed
              ? "Completed season."
              : "Season in progress."
            : "Historical results awaiting verification."}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: 12,
            marginTop: 20,
          }}
        >
          {stats.map(stat => (
            <div
              key={stat.label}
              style={{
                background: "#20382e",
                border: "1px solid #476055",
                borderRadius: 12,
                padding: 18,
              }}
            >
              <div
                style={{
                  color: "#c5d4cd",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1,
                }}
              >
                {stat.label}
              </div>

              <div
                style={{
                  color: "#48d6a8",
                  fontSize: 26,
                  fontWeight: 900,
                  margin: "12px 0",
                  overflowWrap: "anywhere",
                }}
              >
                {stat.value}
              </div>

              <div
                style={{
                  color: "#c5d4cd",
                  fontSize: 12,
                }}
              >
                {stat.detail}
              </div>
            </div>
          ))}
        </div>
      </div>

      <section
        style={{
          marginTop: 24,
          padding: 24,
          background: "#f4f0e4",
          color: "#211f19",
          border: "1px solid #c6beac",
          borderRadius: 4,
        }}
      >
        <div
          style={{
            textAlign: "center",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          THE BOYS • NEWSPAPER ARCHIVES
        </div>

        <h2
          style={{
            textAlign: "center",
            fontFamily: "Georgia, serif",
            fontSize:
              "clamp(30px, 5vw, 48px)",
            margin: "16px 0",
          }}
        >
          THE {year} WEDNESDAY REPORT
        </h2>

        <div
          style={{
            borderTop:
              "5px double #38352d",
            paddingTop: 16,
          }}
        >
          {weeklyEditions.length === 0 ? (
            <p
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 16,
                lineHeight: 1.8,
                color: "#625e53",
                textAlign: "center",
                padding: 20,
              }}
            >
              No authorized weekly editions
              have been connected to this
              season archive yet.
            </p>
          ) : (
            weeklyEditions.map(edition => (
              <article
                key={edition.week}
                style={{
                  padding: "20px 0",
                  borderBottom:
                    "1px solid #c6beac",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#197655",
                    letterSpacing: 1,
                  }}
                >
                  WEEK {edition.week}
                </div>

                <h3
                  style={{
                    fontFamily: "Georgia, serif",
                    fontSize: 24,
                    margin: "10px 0",
                  }}
                >
                  {edition.headline}
                </h3>

                <Link
                  href={
                    `/newsletters/${year}/` +
                    edition.week
                  }
                  style={{
                    fontSize: 12,
                    fontWeight: 900,
                    color: "#197655",
                    textDecoration: "underline",
                    textUnderlineOffset: 4,
                  }}
                >
                  READ THE FULL EDITION →
                </Link>
              </article>
            ))
          )}
        </div>

        <div
          style={{
            textAlign: "center",
            paddingTop: 20,
          }}
        >
          <Link
            href="/newsletters"
            style={{
              fontSize: 12,
              fontWeight: 900,
              color: "#197655",
            }}
          >
            EXPLORE ALL NEWSPAPER EDITIONS →
          </Link>
        </div>
      </section>
    </section>
  );
}
