
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

const edition = {
  label: "THE WEDNESDAY REPORT",
  issue: "NEXT EDITION COMING SOON",
  headline: "THE BOYS ARE AT IT AGAIN",
  deck:
    "Another week of fantasy football. Another round of questionable decisions, improbable victories, and unforgettable receipts.",
  byline: "BY THE BOYS LEAGUE NEWS DESK",

  opening:
    "The official Wednesday Report will take over this front page each week. The biggest storyline, every matchup recap, and the latest league drama will be published right here.",

  lead:
    "This space is reserved for the full opening column. Expect a proper sportswriter's breakdown of the week's chaos, complete with the kind of trash talk that belongs in the league history books.",

  matchups: [
    {
      title: "MATCHUP REPORT NO. 1",
      text: "The first matchup recap will appear here, including the final score, standout players, and the manager who has some explaining to do.",
    },
    {
      title: "MATCHUP REPORT NO. 2",
      text: "Another battle, another permanent receipt. This column will cover the second matchup and its biggest turning points.",
    },
    {
      title: "MATCHUP REPORT NO. 3",
      text: "The third matchup gets its own column, complete with analysis, controversy, and appropriately unreasonable commentary.",
    },
    {
      title: "MATCHUP REPORT NO. 4",
      text: "A full recap of the fourth matchup, from the stars who delivered to the lineup decisions that didn't.",
    },
    {
      title: "MATCHUP REPORT NO. 5",
      text: "The final matchup of the week closes out the scoreboard, but the embarrassment may last considerably longer.",
    },
  ],

  goat:
    "The week's most dominant fantasy performance will be recognized here.",

  bum:
    "The week's most spectacular disappointment will be documented here.",

  closing: "ICE TF UP! 🏈",
};

const ink = "#202019";
const faded = "#5b574e";
const rule = "#37362f";
const paper = "#f3efdf";

const smallCaps: React.CSSProperties = {
  fontFamily: "Arial, Helvetica, sans-serif",
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.6,
  textTransform: "uppercase",
};

const bodyCopy: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: 16,
  lineHeight: 1.75,
  color: ink,
  textAlign: "left",
  hyphens: "auto",
};

const storyHeading: React.CSSProperties = {
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontWeight: 900,
  fontSize: 25,
  lineHeight: 1.15,
  textTransform: "none",
  letterSpacing: "-0.025em",
  margin: "9px 0 12px",
};

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

      <main
        style={{
          maxWidth: 1160,
          margin: "28px auto",
          padding: "0 12px",
        }}
      >
        <article
          style={{
            backgroundColor: paper,
            color: ink,
            padding: "clamp(16px, 4vw, 48px)",
            border: "1px solid #c9c1ad",
            boxShadow: "0 12px 28px #18251b20",
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(65,55,35,0.012) 4px)",
          }}
        >
          {/* NEWSPAPER TOP LINE */}

          <div
            style={{
              ...smallCaps,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              paddingBottom: 9,
              borderBottom: `1px solid ${rule}`,
            }}
          >
            <span>EST. MMXX</span>
            <span>THE BOYS FANTASY FOOTBALL LEAGUE</span>
            <span>WEDNESDAY EDITION</span>
          </div>

          {/* CLASSIC NEWSPAPER MASTHEAD */}

          <div
            style={{
              textAlign: "center",
              padding: "16px 0 12px",
              borderBottom: `5px double ${rule}`,
            }}
          >
            <div
              style={{
                fontFamily:
                  "'Old English Text MT', 'UnifrakturCook', 'Times New Roman', serif",
                fontSize: "clamp(45px, 9vw, 108px)",
                fontWeight: 900,
                letterSpacing: "-0.055em",
                lineHeight: 1.05,
              }}
            >
              The Boys Times
            </div>

            <div
              style={{
                ...smallCaps,
                fontSize: 11,
                marginTop: 10,
              }}
            >
              ALL THE NEWS THAT&apos;S FIT TO ROAST
            </div>
          </div>

          {/* EDITION INFORMATION */}

          <div
            style={{
              ...smallCaps,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              padding: "11px 0",
              borderBottom: `2px solid ${rule}`,
            }}
          >
            <span>{edition.label}</span>
            <span>{edition.issue}</span>
            <span>PRICE: YOUR DIGNITY</span>
          </div>

          {/* MAIN FRONT PAGE HEADLINE */}

          <section
            style={{
              textAlign: "center",
              padding: "26px 0 20px",
              borderBottom: `1px solid ${rule}`,
            }}
          >
            <div
              style={{
                ...smallCaps,
                marginBottom: 14,
              }}
            >
              THE OFFICIAL LEAGUE DISPATCH
            </div>

            <h2
              style={{
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(35px, 6.5vw, 78px)",
                fontWeight: 900,
                letterSpacing: "-0.045em",
                lineHeight: 1.02,
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
                fontSize: "clamp(16px, 2vw, 21px)",
                fontStyle: "italic",
                lineHeight: 1.5,
                maxWidth: 850,
                margin: "18px auto 12px",
                color: faded,
              }}
            >
              {edition.deck}
            </p>

            <div
              style={{
                ...smallCaps,
                fontSize: 10,
                marginTop: 16,
              }}
            >
              {edition.byline}
            </div>
          </section>

          {/* LEAD ARTICLE */}

          <section
            style={{
              padding: "24px 0",
              borderBottom: `3px double ${rule}`,
            }}
          >
            <div
              style={{
                ...smallCaps,
                textAlign: "center",
                marginBottom: 18,
              }}
            >
              FRONT PAGE • LEAD STORY
            </div>

            <div
              style={{
                columns: "260px 2",
                columnGap: 30,
                columnRule: "1px solid #b8b09d",
              }}
            >
              <p
                style={{
                  ...bodyCopy,
                  marginTop: 0,
                }}
              >
                <span
                  style={{
                    float: "left",
                    fontSize: 65,
                    lineHeight: 0.85,
                    paddingRight: 7,
                    fontWeight: 900,
                  }}
                >
                  {edition.opening.charAt(0)}
                </span>
                {edition.opening.slice(1)}
              </p>

              <p style={bodyCopy}>
                {edition.lead}
              </p>
            </div>
          </section>

          {/* FIVE MATCHUP STORIES */}

          <section
            style={{
              padding: "22px 0",
              borderBottom: `3px double ${rule}`,
            }}
          >
            <div
              style={{
                ...smallCaps,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              THE SPORTS DESK
            </div>

            <h2
              style={{
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(29px, 4vw, 43px)",
                textAlign: "center",
                textTransform: "uppercase",
                marginBottom: 24,
              }}
            >
              AROUND THE LEAGUE
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                gap: 0,
              }}
            >
              {edition.matchups.map((story, index) => (
                <div
                  key={index}
                  style={{
                    padding: "14px 18px",
                    borderTop: `1px solid ${rule}`,
                    borderRight:
                      index % 2 === 0
                        ? "1px solid #b8b09d"
                        : "none",
                  }}
                >
                  <div style={smallCaps}>
                    GAME {index + 1} • MATCHUP RECAP
                  </div>

                  <h3 style={storyHeading}>
                    {story.title}
                  </h3>

                  <p style={bodyCopy}>
                    {story.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* GOAT AND BUM EDITORIAL */}

          <section
            style={{
              padding: "24px 0",
              borderBottom: `3px double ${rule}`,
            }}
          >
            <div
              style={{
                ...smallCaps,
                textAlign: "center",
              }}
            >
              THE EDITORIAL BOARD
            </div>

            <h2
              style={{
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(28px, 4vw, 42px)",
                textAlign: "center",
                margin: "10px 0 22px",
              }}
            >
              HONORS & DISHONORS
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 250px), 1fr))",
                gap: 25,
              }}
            >
              <div>
                <div
                  style={{
                    ...smallCaps,
                    paddingBottom: 9,
                    borderBottom: `1px solid ${rule}`,
                  }}
                >
                  THE WEEK&apos;S FINEST
                </div>

                <h3 style={storyHeading}>
                  GOAT OF THE WEEK
                </h3>

                <p style={bodyCopy}>
                  {edition.goat}
                </p>
              </div>

              <div>
                <div
                  style={{
                    ...smallCaps,
                    paddingBottom: 9,
                    borderBottom: `1px solid ${rule}`,
                  }}
                >
                  THE WEEK&apos;S WORST
                </div>

                <h3 style={storyHeading}>
                  BUM OF THE WEEK
                </h3>

                <p style={bodyCopy}>
                  {edition.bum}
                </p>
              </div>
            </div>
          </section>

          {/* SIGN-OFF */}

          <div
            style={{
              padding: "28px 0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily:
                  "Georgia, 'Times New Roman', serif",
                fontSize: "clamp(29px, 5vw, 48px)",
                fontWeight: 900,
              }}
            >
              {edition.closing}
            </div>

            <div
              style={{
                ...smallCaps,
                marginTop: 10,
              }}
            >
              UNTIL NEXT WEDNESDAY
            </div>
          </div>

          {/* PRINT EDITION FOOTER */}

          <div
            style={{
              ...smallCaps,
              display: "flex",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
              borderTop: `5px double ${rule}`,
              paddingTop: 13,
            }}
          >
            <span>THE BOYS TIMES • EST. 2020</span>
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
