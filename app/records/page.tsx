
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

type ManagerStats = {
  name: string;
  regularWins: number;
  regularLosses: number;
  regularTies: number;
  playoffWins: number;
  playoffLosses: number;
  playoffTies: number;
  pointsFor: number;
  pointsAgainst: number;
  longestWinStreak: number;
  longestLossStreak: number;
  championships: number;
  finals: number;
  playoffAppearances: number;
  seasons: number;
};

const managerNames = [
  "Tyler Laird",
  "Caleb Burnham",
  "Lane Lehman",
  "Braden Riley",
  "Tyler Gay",
  "Hunter Crownover",
  "Hunter Kovick",
  "Kyler Landa",
  "Cade Burnham",
  "Cody Carpenter",
];

// Verified manager statistics will be added after import.
const managerStats: ManagerStats[] = [];

type Championship = {
  year: number;
  champion: string;
  runnerUp: string;
  championScore: number;
  runnerUpScore: number;
};

const championshipHistory: Championship[] = [];

const recordCategories = [
  {
    id: "wins",
    icon: "🏆",
    title: "All-Time Wins",
    description: "The winningest managers in league history.",
    columns: ["RANK", "MANAGER", "W-L-T", "WIN %"],
    spotlight: "ALL-TIME WINS LEADER",
    records: [
      "Most Career Wins",
      "Most Wins in a Season",
      "Highest Career Win Percentage",
      "Most Consecutive Winning Seasons",
      "Best Single-Season Record",
    ],
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
      "Top 25 Highest Weekly Scores",
      "Top 25 Lowest Weekly Scores",
      "Most Points in a Season",
      "Highest Points Per Game",
      "Highest Playoff Week Score",
      "Highest Championship Game Score",
    ],
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
      "Top 25 Biggest Blowouts",
      "Top 25 Closest Games",
      "Biggest Playoff Blowout",
      "Closest Playoff Matchup",
      "Biggest Championship Blowout",
      "Closest Championship Game",
    ],
  },
];

const thStyle: React.CSSProperties = {
  padding: "14px 12px",
  fontSize: 11,
  fontWeight: 800,
  color: "#52665a",
  background: "#edf5f0",
  textAlign: "left",
  whiteSpace: "nowrap",
  borderBottom: "1px solid #dce7df",
};

const tdStyle: React.CSSProperties = {
  padding: "14px 12px",
  fontSize: 13,
  whiteSpace: "nowrap",
  borderBottom: "1px solid #e2e9e4",
};

const darkStyle: React.CSSProperties = {
  background: "#14251f",
  color: "#ffffff",
  padding: 24,
  borderRadius: 16,
};

function formatPoints(value: number) {
  return value.toFixed(2);
}

function winPercent(w: number, l: number, t: number) {
  const games = w + l + t;
  return games
    ? (((w + t / 2) / games) * 100).toFixed(1) + "%"
    : "—";
}

function lifetimeWins(manager: ManagerStats) {
  return manager.regularWins + manager.playoffWins;
}

function lifetimeLosses(manager: ManagerStats) {
  return manager.regularLosses + manager.playoffLosses;
}

function lifetimeTies(manager: ManagerStats) {
  return manager.regularTies + manager.playoffTies;
}

function record(w: number, l: number, t: number) {
  return `${w}-${l}-${t}`;
}

function Table({
  headings,
  children,
  minWidth = 550,
}: {
  headings: string[];
  children: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table
        style={{
          width: "100%",
          minWidth,
          borderCollapse: "collapse",
          textAlign: "left",
        }}
      >
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading} style={thStyle}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function EmptyRow({
  columns,
  message = "Awaiting verified historical Yahoo league data.",
}: {
  columns: number;
  message?: string;
}) {
  return (
    <tr>
      <td
        colSpan={columns}
        style={{
          padding: 35,
          color: "#68736d",
          textAlign: "center",
          fontSize: 13,
        }}
      >
        {message}
      </td>
    </tr>
  );
}

function PlayerLeaderboards() {
  const [position, setPosition] = useState<Position>("QB");

  const rankings = [...playerSeasons[position]]
    .sort((a, b) => b.points - a.points)
    .slice(0, 25);

  return (
    <section
      style={{
        ...darkStyle,
        marginTop: 28,
        marginBottom: 30,
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
        Top 25 individual player seasons at each position,
        including regular-season and fantasy playoff points.
      </p>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          margin: "22px 0",
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
              border: "1px solid #476055",
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
          color: "#14251f",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ padding: 20 }}>
          <div className="label">
            HISTORICAL PLAYER LEADERBOARD
          </div>
          <h3 style={{ marginTop: 6 }}>
            TOP 25 {position} SEASONS
          </h3>
        </div>

        <Table
          headings={[
            "RANK",
            "PLAYER",
            "YEAR",
            "FANTASY TEAM / OWNER",
            "POINTS",
          ]}
        >
          {rankings.length === 0 ? (
            <EmptyRow
              columns={5}
              message={`${position} historical seasons awaiting import.`}
            />
          ) : (
            rankings.map((season, index) => (
              <tr
                key={`${season.player}-${season.year}-${index}`}
              >
                <td style={tdStyle}>#{index + 1}</td>
                <td style={tdStyle}>{season.player}</td>
                <td style={tdStyle}>{season.year}</td>
                <td style={tdStyle}>
                  <strong>{season.team}</strong>
                  <div style={{ color: "#68736d" }}>
                    {season.owner}
                  </div>
                </td>
                <td style={tdStyle}>
                  {formatPoints(season.points)}
                </td>
              </tr>
            ))
          )}
        </Table>

        <p
          style={{
            color: "#68736d",
            padding: "0 20px 12px",
            fontSize: 12,
          }}
        >
          Showing {rankings.length} of 25 possible seasons
        </p>
      </div>
    </section>
  );
}

function ManagerHistory() {
  const statsByName = new Map(
    managerStats.map((manager) => [
      manager.name,
      manager,
    ])
  );

  const sortedNames = [...managerNames].sort((a, b) => {
    const first = statsByName.get(a);
    const second = statsByName.get(b);

    if (!first && !second) return 0;
    if (!first) return 1;
    if (!second) return -1;

    return lifetimeWins(second) - lifetimeWins(first);
  });

  const headings = [
    "MANAGER",
    "SEASONS",
    "LIFETIME W-L-T",
    "WIN %",
    "REG. W-L-T",
    "PLAYOFF W-L-T",
    "PLAYOFF WINS",
    "POINTS FOR",
    "POINTS AGAINST",
    "POINT DIFF.",
    "WIN STREAK",
    "LOSS STREAK",
    "TITLES",
    "FINALS",
    "PLAYOFF APPS.",
  ];

  const championshipRecords = [
    "Most Championships",
    "Most Championship Appearances",
    "Most Runner-Up Finishes",
    "Most Playoff Appearances",
    "Most Playoff Wins",
    "Best Playoff Win Percentage",
    "Back-to-Back Championships",
    "Longest Championship Drought",
  ];

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e2e9e4",
        borderRadius: 16,
        overflow: "hidden",
        marginTop: 24,
      }}
    >
      <div style={darkStyle}>
        <div
          style={{
            color: "#48d6a8",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          THE BOYS LEAGUE • EST. 2020
        </div>

        <h2 style={{ fontSize: 38, marginTop: 10 }}>
          MANAGER HISTORY & CHAMPIONSHIP LEGACY
        </h2>

        <p style={{ color: "#c5d4cd", lineHeight: 1.6 }}>
          Every active manager. Every win. Every point.
          Every championship. Career records include
          regular-season and playoff games.
        </p>
      </div>

      <div style={{ padding: 20 }}>
        <div className="label">
          THE ALL-TIME CAREER LEADERBOARD
        </div>

        <h3 style={{ marginTop: 8, marginBottom: 12 }}>
          MANAGER CAREER STATISTICS
        </h3>

        <p
          style={{
            color: "#68736d",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          All 10 active managers are displayed below.
          Once data is imported, rankings will be ordered
          by combined lifetime wins, including playoffs.
          Scroll horizontally to view every statistic.
        </p>

        <Table headings={headings} minWidth={1800}>
          {sortedNames.map((name) => {
            const manager = statsByName.get(name);

            if (!manager) {
              return (
                <tr key={name}>
                  <td style={{ ...tdStyle, fontWeight: 800 }}>
                    {name}
                  </td>
                  {headings.slice(1).map((heading) => (
                    <td key={heading} style={tdStyle}>
                      —
                    </td>
                  ))}
                </tr>
              );
            }

            const wins = lifetimeWins(manager);
            const losses = lifetimeLosses(manager);
            const ties = lifetimeTies(manager);

            const values = [
              manager.seasons,
              record(wins, losses, ties),
              winPercent(wins, losses, ties),
              record(
                manager.regularWins,
                manager.regularLosses,
                manager.regularTies
              ),
              record(
                manager.playoffWins,
                manager.playoffLosses,
                manager.playoffTies
              ),
              manager.playoffWins,
              formatPoints(manager.pointsFor),
              formatPoints(manager.pointsAgainst),
              formatPoints(
                manager.pointsFor - manager.pointsAgainst
              ),
              manager.longestWinStreak,
              manager.longestLossStreak,
              manager.championships,
              manager.finals,
              manager.playoffAppearances,
            ];

            return (
              <tr key={name}>
                <td style={{ ...tdStyle, fontWeight: 800 }}>
                  {name}
                </td>
                {values.map((value, index) => (
                  <td key={index} style={tdStyle}>
                    {value}
                  </td>
                ))}
              </tr>
            );
          })}
        </Table>

        <p
          style={{
            color: "#68736d",
            fontSize: 12,
            lineHeight: 1.7,
            marginTop: 15,
          }}
        >
          Lifetime records and scoring include playoff
          games. Winning and losing streaks include
          playoffs but reset each season. Former managers
          are excluded from these rankings, while games
          against them still count toward active managers'
          statistics.
        </p>

        <h3 style={{ marginTop: 34, marginBottom: 15 }}>
          CHAMPIONSHIP RECORDS
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: 12,
          }}
        >
          {championshipRecords.map((item) => (
            <div
              key={item}
              style={{
                background: "#f4f8f5",
                border: "1px solid #e2e9e4",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <strong style={{ fontSize: 12 }}>
                {item}
              </strong>
              <p
                style={{
                  fontSize: 12,
                  color: "#68736d",
                }}
              >
                Awaiting historical data
              </p>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: 34, marginBottom: 15 }}>
          YEAR-BY-YEAR CHAMPIONSHIP HISTORY
        </h3>

        <Table
          headings={[
            "SEASON",
            "CHAMPION",
            "RUNNER-UP",
            "FINAL SCORE",
          ]}
        >
          {championshipHistory.length === 0 ? (
            <EmptyRow
              columns={4}
              message="Championship results from 2020 onward are awaiting import."
            />
          ) : (
            [...championshipHistory]
              .sort((a, b) => b.year - a.year)
              .map((game) => (
                <tr key={game.year}>
                  <td style={tdStyle}>{game.year}</td>
                  <td style={tdStyle}>
                    🏆 {game.champion}
                  </td>
                  <td style={tdStyle}>{game.runnerUp}</td>
                  <td style={tdStyle}>
                    {formatPoints(game.championScore)} -{" "}
                    {formatPoints(game.runnerUpScore)}
                  </td>
                </tr>
              ))
          )}
        </Table>
      </div>
    </section>
  );
}

function OtherRecords() {
  return (
    <div
      style={{
        display: "grid",
        gap: 18,
        marginTop: 24,
      }}
    >
      {recordCategories.map((category) => (
        <details
          key={category.id}
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
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 28,
                    marginBottom: 8,
                  }}
                >
                  {category.icon}
                </div>

                <h3>{category.title}</h3>

                <p className="muted">
                  {category.description}
                </p>
              </div>

              <span className="pill">OPEN ▾</span>
            </div>
          </summary>

          <div
            style={{
              padding: 20,
              borderTop: "1px solid #e2e9e4",
            }}
          >
            <div
              style={{
                ...darkStyle,
                textAlign: "center",
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  color: "#e9c875",
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                👑 RECORD HOLDER SPOTLIGHT
              </div>

              <h3 style={{ marginTop: 12 }}>
                {category.spotlight}
              </h3>

              <p style={{ color: "#c5d4cd" }}>
                Awaiting verified historical results
              </p>
            </div>

            <h3 style={{ marginBottom: 14 }}>
              HISTORICAL LEADERBOARD
            </h3>

            <Table headings={category.columns}>
              <EmptyRow columns={category.columns.length} />
            </Table>

            <h3 style={{ marginTop: 28, marginBottom: 14 }}>
              ADDITIONAL RECORDS
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
                gap: 12,
              }}
            >
              {category.records.map((item) => (
                <div
                  key={item}
                  style={{
                    background: "#f4f8f5",
                    padding: 16,
                    borderRadius: 12,
                    border: "1px solid #e2e9e4",
                  }}
                >
                  <strong style={{ fontSize: 12 }}>
                    {item}
                  </strong>

                  <p
                    style={{
                      fontSize: 12,
                      color: "#68736d",
                    }}
                  >
                    Awaiting historical data
                  </p>
                </div>
              ))}
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

export default function RecordsPage() {
  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • EST. 2020
      </div>

      <h1>THE RECORD BOOK</h1>

      <p className="muted">
        The greatest performances, all-time manager
        careers, legendary records, and championship
        history in The Boys League.
      </p>

      <PlayerLeaderboards />

      <section style={{ marginTop: 35 }}>
        <div className="label">
          THE HISTORY BOOKS
        </div>

        <h2 style={{ marginTop: 8 }}>
          ALL-TIME LEAGUE RECORDS
        </h2>

        <p className="muted">
          Career leaderboards, historic weekly
          performances, blowouts, and championships.
        </p>

        <ManagerHistory />

        <OtherRecords />
      </section>

      <div style={{ marginTop: 28 }}>
        <Link href="/" className="button">
          🏠 Home / League HQ
        </Link>
      </div>
    </main>
  );
}
