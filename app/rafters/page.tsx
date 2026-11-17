
import Link from "next/link";

const championships = [
  { year: 2020, color: "#812e36", trim: "#e6c577" },
  { year: 2021, color: "#173e68", trim: "#d6dce6" },
  { year: 2022, color: "#205b46", trim: "#e9c875" },
  { year: 2023, color: "#4d326e", trim: "#e0c18a" },
  { year: 2024, color: "#9b4928", trim: "#f3d79a" },
  { year: 2025, color: "#244d60", trim: "#d5e5e8" },
  { year: 2026, color: "#403b45", trim: "#e4bd65" },
];

export default function RaftersPage() {
  return (
    <main className="shell">
      <div className="kicker">THE BOYS • EST. 2020</div>

      <h1>CHAMPIONSHIP RAFTERS</h1>

      <p className="muted">
        Legends are made on Sundays. Championships live forever.
        Every season. Every champion. Immortalized in the rafters.
      </p>

      <section
        style={{
          marginTop: 30,
          padding: "45px 18px",
          borderRadius: 20,
          background:
            "linear-gradient(180deg, #0c151b, #1a2830 65%, #101a20)",
          border: "1px solid #34434b",
        }}
      >
        <p
          style={{
            color: "#aab8be",
            textAlign: "center",
            fontSize: 12,
            letterSpacing: 3,
            fontWeight: 800,
            marginBottom: 30,
          }}
        >
          THE BOYS LEAGUE • HALL OF CHAMPIONS
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 165px), 1fr))",
            gap: 20,
            justifyItems: "center",
          }}
        >
          {championships.map((champ) => (
            <div
              key={champ.year}
              style={{
                width: "100%",
                maxWidth: 210,
                filter: "drop-shadow(0 10px 10px #0008)",
              }}
            >
              <svg
                viewBox="0 0 160 280"
                width="100%"
                role="img"
                aria-label={`${champ.year} championship banner, champion pending`}
              >
                <path
                  d="M20 8 H140 V228 L80 270 L20 228 Z"
                  fill={champ.color}
                  stroke={champ.trim}
                  strokeWidth="5"
                />

                <path
                  d="M28 16 H132 V224 L80 258 L28 224 Z"
                  fill="none"
                  stroke={champ.trim}
                  strokeWidth="1.5"
                />

                <path
                  d="M20 49 H140 M20 204 H140"
                  stroke={champ.trim}
                  strokeWidth="2"
                />

                <text
                  x="80"
                  y="35"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={champ.trim}
                >
                  THE BOYS
                </text>

                <text
                  x="80"
                  y="68"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#ffffff"
                >
                  CHAMPIONS
                </text>

                <text
                  x="80"
                  y="116"
                  textAnchor="middle"
                  fontSize="30"
                  fontWeight="900"
                  fill="#ffffff"
                >
                  {champ.year}
                </text>

                <path
                  d="M57 134 H103"
                  stroke={champ.trim}
                  strokeWidth="2"
                />

                <text
                  x="80"
                  y="160"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#ffffff"
                >
                  TEAM PENDING
                </text>

                <text
                  x="80"
                  y="181"
                  textAnchor="middle"
                  fontSize="9"
                  fill={champ.trim}
                >
                  OWNER PENDING
                </text>

                <text
                  x="80"
                  y="221"
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill={champ.trim}
                >
                  ★ ★ ★
                </text>
              </svg>
            </div>
          ))}
        </div>

        <p
          style={{
            color: "#aab8be",
            textAlign: "center",
            fontSize: 12,
            marginTop: 30,
          }}
        >
          Championship team names and owners will be added
          when historical results are confirmed.
        </p>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link href="/" className="button">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
