
"use client";

import Link from "next/link";
import { useState } from "react";

const positions = ["QB", "RB", "WR", "TE", "K", "DEF"] as const;

type Position = (typeof positions)[number];

type PlayerSeason = {
  player: string;
  year: number;
  team: string;
  owner: string;
  points: number;
};

const playerSeasons: Record<Position, PlayerSeason[]> = {
  QB: [],
  RB: [],
  WR: [],
  TE: [],
  K: [],
  DEF: [],
};

const recordCategories = [
  {
    id: "wins",
    icon: "🏆",
    title: "All-Time Wins",
    description: "The winningest managers in league history.",
    columns: ["RANK", "MANAGER", "W-L-T", "WIN %"],
    spotlight: "ALL-TIME WINS LEADER",
    records: [
      "Career regular-season wins",
      "Career playoff wins",
      "Career win percentage",
      "Most wins in a single season",
      "Longest winning streak",
      "Most consecutive playoff appearances",
    ],
    limit: "All managers",
  },
  {
    id: "scores",
    icon: "🔥",
    title: "Highest Weekly Score",
    description: "The greatest weekly scoring performances.",
    columns: [
      "RANK",
      "TEAM / OWNER",
      "SEASON / WEEK",
      "POINTS",
    ],
    spotlight: "HIGHEST WEEKLY SCORE",
    records: [
      "Top 25 highest weekly scores",
      "Top 25 lowest weekly scores",
      "Most points in a single season",
      "Highest average points per game",
      "Highest playoff week score",
      "Most points in a championship matchup",
    ],
    limit: "Top 25",
  },
  {
    id: "blowouts",
    icon: "💀",
    title: "Biggest Blowout",
    description: "The most brutal beatdowns in league history.",
    columns: [
      "RANK",
      "WINNER / LOSER",
      "FINAL SCORE",
      "MARGIN",
    ],
    spotlight: "BIGGEST MARGIN OF VICTORY",
    records: [
      "Top 25 biggest blowouts",
      "Top 25 closest games",
      "Biggest playoff blowout",
      "Closest playoff matchup",
      "Biggest championship blowout",
      "Largest winning margin in a season",
    ],
    limit: "Top 25",
  },
  {
    id: "championships",
    icon: "👑",
    title: "Championship Records",
    description: "Champions, contenders, and playoff legends.",
    columns: [
      "RANK",
      "MANAGER",
      "TITLES",
      "APPEARANCES",
    ],
    spotlight: "ALL-TIME CHAMPIONSHIP LEADER",
    records: [
      "Most league championships",
      "Most championship appearances",
      "Most runner-up finishes",
      "Most playoff appearances",
      "Career playoff win percentage",
      "Longest championship drought",
      "Year-by-year championship results",
    ],
    limit: "Full history",
  },
];

export default function RecordsPage() {
  const [position, setPosition] = useState<Position>("QB");

  const rankings = [...playerSeasons[position]]
    .sort((a, b) => b.points - a.points)
    .slice(0, 25);

  return (
    <main className="shell">
      <div className="kicker">THE BOYS • EST. 2020</div>

      <h1>THE RECORD BOOK</h1>

      <p className="muted">
        The greatest performances, historic seasons,
        and most legendary records in The Boys League history.
      </p>

      {/* TOP 25 PLAYER SEASONS */}

      <section
        style={{
          background: "#14251f",
          color: "#ffffff",
          borderRadius: 18,
          padding: 24,
          marginTop: 28,
          marginBottom: 28,
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
          THE BOYS LEAGUE • HALL OF FAME
        </div>

        <h2 style={{ fontSize: 42, marginTop: 12 }}>
          ALL-TIME BEST PLAYER SEASONS
        </h2>

        <p style={{ color: "#c5d4cd", lineHeight: 1.6 }}>
          The 25 highest-scoring individual player seasons
          at every position, ranked by total fantasy points
          across the regular season and fantasy playoffs.
        </p>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 22,
            marginBottom: 22,
          }}
        >
          {positions.map((pos) => (
            <button
              key={pos}
              type="button"
              onClick={() => setPosition(pos)}
              aria-pressed={position === pos}
              style={{
                padding: "12px 19px",
                borderRadius: 9,
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 14,
                border:
                  position === pos
                    ? "1px solid #48d6a8"
                    : "1px solid #476055",
                background:
                  position === pos ? "#48d6a8" : "#263d32",
                color:
                  position === pos ? "#10251c" : "#ffffff",
              }}
            >
              {pos}
            </button>
          ))}
        </div>

        <div
          style={{
            background: "#ffffff",
            color: "#101512",
            borderRadius: 14,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: 20,
              background: "#edf5f0",
              borderBottom: "1px solid #dce7df",
            }}
          >
            <div className="label">
              HISTORICAL PLAYER LEADERBOARD
            </div>

            <h3 style={{ marginTop: 6 }}>
              TOP 25 {position} SEASONS
            </h3>

            <p
              style={{
                fontSize: 12,
                color: "#68736d",
                marginBottom: 0,
              }}
            >
              Regular season + fantasy playoffs • 2020–2026
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                minWidth: 540,
              }}
            >
              <thead>
                <tr style={{ background: "#f5f7f5" }}>
                  {[
                    "RANK",
                    "PLAYER",
                    "YEAR",
                    "FANTASY TEAM / OWNER",
                    "POINTS",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "15px 12px",
                        fontSize: 11,
                        color: "#68736d",
                        letterSpacing: 1,
                        borderBottom: "1px solid #e2e9e4",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {rankings.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "42px 20px",
                        textAlign: "center",
                        color: "#68736d",
                        lineHeight: 1.8,
                      }}
                    >
                      <div style={{ fontSize: 30 }}>🏆</div>

                      <strong>
                        {position} records awaiting import
                      </strong>

                      <div>
                        Historical player scores will appear
                        here once verified Yahoo league data
                        is available.
                      </div>
                    </td>
                  </tr>
                ) : (
                  rankings.map((season, index) => (
                    <tr
                      key={`${season.player}-${season.year}-${index}`}
                      style={{
                        borderBottom: "1px solid #e2e9e4",
                      }}
                    >
                      <td
                        style={{
                          padding: 14,
                          fontWeight: 800,
                        }}
                      >
                        #{index + 1}
                      </td>

                      <td
                        style={{
                          padding: 14,
                          fontWeight: 700,
                        }}
                      >
                        {season.player}
                      </td>

                      <td style={{ padding: 14 }}>
                        {season.year}
                      </td>

                      <td style={{ padding: 14 }}>
                        <strong>{season.team}</strong>

                        <div
                          style={{
                            fontSize: 12,
                            color: "#68736d",
                          }}
                        >
                          {season.owner}
                        </div>
                      </td>

                      <td
                        style={{
                          padding: 14,
                          fontWeight: 800,
                          color: "#159c73",
                        }}
                      >
                        {season.points.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              padding: "14px 20px",
              borderTop: "1px solid #e2e9e4",
              color: "#68736d",
              fontSize: 12,
            }}
          >
            Showing {rankings.length} of 25 possible
            historical {position} seasons
          </div>
        </div>
      </section>

      {/* ALL-TIME LEAGUE RECORDS */}

      <section style={{ marginTop: 35 }}>
        <div className="label">THE HISTORY BOOKS</div>

        <h2 style={{ marginTop: 8, marginBottom: 12 }}>
          ALL-TIME LEAGUE RECORDS
        </h2>

        <p className="muted">
          Explore the greatest achievements, worst defeats,
          and most legendary managers in league history.
          Select any category to open its record book.
        </p>

        <div
          style={{
            display: "grid",
            gap: 18,
            marginTop: 24,
          }}
        >
          {recordCategories.map((record) => (
            <details
              key={record.id}
              style={{
                background: "#ffffff",
                border: "1px solid #e2e9e4",
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              <summary
                style={{
                  padding: 22,
                  cursor: "pointer",
                  listStyle: "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 30,
                        marginBottom: 8,
                      }}
                    >
                      {record.icon}
                    </div>

                    <h3>{record.title}</h3>

                    <p
                      className="muted"
                      style={{ marginBottom: 10 }}
                    >
                      {record.description}
                    </p>

                    <span
                      style={{
                        fontSize: 11,
                        color: "#159c73",
                        fontWeight: 800,
                        letterSpacing: 1,
                      }}
                    >
                      {record.limit.toUpperCase()} LEADERBOARD
                    </span>
                  </div>

                  <span
                    style={{
                      background: "#14251f",
                      color: "#48d6a8",
                      padding: "10px 14px",
                      borderRadius: 10,
                      fontWeight: 800,
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    VIEW RECORDS ▾
                  </span>
                </div>
              </summary>

              <div
                style={{
                  padding: 22,
                  borderTop: "1px solid #e2e9e4",
                }}
              >
                {/* RECORD HOLDER SPOTLIGHT */}

                <div
                  style={{
                    background: "#14251f",
                    color: "#ffffff",
                    borderRadius: 14,
                    padding: 24,
                    marginBottom: 24,
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#e9c875",
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: 2,
                    }}
                  >
                    👑 RECORD HOLDER SPOTLIGHT
                  </div>

                  <h3 style={{ marginTop: 12 }}>
                    {record.spotlight}
                  </h3>

                  <div
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      color: "#48d6a8",
                      marginTop: 16,
                    }}
                  >
                    —
                  </div>

                  <p
                    style={{
                      color: "#c5d4cd",
                      fontSize: 13,
                    }}
                  >
                    Awaiting verified historical results
                  </p>
                </div>

                {/* HISTORICAL LEADERBOARD */}

                <h3 style={{ marginBottom: 15 }}>
                  HISTORICAL LEADERBOARD
                </h3>

                <div style={{ overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      minWidth: 480,
                      borderCollapse: "collapse",
                      textAlign: "left",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#edf5f0",
                        }}
                      >
                        {record.columns.map((column) => (
                          <th
                            key={column}
                            style={{
                              padding: 14,
                              fontSize: 11,
                              color: "#68736d",
                              letterSpacing: 1,
                            }}
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td
                          colSpan={record.columns.length}
                          style={{
                            padding: "35px 15px",
                            textAlign: "center",
                            color: "#68736d",
                            fontSize: 14,
                          }}
                        >
                          Historical rankings will appear
                          after league data is imported.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* ADDITIONAL RECORDS */}

                <h3
                  style={{
                    marginTop: 28,
                    marginBottom: 15,
                  }}
                >
                  ADDITIONAL RECORDS
                </h3>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                    gap: 12,
                  }}
                >
                  {record.records.map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: 16,
                        background: "#f4f8f5",
                        borderRadius: 12,
                        border: "1px solid #e2e9e4",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 800,
                          marginBottom: 8,
                        }}
                      >
                        {item}
                      </div>

                      <div
                        style={{
                          color: "#68736d",
                          fontSize: 12,
                        }}
                      >
                        Awaiting historical data
                      </div>
                    </div>
                  ))}
                </div>

                <p
                  style={{
                    marginTop: 22,
                    color: "#68736d",
                    fontSize: 12,
                  }}
                >
                  Records will be calculated using verified
                  league history from 2020 onward.
                </p>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* HOME BUTTON */}

      <div style={{ marginTop: 24 }}>
        <Link href="/" className="button">
          🏠 Home / League HQ
        </Link>
      </div>
    </main>
  );
}
