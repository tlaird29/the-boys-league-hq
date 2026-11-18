
import Link from "next/link";
import type { CSSProperties } from "react";

const nav = [
  ["Dashboard", "/"],
  ["Record Book", "/records"],
  ["Rafters", "/rafters"],
  ["Season Awards", "/awards"],
  ["Rivalries", "/rivalries"],
  ["Season Archives", "/seasons"],
  ["Commissioner", "/commissioner"],
];

// THE WEDNESDAY REPORT
// All content below is placeholder material.
// Real scores and articles will be added after data import.

const edition = {
  week: "NEXT EDITION COMING SOON",
  headline: "THE BOYS ARE AT IT AGAIN",
  subtitle:
    "Ten managers. Five matchups. One weekly reminder that confidence and competence are not the same thing.",
  byline: "THE BOYS LEAGUE NEWS DESK",

  paragraphs: [
    "The Boys Fantasy Football League is preparing another edition of its most respected, least professionally supervised publication. Ten managers enter every week convinced they've built a championship roster. By Tuesday morning, half of them are investigating whether Yahoo accidentally forgot to count somebody's touchdowns. The other half are updating the group chat like they personally invented football.",

    "This is where the weekly opening monologue will appear. Every edition will begin with the biggest storyline in the league, whether that's an undefeated team finally getting humbled, a manager fumbling an easy win, or a trade proposal so offensive it deserves its own congressional hearing.",

    "The first matchup will flow naturally into the article. Rather than opening another page or clicking a recap, readers will get the final score, key performances, managerial decisions, and an appropriately ruthless assessment of how the game unfolded.",

    "From there, the column moves directly into the next matchup. The transitions will feel like a real sportswriter moving through the week's biggest stories, not a website trying to organize everything into separate boxes. Each game gets its own personality, and nobody gets to hide behind a generic recap.",

    "The remaining matchups will continue in the same format. We'll cover the players who carried their teams, the bench decisions that should trigger an internal investigation, and the managers whose confidence somehow survived another deeply embarrassing Sunday.",

    "Once all five matchups have been covered, the article will wrap up with the league-wide implications: standings movement, playoff pressure, streaks, rivalries, and whatever fresh nonsense the group chat has contributed to the historical record.",
  ],

  closing: "ICE TF UP! 🏈",
};

type WeeklyHonor = {
  name: string | null;
  team: string | null;
  points: number | null;
  commentary: string;
};

const goat: WeeklyHonor = {
  name: null,
  team: null,
  points: null,
  commentary:
    "The week's most dominant fantasy performance will be immortalized here, with a proper breakdown of why this player or manager deserves the crown.",
};

const bum: WeeklyHonor = {
  name: null,
  team: null,
  points: null,
  commentary:
    "A weekly tribute to poor decisions, unfortunate performances, and the kind of fantasy football disaster that should require a written apology.",
};

type PerfectSlot = {
  position: string;
  player: string | null;
  fantasyTeam: string | null;
  points: number | null;
};

// These lineup slots are provisional.
// They will be verified against Yahoo league settings.
// Each player must appear only once.

const perfectTeam: PerfectSlot[] = [
  { position: "QB", player: null, fantasyTeam: null, points: null },
  { position: "RB1", player: null, fantasyTeam: null, points: null },
  { position: "RB2", player: null, fantasyTeam: null, points: null },
  { position: "WR1", player: null, fantasyTeam: null, points: null },
  { position: "WR2", player: null, fantasyTeam: null, points: null },
  { position: "TE", player: null, fantasyTeam: null, points: null },
  { position: "FLEX", player: null, fantasyTeam: null, points: null },
  { position: "K", player: null, fantasyTeam: null, points: null },
  { position: "DEF", player: null, fantasyTeam: null, points: null },
];

const perfectTeamReady = perfectTeam.every(
  (slot) => slot.player !== null && slot.points !== null
);

const perfectTeamTotal = perfectTeamReady
  ? perfectTeam.reduce(
      (total, slot) => total + (slot.points ?? 0),
      0
    )
  : null;

const ink = "#211f19";
const faded = "#625e53";
const paper = "#f4f0e4";
const rule = "#38352d";

const smallPrint: CSSProperties = {
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.35,
  textTransform: "uppercase",
};

const paragraphStyle: CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: 16.5,
  lineHeight: 1.85,
  color: ink,
  textAlign: "left",
  margin: "0 0 22px",
  overflowWrap: "break-word",
};

function HonorColumn({
  title,
  eyebrow,
  honor,
}: {
  title: string;
  eyebrow: string;
  honor: WeeklyHonor;
}) {
  return (
    <section
      style={{
        borderBottom: `3px double ${rule}`,
        paddingBottom: 23,
        marginBottom: 25,
      }}
    >
      <div style={smallPrint}>{eyebrow}</div>

      <h3
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 27,
          lineHeight: 1.1,
          margin: "10px 0 14px",
          textTransform: "uppercase",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          borderTop: `1px solid ${rule}`,
          paddingTop: 12,
        }}
      >
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          {honor.name ?? "TO BE ANNOUNCED"}
        </div>

        {honor.team && (
          <div
            style={{
              ...smallPrint,
              marginTop: 7,
              color: faded,
            }}
          >
            {honor.team}
          </div>
        )}

        {honor.points !== null && (
          <div
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 25,
              fontWeight: 800,
              marginTop: 9,
            }}
          >
            {honor.points.toFixed(2)} PTS
          </div>
        )}

        <p
          style={{
            ...paragraphStyle,
            fontSize: 14.5,
            lineHeight: 1.7,
            marginTop: 13,
            marginBottom: 0,
          }}
        >
          {honor.commentary}
        </p>
      </div>
    </section>
  );
}

function PerfectTeamColumn() {
  return (
    <section>
      <div style={smallPrint}>
        THE ULTIMATE WEEKLY LINEUP
      </div>

      <h3
        style={{
          fontFamily: "Georgia, 'Times New Roman', serif",
          fontSize: 28,
          lineHeight: 1.1,
          margin: "10px 0",
        }}
      >
        THE PERFECT TEAM
      </h3>

      <p
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 13,
          fontStyle: "italic",
          color: faded,
          lineHeight: 1.6,
          marginBottom: 18,
        }}
      >
        The highest-scoring possible starting lineup
        from the week's eligible players.
      </p>

      <div
        style={{
          borderTop: `3px double ${rule}`,
          borderBottom: `1px solid ${rule}`,
          padding: "10px 0",
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          ...smallPrint,
        }}
      >
        <span>POSITION / PLAYER</span>
        <span>PTS</span>
      </div>

      {perfectTeam.map((slot) => (
        <div
          key={slot.position}
          style={{
            display: "grid",
            gridTemplateColumns: "44px minmax(0, 1fr) auto",
            gap: 8,
            alignItems: "start",
            padding: "11px 0",
            borderBottom: "1px solid #c5bdab",
          }}
        >
          <strong
            style={{
              ...smallPrint,
              fontSize: 11,
              paddingTop: 3,
            }}
          >
            {slot.position}
          </strong>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "Georgia, serif",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {slot.player ?? "Awaiting results"}
            </div>

            {slot.fantasyTeam && (
              <div
                style={{
                  fontFamily: "Arial, sans-serif",
                  fontSize: 10,
                  color: faded,
                  marginTop: 4,
                }}
              >
                {slot.fantasyTeam}
              </div>
            )}
          </div>

          <strong
            style={{
              fontFamily: "Georgia, serif",
              fontSize: 14,
            }}
          >
            {slot.points === null
              ? "—"
              : slot.points.toFixed(2)}
          </strong>
        </div>
      ))}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          padding: "16px 0",
          borderBottom: `3px double ${rule}`,
        }}
      >
        <div style={smallPrint}>
          PERFECT TEAM TOTAL
        </div>

        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 27,
            fontWeight: 900,
          }}
        >
          {perfectTeamTotal === null
            ? "—"
            : perfectTeamTotal.toFixed(2)}
        </div>
      </div>

      <p
        style={{
          fontFamily: "Georgia, serif",
          fontSize: 12,
          fontStyle: "italic",
          lineHeight: 1.6,
          color: faded,
          marginTop: 13,
        }}
      >
        Final lineup slots and FLEX eligibility will
        follow the league's official Yahoo settings.
        Each player may appear only once.
      </p>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <style>{`
        .boys-newspaper-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 285px;
          gap: 30px;
        }

        .boys-news-article {
          min-width: 0;
          padding-right: 30px;
          border-right: 1px solid #aaa18e;
        }

        .boys-news-columns {
          column-count: 2;
          column-gap: 28px;
          column-rule: 1px solid #c5bdab;
        }

        .boys-news-sidebar {
          min-width: 0;
        }

        @media (max-width: 850px) {
          .boys-newspaper-layout {
            grid-template-columns: 1fr;
          }

          .boys-news-article {
            padding-right: 0;
            border-right: 0;
          }

          .boys-news-sidebar {
            border-top: 4px double #38352d;
            padding-top: 25px;
          }
        }

        @media (max-width: 600px) {
          .boys-news-columns {
            column-count: 1;
          }
        }
      `}</style>

      {/* LEAGUE HQ HEADER */}

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

      {/* PRINT NEWSPAPER */}

      <main
        style={{
          maxWidth: 1180,
          margin: "28px auto",
          padding: "0 12px",
        }}
      >
        <article
          style={{
            background: paper,
            color: ink,
            padding: "clamp(16px, 4vw, 48px)",
            border: "1px solid #c6beac",
            boxShadow: "0 10px 28px #14251f20",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(55,45,25,0.012) 4px)",
          }}
        >
          {/* TOP PRINT STRIP */}

          <div
            style={{
              ...smallPrint,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 8,
              borderBottom: `1px solid ${rule}`,
              paddingBottom: 10,
            }}
          >
            <span>EST. MMXX</span>
            <span>THE BOYS FANTASY FOOTBALL LEAGUE</span>
            <span>WEDNESDAY EDITION</span>
          </div>

          {/* NEWSPAPER MASTHEAD */}

          <div
            style={{
              textAlign: "center",
              padding: "18px 0 16px",
              borderBottom: `5px double ${rule}`,
            }}
          >
            <div
              style={{
                fontFamily:
                  "'UnifrakturCook', 'Old English Text MT', Georgia, serif",
                fontSize: "clamp(58px, 10vw, 118px)",
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.035em",
              }}
            >
              The Boys
            </div>

            <div
              style={{
                ...smallPrint,
                fontSize: 11,
                marginTop: 10,
              }}
            >
              ALL THE NEWS THAT&apos;S FIT TO ROAST
            </div>
          </div>

          {/* ISSUE LINE */}

          <div
            style={{
              ...smallPrint,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              padding: "12px 0",
              borderBottom: `2px solid ${rule}`,
            }}
          >
            <span>THE WEDNESDAY REPORT</span>
            <span>{edition.week}</span>
            <span>PRICE: YOUR DIGNITY</span>
          </div>

          {/* MAIN HEADLINE */}

          <section
            style={{
              textAlign: "center",
              padding: "30px 0 25px",
              borderBottom: `1px solid ${rule}`,
            }}
          >
            <div
              style={{
                ...smallPrint,
                marginBottom: 14,
              }}
            >
              THE LEAGUE&apos;S MOST UNNECESSARY
              INVESTIGATIVE JOURNALISM
            </div>

            <h2
              style={{
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(37px, 6.5vw, 76px)",
                lineHeight: 1.04,
                fontWeight: 900,
                letterSpacing: "-0.045em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              {edition.headline}
            </h2>

            <p
              style={{
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(17px, 2vw, 21px)",
                fontStyle: "italic",
                lineHeight: 1.55,
                maxWidth: 800,
                margin: "18px auto",
                color: faded,
              }}
            >
              {edition.subtitle}
            </p>

            <div style={smallPrint}>
              BY {edition.byline}
            </div>
          </section>

          {/* MAIN STORY AND SIDEBAR */}

          <div
            className="boys-newspaper-layout"
            style={{
              paddingTop: 30,
              paddingBottom: 25,
              borderBottom: `4px double ${rule}`,
            }}
          >
            {/* CONTINUOUS SATIRICAL ARTICLE */}

            <section className="boys-news-article">
              <div
                style={{
                  ...smallPrint,
                  marginBottom: 18,
                }}
              >
                THE WEDNESDAY REPORT • LEAGUE DISPATCH
              </div>

              <div className="boys-news-columns">
                {edition.paragraphs.map(
                  (paragraph, index) => (
                    <p
                      key={index}
                      style={paragraphStyle}
                    >
                      {index === 0 ? (
                        <>
                          <span
                            style={{
                              float: "left",
                              fontFamily:
                                "Georgia, 'Times New Roman', serif",
                              fontSize: 74,
                              fontWeight: 900,
                              lineHeight: 0.85,
                              paddingRight: 8,
                              paddingTop: 5,
                            }}
                          >
                            {paragraph.charAt(0)}
                          </span>

                          {paragraph.slice(1)}
                        </>
                      ) : (
                        paragraph
                      )}
                    </p>
                  )
                )}
              </div>

              <div
                style={{
                  fontFamily:
                    "Georgia, 'Times New Roman', serif",
                  fontSize: "clamp(29px, 4vw, 45px)",
                  fontWeight: 900,
                  textAlign: "center",
                  padding: "25px 0 10px",
                  borderTop: `1px solid ${rule}`,
                  marginTop: 12,
                }}
              >
                {edition.closing}
              </div>
            </section>

            {/* NEWSPAPER SIDEBAR */}

            <aside className="boys-news-sidebar">
              <HonorColumn
                title="GOAT OF THE WEEK"
                eyebrow="THE WEEK'S FINEST"
                honor={goat}
              />

              <HonorColumn
                title="BUM OF THE WEEK"
                eyebrow="THE WEEK'S WORST"
                honor={bum}
              />

              <PerfectTeamColumn />
            </aside>
          </div>

          {/* PRINT FOOTER */}

          <div
            style={{
              ...smallPrint,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              paddingTop: 15,
            }}
          >
            <span>THE BOYS • EST. 2020</span>
            <span>ALL RECEIPTS PRESERVED</span>
          </div>
        </article>

        <footer style={{ textAlign: "center" }}>
          THE BOYS • PRIVATE LEAGUE HISTORY • EST. 2020
        </footer>
      </main>
    </>
  );
}
