
import Link from "next/link";

type Championship = {
  year: number;
  teamName: string | null;
  managerName: string | null;
};

const championships: Championship[] = [
  { year: 2020, teamName: null, managerName: null },
  { year: 2021, teamName: null, managerName: null },
  { year: 2022, teamName: null, managerName: null },
  { year: 2023, teamName: null, managerName: null },
  { year: 2024, teamName: null, managerName: null },
  { year: 2025, teamName: null, managerName: null },
  { year: 2026, teamName: null, managerName: null },
];

function ChampionshipBanner({
  championship,
}: {
  championship: Championship;
}) {
  const { year, teamName, managerName } =
    championship;

  const dark = year % 2 === 0;

  const colors = {
    fabric: dark ? "#14251f" : "#b4ead9",
    fabricLight: dark ? "#315b47" : "#e1f8ef",
    fabricDark: dark ? "#091b13" : "#7eae9c",
    text: dark ? "#f5f7f5" : "#14251f",
    accent: dark ? "#48d6a8" : "#205b46",
    gold: dark ? "#e3c77d" : "#88703b",
  };

  const confirmed = Boolean(
    teamName && managerName
  );

  return (
    <article
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 260,
        paddingTop: 44,
        filter:
          "drop-shadow(5px 15px 12px #0009)",
      }}
      aria-label={`${year} ${
        confirmed
          ? `${teamName}, ${managerName}`
          : "championship pending verification"
      }`}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "18%",
          width: 3,
          height: 50,
          background:
            "linear-gradient(90deg,#343c38,#b3bdb7,#555f58)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          right: "18%",
          width: 3,
          height: 50,
          background:
            "linear-gradient(90deg,#343c38,#b3bdb7,#555f58)",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 40,
          left: "-2%",
          width: "104%",
          height: 9,
          borderRadius: 5,
          background:
            "linear-gradient(180deg,#d6ddd7,#7a8780,#303a34)",
          boxShadow: "0 3px 6px #0009",
          zIndex: 2,
        }}
      />

      <div
        style={{
          position: "relative",
          aspectRatio: "0.59",
          clipPath:
            "polygon(0 0,100% 0,100% 83%,50% 100%,0 83%)",
          background: colors.gold,
          padding: 4,
        }}
      >
        <div
          style={{
            height: "100%",
            position: "relative",
            clipPath:
              "polygon(0 0,100% 0,100% 83%,50% 100%,0 83%)",
            background: `
              repeating-linear-gradient(
                90deg,
                transparent 0px,
                transparent 2px,
                #00000008 3px
              ),
              linear-gradient(
                90deg,
                ${colors.fabricDark},
                ${colors.fabricLight} 18%,
                ${colors.fabric} 38%,
                ${colors.fabricLight} 67%,
                ${colors.fabricDark}
              )
            `,
            color: colors.text,
            textAlign: "center",
            padding: "9% 7% 20%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <svg
            viewBox="0 0 200 340"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <path
              d="M9 9 H191 V277 L100 329 L9 277 Z"
              fill="none"
              stroke={colors.gold}
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
          </svg>

          <div
            style={{
              fontFamily:
                "'Barlow Condensed', Impact, sans-serif",
              fontWeight: 900,
              fontSize: "clamp(24px, 3vw, 40px)",
              letterSpacing: 1,
              lineHeight: 1,
              color: colors.accent,
            }}
          >
            THE BOYS
          </div>

          <div
            style={{
              fontSize: 8,
              fontWeight: 800,
              letterSpacing: 2,
              marginTop: 5,
            }}
          >
            EST. 2020
          </div>

          <div
            style={{
              height: 2,
              width: "85%",
              background: colors.gold,
              margin: "12px 0",
            }}
          />

          <div
            style={{
              fontFamily:
                "'Barlow Condensed', Impact, sans-serif",
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: 1,
              lineHeight: 1,
            }}
          >
            LEAGUE
            <br />
            CHAMPION
          </div>

          <div
            style={{
              fontFamily:
                "'Barlow Condensed', Impact, sans-serif",
              fontSize: "clamp(44px, 6vw, 76px)",
              fontWeight: 900,
              lineHeight: 1.1,
              margin: "8px 0",
              textShadow: dark
                ? "2px 3px 0 #0005"
                : "1px 2px 0 #ffffff55",
            }}
          >
            {year}
          </div>

          <div
            style={{
              width: "45%",
              height: 1,
              background: colors.gold,
              marginBottom: 12,
            }}
          />

          <div
            style={{
              fontFamily:
                "'Barlow Condensed', Impact, sans-serif",
              fontWeight: 800,
              fontSize: 20,
              lineHeight: 1.05,
              textTransform: "uppercase",
              overflowWrap: "anywhere",
              width: "100%",
            }}
          >
            {teamName ??
              "AWAITING VERIFICATION"}
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              marginTop: 8,
              color: colors.text,
              overflowWrap: "anywhere",
              width: "100%",
            }}
          >
            {managerName ??
              "Champion not confirmed"}
          </div>

          <div
            style={{
              marginTop: "auto",
              paddingTop: 10,
              fontSize: 22,
              color: colors.gold,
            }}
          >
            ★
          </div>
        </div>
      </div>
    </article>
  );
}

function StadiumBackdrop() {
  return (
    <svg
      viewBox="0 0 1400 900"
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
    >
      <defs>
        <linearGradient
          id="stadium-roof"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop stopColor="#030705" />
          <stop
            offset=".5"
            stopColor="#20352b"
          />
          <stop
            offset="1"
            stopColor="#060e09"
          />
        </linearGradient>

        <radialGradient id="stadium-glow">
          <stop
            stopColor="#b4ead9"
            stopOpacity=".22"
          />
          <stop
            offset="1"
            stopColor="#b4ead9"
            stopOpacity="0"
          />
        </radialGradient>

        <linearGradient
          id="stadium-light"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop
            stopColor="#e0fff0"
            stopOpacity=".2"
          />
          <stop
            offset="1"
            stopColor="#e0fff0"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>

      <rect
        width="1400"
        height="900"
        fill="url(#stadium-roof)"
      />

      {Array.from(
        { length: 15 },
        (_, i) => (
          <g key={i}>
            <path
              d={`M${i * 110 - 70} 0 L700 290 L${i * 110 + 10} 0`}
              stroke="#405249"
              strokeWidth="5"
              fill="none"
              opacity=".55"
            />
          </g>
        )
      )}

      <path
        d="M-50 100 Q700 -65 1450 100"
        stroke="#637269"
        strokeWidth="12"
        fill="none"
      />

      <path
        d="M-50 160 Q700 -5 1450 160"
        stroke="#46574d"
        strokeWidth="10"
        fill="none"
      />

      {Array.from(
        { length: 25 },
        (_, i) => {
          const x = i * 60 - 30;

          const y =
            100 -
            82 *
              Math.sin(
                (i / 24) * Math.PI
              );

          return (
            <path
              key={i}
              d={`M${x} ${y} l60 60 v-60`}
              stroke="#4c5d53"
              strokeWidth="4"
              fill="none"
            />
          );
        }
      )}

      <ellipse
        cx="700"
        cy="390"
        rx="690"
        ry="430"
        fill="url(#stadium-glow)"
      />

      {[100, 400, 700, 1000, 1300].map(
        x => (
          <g key={x}>
            <path
              d={`M${x - 20} 180 H${x + 20} L${x + 190} 730 H${x - 190} Z`}
              fill="url(#stadium-light)"
            />

            <rect
              x={x - 20}
              y="171"
              width="40"
              height="9"
              rx="3"
              fill="#d9f6e8"
            />
          </g>
        )
      )}

      {Array.from(
        { length: 7 },
        (_, i) => (
          <path
            key={i}
            d={`M-50 ${650 + i * 35} Q700 ${790 + i * 22} 1450 ${650 + i * 35}`}
            stroke="#34473c"
            strokeWidth="5"
            fill="none"
            opacity=".35"
          />
        )
      )}
    </svg>
  );
}

export default function RaftersPage() {
  return (
    <main
      style={{
        maxWidth: 1500,
        margin: "auto",
        padding: "20px 14px 40px",
      }}
    >
      <section
        style={{
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          borderRadius: 20,
          background: "#09130f",
          border: "1px solid #31483b",
          boxShadow: "0 20px 50px #0003",
          color: "#f5f7f5",
          minHeight: 650,
          padding: "85px 24px 35px",
        }}
      >
        <StadiumBackdrop />

        <div
          style={{
            position: "relative",
            textAlign: "center",
            marginBottom: 45,
          }}
        >
          <div
            style={{
              color: "#48d6a8",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 5,
            }}
          >
            THE BOYS • EST. 2020
          </div>

          <h1
            style={{
              fontSize:
                "clamp(42px, 7vw, 96px)",
              lineHeight: 0.95,
              margin: "16px 0",
              textShadow: "0 5px 18px #000a",
            }}
          >
            CHAMPIONSHIP
            <br />
            RAFTERS
          </h1>

          <p
            style={{
              color: "#b4ead9",
              fontSize: 14,
              letterSpacing: 1,
              lineHeight: 1.6,
            }}
          >
            Legends are made on Sundays.
            <br />
            Championships live forever.
          </p>
        </div>

        <div
          style={{
            position: "relative",
            borderTop:
              "8px solid #67766d",
            boxShadow:
              "0 -3px 0 #293b31, 0 5px 8px #0008",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 185px), 1fr))",
            justifyItems: "center",
            alignItems: "start",
            gap: "28px 20px",
            padding: "0 8px 30px",
          }}
        >
          {championships.map(championship => (
            <ChampionshipBanner
              key={championship.year}
              championship={championship}
            />
          ))}
        </div>

        <div
          style={{
            position: "relative",
            textAlign: "center",
            borderTop:
              "1px solid #b4ead933",
            paddingTop: 25,
            marginTop: 25,
          }}
        >
          <div
            style={{
              color: "#e3c77d",
              fontSize: 22,
              letterSpacing: 10,
            }}
          >
            ★ ★ ★
          </div>

          <h2
            style={{
              marginTop: 10,
              color: "#b4ead9",
              letterSpacing: 3,
            }}
          >
            IMMORTALIZED IN THE RAFTERS
          </h2>

          <p
            style={{
              fontSize: 12,
              color: "#a9bcb1",
              lineHeight: 1.7,
            }}
          >
            Every season. Every champion.
            Every legacy.
            <br />
            Championship names will be
            displayed once officially verified.
          </p>
        </div>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link href="/" className="button">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
