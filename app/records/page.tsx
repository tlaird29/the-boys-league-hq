
import Link from "next/link";

import PlayerLeaderboards
  from "../components/player-leaderboards";

import {
  ACTIVE_MANAGERS,
} from "../../lib/league-managers";

import type {
  CSSProperties,
  ReactNode,
} from "react";

const thStyle: CSSProperties = {
  padding: "14px 12px",
  fontSize: 11,
  fontWeight: 800,
  color: "#52665a",
  background: "#edf5f0",
  textAlign: "left",
  whiteSpace: "nowrap",
  borderBottom: "1px solid #dce7df",
};

const tdStyle: CSSProperties = {
  padding: "14px 12px",
  fontSize: 13,
  whiteSpace: "nowrap",
  borderBottom: "1px solid #e2e9e4",
};

const darkStyle: CSSProperties = {
  background: "#14251f",
  color: "#ffffff",
  padding: 24,
  borderRadius: 16,
};

const panelStyle: CSSProperties = {
  background: "#ffffff",
  color: "#14251f",
  border: "1px solid #e2e9e4",
  borderRadius: 16,
  overflow: "hidden",
};

const tileStyle: CSSProperties = {
  background: "#f4f8f5",
  border: "1px solid #e2e9e4",
  borderRadius: 12,
  padding: 16,
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(min(100%, 200px), 1fr))",
  gap: 12,
};

const managerHeadings = [
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

const recordCategories = [
  {
    id: "wins",
    icon: "🏆",
    title: "All-Time Wins",

    description:
      "The winningest managers in league history.",

    columns: [
      "RANK",
      "MANAGER",
      "W-L-T",
      "WIN %",
    ],

    spotlight:
      "ALL-TIME WINS LEADER",

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

    description:
      "The greatest weekly scoring performances.",

    columns: [
      "RANK",
      "TEAM / OWNER",
      "SEASON / WEEK",
      "POINTS",
    ],

    spotlight:
      "HIGHEST WEEKLY SCORE",

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

    description:
      "The most brutal beatdowns in league history.",

    columns: [
      "RANK",
      "WINNER / LOSER",
      "FINAL SCORE",
      "MARGIN",
    ],

    spotlight:
      "BIGGEST MARGIN OF VICTORY",

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

function Table({
  headings,
  children,
  minWidth = 550,
}: {
  headings: string[];
  children: ReactNode;
  minWidth?: number;
}) {
  return (
    <div
      style={{
        overflowX: "auto",
        width: "100%",
      }}
    >
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
            {headings.map(heading => (
              <th
                key={heading}
                style={thStyle}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {children}
        </tbody>
      </table>
    </div>
  );
}

function EmptyRow({
  columns,

  message =
    "Awaiting verified historical data.",
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

function RecordTiles({
  records,
}: {
  records: readonly string[];
}) {
  return (
    <div style={gridStyle}>
      {records.map(item => (
        <div
          key={item}
          style={tileStyle}
        >
          <strong
            style={{ fontSize: 12 }}
          >
            {item}
          </strong>

          <p
            style={{
              color: "#68736d",
              fontSize: 12,
            }}
          >
            Awaiting historical data
          </p>
        </div>
      ))}
    </div>
  );
}

function ManagerHistory() {
  return (
    <section
      style={{
        ...panelStyle,
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

        <h2
          style={{
            fontSize: "clamp(24px, 4vw, 38px)",
            marginTop: 10,
          }}
        >
          MANAGER HISTORY &amp;
          CHAMPIONSHIP LEGACY
        </h2>

        <p
          style={{
            color: "#c5d4cd",
            lineHeight: 1.6,
          }}
        >
          Every active manager. Every win.
          Every point. Every championship.
          Career records include regular-season
          and championship-playoff games.
        </p>
      </div>

      <div style={{ padding: 20 }}>
        <div className="label">
          THE ALL-TIME CAREER LEADERBOARD
        </div>

        <h3
          style={{
            marginTop: 8,
            marginBottom: 12,
          }}
        >
          MANAGER CAREER STATISTICS
        </h3>

        <p
          style={{
            color: "#68736d",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          All {ACTIVE_MANAGERS.length} active
          managers are displayed below.
          Career rankings will be ordered
          by combined lifetime wins once
          verified data is available.
          Scroll horizontally to view
          every statistic.
        </p>

        <Table
          headings={managerHeadings}
          minWidth={1800}
        >
          {ACTIVE_MANAGERS.map(manager => (
            <tr key={manager.id}>
              <td
                style={{
                  ...tdStyle,
                  fontWeight: 800,
                }}
              >
                {manager.name}
              </td>

              {managerHeadings
                .slice(1)
                .map(heading => (
                  <td
                    key={heading}
                    style={tdStyle}
                  >
                    —
                  </td>
                ))}
            </tr>
          ))}
        </Table>

        <p
          style={{
            color: "#68736d",
            fontSize: 12,
            lineHeight: 1.7,
            marginTop: 15,
          }}
        >
          Lifetime records include
          championship-playoff games.
          Consolation games are excluded.
          Former managers are excluded
          from rankings, while games against
          them still count toward active
          managers&apos; career statistics.
        </p>

        <h3
          style={{
            marginTop: 34,
            marginBottom: 15,
          }}
        >
          CHAMPIONSHIP RECORDS
        </h3>

        <RecordTiles
          records={championshipRecords}
        />

        <h3
          style={{
            marginTop: 34,
            marginBottom: 15,
          }}
        >
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
          <EmptyRow
            columns={4}
            message="Championship results from 2020 onward are awaiting verified data."
          />
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
      {recordCategories.map(category => (
        <details
          key={category.id}
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

                <h3>
                  {category.title}
                </h3>

                <p className="muted">
                  {category.description}
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

              <h3
                style={{ marginTop: 12 }}
              >
                {category.spotlight}
              </h3>

              <p
                style={{ color: "#c5d4cd" }}
              >
                Awaiting verified
                historical results
              </p>
            </div>

            <h3
              style={{ marginBottom: 14 }}
            >
              HISTORICAL LEADERBOARD
            </h3>

            <Table
              headings={category.columns}
            >
              <EmptyRow
                columns={
                  category.columns.length
                }
              />
            </Table>

            <h3
              style={{
                marginTop: 28,
                marginBottom: 14,
              }}
            >
              ADDITIONAL RECORDS
            </h3>

            <RecordTiles
              records={category.records}
            />
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
        The greatest performances,
        all-time manager careers,
        legendary records, and
        championship history
        in The Boys League.
      </p>

      <PlayerLeaderboards />

      <section
        style={{ marginTop: 35 }}
      >
        <div className="label">
          THE HISTORY BOOKS
        </div>

        <h2
          style={{ marginTop: 8 }}
        >
          ALL-TIME LEAGUE RECORDS
        </h2>

        <p className="muted">
          Career leaderboards,
          historic weekly performances,
          blowouts, and championships.
        </p>

        <ManagerHistory />

        <OtherRecords />
      </section>

      <div
        style={{ marginTop: 28 }}
      >
        <Link
          href="/"
          className="button"
        >
          🏠 Home / League HQ
        </Link>
      </div>
    </main>
  );
}
