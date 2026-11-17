
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
    icon: "🏆",
    title: "All-Time Wins",
    description: "Winningest managers in league history",
  },
  {
    icon: "🔥",
    title: "Highest Weekly Score",
    description: "Biggest single-week fantasy performances",
  },
  {
    icon: "💀",
    title: "Biggest Blowout",
    description: "Most lopsided matchups of all time",
  },
  {
    icon: "👑",
    title: "Championship Records",
    description: "Titles, appearances, and playoff success",
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
        The greatest performances, historic seasons, and
        most legendary records in The Boys League history.
      </p>

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
              padding: "20px",
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
                      <td style={{ padding: 14, fontWeight: 800 }}>
                        #{index + 1}
                      </td>
                      <td style={{ padding: 14, fontWeight: 700 }}>
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

      <section style={{ marginTop: 35 }}>
        <div className="label">THE HISTORY BOOKS</div>
        <h2 style={{ marginTop: 8 }}>
          ALL-TIME LEAGUE RECORDS
        </h2>

        <div className="grid">
          {recordCategories.map((record) => (
            <div className="card span6" key={record.title}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>
                {record.icon}
              </div>

              <h3>{record.title}</h3>

              <p className="muted">
                {record.description}
              </p>

              <span className="pill">
                AWAITING HISTORICAL DATA
              </span>
            </div>
          ))}
        </div>
      </section>

      <div style={{ marginTop: 24 }}>
        <Link href="/" className="button">
          🏠 Home / League HQ
        </Link>
      </div>
    </main>
  );
}
