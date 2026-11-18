
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "../../../../lib/yahoo";

export const dynamic = "force-dynamic";

type Honor = {
  name?: string | null;
  team?: string | null;
  points?: number | null;
  commentary?: string;
};

type PerfectSlot = {
  position: string;
  player?: string | null;
  fantasyTeam?: string | null;
  points?: number | null;
};

type Edition = {
  season: number;
  week: number;
  headline: string;
  subtitle: string;
  byline: string;
  article_paragraphs: string[];
  goat: Honor;
  bum: Honor;
  perfect_team: PerfectSlot[];
  published_at: string | null;
};

function HonorPanel({
  heading,
  honor,
}: {
  heading: string;
  honor: Honor;
}) {
  return (
    <section
      style={{
        borderBottom: "3px double #38352d",
        paddingBottom: 22,
        marginBottom: 24,
      }}
    >
      <h3
        style={{
          fontSize: 23,
          lineHeight: 1.15,
          margin: "0 0 14px",
        }}
      >
        {heading}
      </h3>

      <strong style={{ fontSize: 19 }}>
        {honor.name || "TO BE ANNOUNCED"}
      </strong>

      {honor.team && (
        <p style={{ fontSize: 12 }}>
          {honor.team}
        </p>
      )}

      {typeof honor.points === "number" && (
        <p style={{ fontWeight: 800 }}>
          {honor.points.toFixed(2)} PTS
        </p>
      )}

      <p
        style={{
          fontSize: 14,
          lineHeight: 1.7,
        }}
      >
        {honor.commentary || ""}
      </p>
    </section>
  );
}

export default async function ArchivedEdition({
  params,
}: {
  params: Promise<{
    season: string;
    week: string;
  }>;
}) {
  const { season, week } = await params;

  if (
    !/^\d{4}$/.test(season) ||
    !/^\d{1,2}$/.test(week)
  ) {
    notFound();
  }

  const { data, error } = await db()
    .from("newspaper_editions")
    .select("*")
    .eq("season", Number(season))
    .eq("week", Number(week))
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    throw new Error("Could not load archived edition");
  }

  if (!data) {
    notFound();
  }

  const edition = data as Edition;

  const paragraphs = Array.isArray(
    edition.article_paragraphs
  )
    ? edition.article_paragraphs
    : [];

  const slots = Array.isArray(edition.perfect_team)
    ? edition.perfect_team
    : [];

  const goat = edition.goat || {};
  const bum = edition.bum || {};

  const ready =
    slots.length > 0 &&
    slots.every(
      (slot) =>
        slot.player &&
        typeof slot.points === "number"
    );

  const total = ready
    ? slots.reduce(
        (sum, slot) => sum + (slot.points ?? 0),
        0
      )
    : null;

  return (
    <>
      <style>{`
        .archived-paper-grid {
          display: grid;
          grid-template-columns:
            minmax(0, 210px)
            minmax(0, 1fr)
            minmax(0, 210px);
          gap: 24px;
        }

        .archived-paper-left {
          border-right: 1px solid #aaa18e;
          padding-right: 20px;
          min-width: 0;
        }

        .archived-paper-center {
          min-width: 0;
        }

        .archived-paper-right {
          border-left: 1px solid #aaa18e;
          padding-left: 20px;
          min-width: 0;
        }

        @media (max-width: 900px) {
          .archived-paper-grid {
            grid-template-columns: 1fr;
          }

          .archived-paper-center {
            grid-row: 1;
          }

          .archived-paper-left {
            grid-row: 2;
            border-right: 0;
            border-top: 3px double #38352d;
            padding-right: 0;
            padding-top: 22px;
          }

          .archived-paper-right {
            grid-row: 3;
            border-left: 0;
            border-top: 3px double #38352d;
            padding-left: 0;
            padding-top: 22px;
          }
        }
      `}</style>

      <main
        style={{
          maxWidth: 1320,
          margin: "30px auto",
          padding: "0 12px 50px",
        }}
      >
        <article
          style={{
            background: "#f4f0e4",
            color: "#211f19",
            padding: "clamp(18px, 3vw, 42px)",
            border: "1px solid #c6beac",
            fontFamily: "Georgia, serif",
          }}
        >
          <header
            style={{
              textAlign: "center",
              borderBottom: "5px double #38352d",
              paddingBottom: 20,
            }}
          >
            <div
              style={{
                fontFamily:
                  "'UnifrakturCook', Georgia, serif",
                fontSize: "clamp(58px, 10vw, 112px)",
                fontWeight: 700,
              }}
            >
              The Boys
            </div>

            <div
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 1.5,
              }}
            >
              ALL THE NEWS THAT&apos;S FIT TO ROAST
            </div>
          </header>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              padding: "13px 0",
              borderBottom: "2px solid #38352d",
              fontFamily: "Arial, sans-serif",
              fontSize: 11,
              fontWeight: 800,
            }}
          >
            <span>
              THE WEDNESDAY REPORT
            </span>

            <span>
              {edition.season} • WEEK {edition.week}
            </span>

            <span>FROM THE VAULT</span>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "30px 0",
              borderBottom: "1px solid #38352d",
            }}
          >
            <h1
              style={{
                fontSize: "clamp(34px, 6vw, 68px)",
                lineHeight: 1.05,
                margin: "0 0 18px",
              }}
            >
              {edition.headline}
            </h1>

            <p
              style={{
                fontSize: 19,
                fontStyle: "italic",
                lineHeight: 1.5,
                color: "#625e53",
              }}
            >
              {edition.subtitle}
            </p>

            <p
              style={{
                fontFamily: "Arial, sans-serif",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              BY {edition.byline}
            </p>
          </div>

          <div
            className="archived-paper-grid"
            style={{ padding: "30px 0" }}
          >
            <aside className="archived-paper-left">
              <h2 style={{ fontSize: 24 }}>
                THE PERFECT TEAM
              </h2>

              <p
                style={{
                  fontSize: 13,
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}
              >
                The highest-scoring legal lineup.
              </p>

              {slots.map((slot, index) => (
                <div
                  key={`${slot.position}-${index}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "40px minmax(0, 1fr) auto",
                    gap: 6,
                    borderBottom: "1px solid #c5bdab",
                    padding: "11px 0",
                    fontSize: 13,
                  }}
                >
                  <strong>{slot.position}</strong>

                  <div>
                    <strong>
                      {slot.player || "Awaiting results"}
                    </strong>

                    {slot.fantasyTeam && (
                      <div
                        style={{
                          fontSize: 11,
                          marginTop: 4,
                        }}
                      >
                        {slot.fantasyTeam}
                      </div>
                    )}
                  </div>

                  <strong>
                    {typeof slot.points === "number"
                      ? slot.points.toFixed(2)
                      : "—"}
                  </strong>
                </div>
              ))}

              <p
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  borderTop: "3px double #38352d",
                  paddingTop: 14,
                }}
              >
                TOTAL:{" "}
                {total === null
                  ? "—"
                  : total.toFixed(2)}
              </p>
            </aside>

            <section className="archived-paper-center">
              <div
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: 1.3,
                  marginBottom: 20,
                }}
              >
                THE LEAGUE DISPATCH
              </div>

              {paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  style={{
                    fontSize: 17,
                    lineHeight: 1.85,
                    margin: "0 0 22px",
                    overflowWrap: "break-word",
                  }}
                >
                  {paragraph}
                </p>
              ))}

              <div
                style={{
                  textAlign: "center",
                  fontSize: 34,
                  fontWeight: 900,
                  borderTop: "1px solid #38352d",
                  paddingTop: 25,
                }}
              >
                ICE TF UP! 🏈
              </div>
            </section>

            <aside className="archived-paper-right">
              <HonorPanel
                heading="GOAT OF THE WEEK"
                honor={goat}
              />

              <HonorPanel
                heading="BUM OF THE WEEK"
                honor={bum}
              />
            </aside>
          </div>

          <footer
            style={{
              textAlign: "center",
              borderTop: "5px double #38352d",
              paddingTop: 20,
            }}
          >
            <Link
              href="/newspaper"
              style={{
                color: "#211f19",
                fontWeight: 800,
              }}
            >
              RETURN TO NEWSPAPER ARCHIVES
            </Link>
          </footer>
        </article>
      </main>
    </>
  );
}
