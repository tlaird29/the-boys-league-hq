
import Link from "next/link";
import { db } from "../../lib/yahoo";

export const dynamic = "force-dynamic";

type Edition = {
  id: string;
  season: number;
  week: number;
  headline: string;
  subtitle: string;
  published_at: string | null;
};

export default async function NewspaperArchives() {
  let editions: Edition[] = [];
  let errorMessage = "";

  try {
    const result = await db()
      .from("newspaper_editions")
      .select(
        "id, season, week, headline, subtitle, published_at"
      )
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (result.error) {
      errorMessage = "The archive could not be loaded.";
    } else {
      editions = (result.data ?? []) as Edition[];
    }
  } catch {
    errorMessage = "The archive is temporarily unavailable.";
  }

  const seasons = Array.from(
    new Set(editions.map((edition) => edition.season))
  ).sort((a, b) => b - a);

  return (
    <main
      style={{
        maxWidth: 1100,
        margin: "30px auto",
        padding: "0 16px 50px",
      }}
    >
      <div
        style={{
          background: "#f4f0e4",
          color: "#211f19",
          padding: "clamp(20px, 5vw, 55px)",
          border: "1px solid #c6beac",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            textAlign: "center",
            borderBottom: "5px double #38352d",
            paddingBottom: 22,
          }}
        >
          <div
            style={{
              fontFamily:
                "'UnifrakturCook', Georgia, serif",
              fontSize: "clamp(52px, 9vw, 96px)",
              fontWeight: 700,
            }}
          >
            The Boys
          </div>

          <p
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            THE NEWSPAPER ARCHIVES
          </p>
        </div>

        <div
          style={{
            textAlign: "center",
            padding: "30px 0",
            borderBottom: "2px solid #38352d",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(34px, 6vw, 62px)",
              margin: "0 0 12px",
              lineHeight: 1.1,
            }}
          >
            FROM THE VAULT
          </h1>

          <p
            style={{
              fontStyle: "italic",
              fontSize: 18,
              color: "#625e53",
            }}
          >
            Every headline. Every roast. Every receipt.
          </p>

          <p
            style={{
              fontFamily: "Arial, sans-serif",
              fontSize: 12,
              marginTop: 18,
            }}
          >
            {editions.length} PUBLISHED EDITIONS
          </p>
        </div>

        {errorMessage && (
          <p style={{ padding: 25 }}>
            {errorMessage}
          </p>
        )}

        {!errorMessage && editions.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "55px 15px",
            }}
          >
            <h2>THE PRESSES ARE WARMING UP</h2>

            <p style={{ lineHeight: 1.8 }}>
              The first published Wednesday Report
              will appear here automatically once
              the publishing system is connected.
            </p>
          </div>
        )}

        {seasons.map((season) => (
          <section
            key={season}
            style={{ marginTop: 35 }}
          >
            <h2
              style={{
                fontSize: 36,
                borderBottom: "3px double #38352d",
                paddingBottom: 12,
              }}
            >
              {season} SEASON
            </h2>

            {editions
              .filter(
                (edition) => edition.season === season
              )
              .map((edition) => (
                <Link
                  key={edition.id}
                  href={`/newspaper/${edition.season}/${edition.week}`}
                  style={{
                    display: "block",
                    color: "#211f19",
                    textDecoration: "none",
                    padding: "22px 0",
                    borderBottom: "1px solid #b7af9d",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "Arial, sans-serif",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: 1.3,
                      marginBottom: 9,
                    }}
                  >
                    WEEK {edition.week}
                    {edition.published_at
                      ? ` • ${new Date(
                          edition.published_at
                        ).toLocaleDateString(
                          "en-US",
                          {
                            timeZone: "America/Boise",
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}`
                      : ""}
                  </div>

                  <h3
                    style={{
                      fontSize: 26,
                      lineHeight: 1.2,
                      margin: "0 0 8px",
                    }}
                  >
                    {edition.headline}
                  </h3>

                  <p
                    style={{
                      color: "#625e53",
                      fontSize: 15,
                      margin: 0,
                    }}
                  >
                    {edition.subtitle}
                  </p>
                </Link>
              ))}
          </section>
        ))}

        <div
          style={{
            marginTop: 45,
            paddingTop: 18,
            borderTop: "5px double #38352d",
            textAlign: "center",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#211f19",
              fontWeight: 800,
            }}
          >
            BACK TO THE LATEST EDITION
          </Link>
        </div>
      </div>
    </main>
  );
}
