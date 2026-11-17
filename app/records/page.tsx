
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

type Manager = {
  name: string;
  seasons: number;
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
};

const managers: Manager[] = [];

type Championship = {
  year: number;
  champion: string;
  runnerUp: string;
  championScore: number;
  runnerUpScore: number;
};

const championshipHistory: Championship[] = [];

const legacyTabs = [
  { id: "career", label: "Career Records" },
  { id: "scoring", label: "Scoring" },
  { id: "streaks", label: "Streaks" },
  { id: "championships", label: "Championships" },
] as const;

type LegacyTab = (typeof legacyTabs)[number]["id"];

const recordCategories = [
  {
    id: "wins",
    icon: "🏆",
    title: "All-Time Wins",
    description: "The winningest managers in league history.",
    columns: ["RANK", "MANAGER", "W-L-T", "WIN %"],
    spotlight: "ALL-TIME WINS LEADER",
    records: [
      "Most career wins",
      "Most wins in a season",
      "Highest career win percentage",
      "Most consecutive winning seasons",
      "Most undefeated weeks",
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
      "Top 25 highest weekly scores",
      "Top 25 lowest weekly scores",
      "Most points in a season",
      "Highest points-per-game average",
      "Highest playoff week score",
      "Highest championship game score",
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
      "Top 25 biggest blowouts",
      "Top 25 closest games",
      "Biggest playoff blowout",
      "Closest playoff matchup",
      "Biggest championship blowout",
      "Closest championship game",
    ],
  },
];

const panelStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e9e4",
  borderRadius: 16,
  overflow: "hidden",
};

const darkStyle: React.CSSProperties = {
  background: "#14251f",
  color: "#ffffff",
  borderRadius: 14,
  padding: 24,
};

const cellStyle: React.CSSProperties = {
  padding: "14px 12px",
  borderBottom: "1px solid #e2e9e4",
  whiteSpace: "nowrap",
  fontSize: 13,
};

const mutedStyle: React.CSSProperties = {
  color: "#68736d",
  fontSize: 13,
};

function Placeholder({
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
          padding: "35px 18px",
          textAlign: "center",
          color: "#68736d",
          lineHeight: 1.7,
        }}
      >
        🏈 {message}
      </td>
    </tr>
  );
}

function DataTable({
  headings,
  children,
}: {
  headings: string[];
  children: React.ReactNode;
}) {
  return (
    <div style={{ overflowX: "auto", width: "100%" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          textAlign: "left",
          minWidth: 520,
        }}
      >
        <thead>
          <tr style={{ background: "#edf5f0" }}>
            {headings.map((heading) => (
              <th
                key={heading}
                style={{
                  ...cellStyle,
                  fontSize: 11,
                  color: "#52665a",
                  letterSpacing: 0.5,
                }}
              >
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

function percent(wins: number, losses: number, ties = 0) {
  const total = wins + losses + ties;
  return total
    ? (((wins + ties / 2) / total) * 100).toFixed(1) + "%"
    : "—";
}

function points(value: number) {
  return value.toFixed(2);
}

function lifetimeRecord(manager: Manager) {
  return [
    manager.regularWins + manager.playoffWins,
    manager.regularLosses + manager.playoffLosses,
    manager.regularTies + manager.playoffTies,
  ].join("-");
}

function legacyRanking(tab: LegacyTab) {
  const list = [...managers];

  if (tab === "career") {
    return list.sort(
      (a, b) =>
        b.regularWins +
        b.playoffWins -
        (a.regularWins + a.playoffWins)
    );
  }

  if (tab === "scoring") {
    return list.sort((a, b) => b.pointsFor - a.pointsFor);
  }

  if (tab === "streaks") {
    return list.sort(
      (a, b) => b.longestWinStreak - a.longestWinStreak
    );
  }

  return list.sort(
    (a, b) =>
      b.championships - a.championships ||
      b.finals - a.finals ||
      b.playoffWins - a.playoffWins
  );
}

function LegacyTable({ tab }: { tab: LegacyTab }) {
  const ranked = legacyRanking(tab);

  const headings: Record<LegacyTab, string[]> = {
    career: [
      "#",
      "MANAGER",
      "SEASONS",
      "LIFETIME W-L-T",
      "REG. W-L-T",
      "PLAYOFF W-L-T",
      "WIN %",
    ],
    scoring: [
      "#",
      "MANAGER",
      "POINTS FOR",
      "POINTS AGAINST",
      "DIFFERENTIAL",
      "AVG. PPG",
    ],
    streaks: [
      "#",
      "MANAGER",
      "LONGEST WIN STREAK",
      "LONGEST LOSING STREAK",
    ],
    championships: [
      "#",
      "MANAGER",
      "TITLES",
      "FINALS",
      "RUNNER-UP",
      "PLAYOFF APPS.",
      "PLAYOFF WINS",
      "PLAYOFF WIN %",
    ],
  };

  return (
    <DataTable headings={headings[tab]}>
      {ranked.length === 0 ? (
        <Placeholder
          columns={headings[tab].length}
          message="Manager rankings will appear once verified season and playoff results are imported."
        />
      ) : (
        ranked.map((manager, index) => {
          const totalWins =
            manager.regularWins + manager.playoffWins;
          const totalLosses =
            manager.regularLosses + manager.playoffLosses;
          const totalTies =
            manager.regularTies + manager.playoffTies;
          const games = totalWins + totalLosses + totalTies;

          let values: (string | number)[];

          if (tab === "career") {
            values = [
              index + 1,
              manager.name,
              manager.seasons,
              lifetimeRecord(manager),
              [
                manager.regularWins,
                manager.regularLosses,
                manager.regularTies,
              ].join("-"),
              [
                manager.playoffWins,
                manager.playoffLosses,
                manager.playoffTies,
              ].join("-"),
              percent(totalWins, totalLosses, totalTies),
            ];
          } else if (tab === "scoring") {
            values = [
              index + 1,
              manager.name,
              points(manager.pointsFor),
              points(manager.pointsAgainst),
              points(manager.pointsFor - manager.pointsAgainst),
              games ? points(manager.pointsFor / games) : "—",
            ];
          } else if (tab === "streaks") {
            values = [
              index + 1,
              manager.name,
              manager.longestWinStreak,
              manager.longestLossStreak,
            ];
          } else {
            values = [
              index + 1,
              manager.name,
              manager.championships,
              manager.finals,
              manager.finals - manager.championships,
              manager.playoffAppearances,
              manager.playoffWins,
              percent(
                manager.playoffWins,
                manager.playoffLosses,
                manager.playoffTies
              ),
            ];
          }

          return (
            <tr key={manager.name}>
              {values.map((value, i) => (
                <td
                  key={i}
                  style={{
                    ...cellStyle,
                    fontWeight: i === 1 ? 800 : 500,
                    color: i === 1 ? "#14251f" : "#263d32",
                  }}
                >
                  {value}
                </td>
              ))}
            </tr>
          );
        })
      )}
    </DataTable>
  );
}

function ManagerLegacy() {
  const [tab, setTab] = useState<LegacyTab>("career");
  const ranked = legacyRanking("championships");
  const leader = ranked[0];

  const extraRecords: Record<LegacyTab, string[]> = {
    career: [
      "Most lifetime wins",
      "Highest combined win percentage",
      "Best regular-season record",
      "Most regular-season wins",
      "Most playoff wins",
      "Most seasons played",
    ],
    scoring: [
      "Most lifetime points scored",
      "Most lifetime points against",
      "Best career point differential",
      "Highest career points per game",
      "Most points in a single season",
      "Most playoff points scored",
    ],
    streaks: [
      "Longest winning streak",
      "Longest losing streak",
      "Most consecutive winning seasons",
      "Longest playoff winning streak",
      "Most consecutive playoff appearances",
      "Best single-season win streak",
    ],
    championships: [
      "Most championships",
      "Most championship appearances",
      "Most runner-up finishes",
      "Most playoff appearances",
      "Most playoff wins",
      "Best playoff win percentage",
      "Back-to-back championships",
      "Longest championship drought",
    ],
  };

  return (
    <details style={panelStyle}>
      <summary
        style={{
          padding: 22,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 30, marginBottom: 8 }}>
              👑
            </div>
            <h3>Manager Legacy & Championship History</h3>
            <p className="muted">
              Every manager. Every win. Every point.
              Every championship.
            </p>
            <span
              style={{
                fontSize: 11,
                color: "#159c73",
                fontWeight: 800,
              }}
            >
              COMPLETE CAREER HISTORY
            </span>
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
        <div style={darkStyle}>
          <div
            style={{
              color: "#48d6a8",
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: 2,
            }}
          >
            THE BOYS LEAGUE • LEGACY HALL
          </div>

          <h2 style={{ marginTop: 10, fontSize: 38 }}>
            MANAGER LEGACY
          </h2>

          <p style={{ color: "#c5d4cd", lineHeight: 1.6 }}>
            Career records include regular-season and playoff
            games. Lifetime scoring includes postseason points.
            Winning and losing streaks reset each season.
          </p>

          <div
            style={{
              borderTop: "1px solid #476055",
              marginTop: 20,
              paddingTop: 20,
              textAlign: "center",
            }}
          >
            <div
              style={{
                color: "#e9c875",
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 1,
              }}
            >
              👑 CHAMPIONSHIP KING
            </div>

            <div
              style={{
                color: "#48d6a8",
                fontSize: 28,
                fontWeight: 900,
                marginTop: 10,
              }}
            >
              {leader ? leader.name : "AWAITING HISTORY"}
            </div>

            <p style={{ color: "#c5d4cd" }}>
              {leader
                ? `${leader.championships} titles • ${lifetimeRecord(leader)} lifetime record • ${points(leader.pointsFor)} points`
                : "The all-time championship leader will be featured here."}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            marginTop: 24,
            marginBottom: 20,
          }}
        >
          {legacyTabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              aria-pressed={tab === item.id}
              style={{
                padding: "11px 14px",
                borderRadius: 9,
                cursor: "pointer",
                fontWeight: 800,
                fontSize: 12,
                border: "1px solid #14251f",
                background:
                  tab === item.id ? "#14251f" : "#ffffff",
                color:
                  tab === item.id ? "#48d6a8" : "#14251f",
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <h3 style={{ marginBottom: 15 }}>
          {tab === "career"
            ? "ALL-TIME MANAGER STANDINGS"
            : tab === "scoring"
            ? "ALL-TIME SCORING LEADERS"
            : tab === "streaks"
            ? "WINNING & LOSING STREAKS"
            : "CHAMPIONSHIP & PLAYOFF RECORDS"}
        </h3>

        <LegacyTable tab={tab} />

        <p style={mutedStyle}>
          {tab === "career"
            ? "Ranked by combined lifetime wins, including playoffs. Win percentage counts ties as half a win."
            : tab === "scoring"
            ? "Includes regular-season and playoff points. Average points per game uses all recorded games."
            : tab === "streaks"
            ? "Streaks include playoff games but restart at the beginning of each season."
            : "Ranked by titles, then championship appearances, then playoff wins."}
        </p>

        <h3 style={{ marginTop: 30, marginBottom: 14 }}>
          MORE MANAGER RECORDS
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
            gap: 12,
          }}
        >
          {extraRecords[tab].map((record) => (
            <div
              key={record}
              style={{
                background: "#f4f8f5",
                border: "1px solid #e2e9e4",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <strong style={{ fontSize: 12 }}>
                {record}
              </strong>
              <p style={mutedStyle}>
                Awaiting historical data
              </p>
            </div>
          ))}
        </div>

        {tab === "championships" && (
          <div style={{ marginTop: 30 }}>
            <h3 style={{ marginBottom: 14 }}>
              YEAR-BY-YEAR CHAMPIONSHIP HISTORY
            </h3>

            <DataTable
              headings={[
                "SEASON",
                "CHAMPION",
                "RUNNER-UP",
                "FINAL SCORE",
              ]}
            >
              {championshipHistory.length === 0 ? (
                <Placeholder
                  columns={4}
                  message="Championship results from 2020 onward will appear after import."
                />
              ) : (
                [...championshipHistory]
                  .sort((a, b) => b.year - a.year)
                  .map((game) => (
                    <tr key={game.year}>
                      <td style={cellStyle}>{game.year}</td>
                      <td style={cellStyle}>
                        🏆 {game.champion}
                      </td>
                      <td style={cellStyle}>
                        {game.runnerUp}
                      </td>
                      <td style={cellStyle}>
                        {points(game.championScore)} -{" "}
                        {points(game.runnerUpScore)}
                      </td>
                    </tr>
                  ))
              )}
            </DataTable>
          </div>
        )}
      </div>
    </details>
  );
}

export default function RecordsPage() {
  const [position, setPosition] = useState<Position>("QB");

  const rankings = [...playerSeasons[position]]
    .sort((a, b) => b.points - a.points)
    .slice(0, 25);

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • EST. 2020
      </div>

      <h1>THE RECORD BOOK</h1>

      <p className="muted">
        The greatest performances, historic seasons,
        legendary managers, and championship legacies
        in The Boys League history.
      </p>

      {/* PLAYER SEASON LEADERBOARDS */}

      <section
        style={{
          ...darkStyle,
          marginTop: 28,
          marginBottom: 28,
          borderRadius: 18,
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
          Top 25 individual player seasons by position.
          Fantasy regular season + fantasy playoffs.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
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

        <div style={panelStyle}>
          <div
            style={{
              padding: 20,
              background: "#edf5f0",
              color: "#14251f",
            }}
          >
            <div className="label">
              HISTORICAL PLAYER LEADERBOARD
            </div>
            <h3 style={{ marginTop: 6 }}>
              TOP 25 {position} SEASONS
            </h3>
            <p style={mutedStyle}>
              Regular season + playoffs • 2020 onward
            </p>
          </div>

          <div style={{ color: "#14251f" }}>
            <DataTable
              headings={[
                "RANK",
                "PLAYER",
                "YEAR",
                "FANTASY TEAM / OWNER",
                "POINTS",
              ]}
            >
              {rankings.length === 0 ? (
                <Placeholder
                  columns={5}
                  message={`${position} player seasons awaiting import.`}
                />
              ) : (
                rankings.map((season, index) => (
                  <tr
                    key={`${season.player}-${season.year}-${index}`}
                  >
                    <td style={cellStyle}>
                      #{index + 1}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        fontWeight: 800,
                      }}
                    >
                      {season.player}
                    </td>
                    <td style={cellStyle}>
                      {season.year}
                    </td>
                    <td style={cellStyle}>
                      <strong>{season.team}</strong>
                      <div style={mutedStyle}>
                        {season.owner}
                      </div>
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        fontWeight: 800,
                        color: "#159c73",
                      }}
                    >
                      {points(season.points)}
                    </td>
                  </tr>
                ))
              )}
            </DataTable>
          </div>

          <div
            style={{
              padding: 14,
              background: "#ffffff",
              color: "#68736d",
              fontSize: 12,
            }}
          >
            Showing {rankings.length} of 25 possible
            historical {position} seasons
          </div>
        </div>
      </section>

      {/* LEAGUE RECORD CATEGORIES */}

      <section style={{ marginTop: 35 }}>
        <div className="label">
          THE HISTORY BOOKS
        </div>

        <h2 style={{ marginTop: 8 }}>
          ALL-TIME LEAGUE RECORDS
        </h2>

        <p className="muted">
          Select a category to explore the greatest
          performances, career records, and championship
          history since 2020.
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
              style={panelStyle}
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

                    <p className="muted">
                      {record.description}
                    </p>
                  </div>

                  <span className="pill">
                    OPEN ▾
                  </span>
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
                    {record.spotlight}
                  </h3>

                  <p style={{ color: "#c5d4cd" }}>
                    Awaiting verified historical results
                  </p>
                </div>

                <h3 style={{ marginBottom: 14 }}>
                  HISTORICAL LEADERBOARD
                </h3>

                <DataTable headings={record.columns}>
                  <Placeholder
                    columns={record.columns.length}
                  />
                </DataTable>

                <h3
                  style={{
                    marginTop: 28,
                    marginBottom: 14,
                  }}
                >
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
                  {record.records.map((item) => (
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
                      <p style={mutedStyle}>
                        Awaiting historical data
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}

          {/* COMBINED MANAGER + CHAMPIONSHIP SECTION */}

          <ManagerLegacy />
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
