
"use client";

import { useState } from "react";

import {
  ACTIVE_MANAGERS,
} from "../../lib/league-managers";

import type {
  calculateAllTimeRecords,
} from "../../lib/all-time-records";

type AllTimeRecords =
  ReturnType<typeof calculateAllTimeRecords>;

type Props = {
  records?: AllTimeRecords | null;

  playoffAppearances?: Readonly<
    Record<string, number>
  >;
};

type CellValue =
  string | number | null;

type Column = {
  id: string;
  label: string;
  numeric?: boolean;
};

const columns: Column[] = [
  { id: "name", label: "MANAGER" },
  { id: "seasons", label: "SEASONS", numeric: true },
  { id: "games", label: "GAMES", numeric: true },
  { id: "wins", label: "WINS", numeric: true },
  { id: "losses", label: "LOSSES", numeric: true },
  { id: "ties", label: "TIES", numeric: true },
  { id: "winPct", label: "WIN %", numeric: true },
  { id: "regular", label: "REG. W-L-T" },
  { id: "playoffs", label: "PLAYOFF W-L-T" },
  { id: "playoffWins", label: "PLAYOFF WINS", numeric: true },
  { id: "pointsFor", label: "POINTS FOR", numeric: true },
  { id: "pointsAgainst", label: "POINTS AGAINST", numeric: true },
  { id: "difference", label: "POINT DIFF.", numeric: true },
  { id: "average", label: "PPG", numeric: true },
  { id: "winStreak", label: "WIN STREAK", numeric: true },
  { id: "lossStreak", label: "LOSS STREAK", numeric: true },
  { id: "titles", label: "TITLES", numeric: true },
  { id: "finals", label: "FINALS", numeric: true },
  { id: "playoffApps", label: "PLAYOFF APPS.", numeric: true },
];

const decimalColumns = new Set([
  "pointsFor",
  "pointsAgainst",
  "difference",
  "average",
]);

function formatValue(
  id: string,
  value: CellValue
) {
  if (value === null) {
    return "—";
  }

  if (
    typeof value === "number" &&
    decimalColumns.has(id)
  ) {
    return value.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  if (
    id === "winPct" &&
    typeof value === "number"
  ) {
    return `${value.toFixed(1)}%`;
  }

  return String(value);
}

export default function ManagerCareerTable({
  records = null,
  playoffAppearances = {},
}: Props) {
  const [sortColumn, setSortColumn] =
    useState("wins");

  const [descending, setDescending] =
    useState(true);

  const rows = ACTIVE_MANAGERS.map(
    manager => {
      const profile =
        records?.managerProfiles.find(
          item =>
            item.managerId === manager.id
        );

      const stats =
        profile?.statistics;

      const titles =
        profile?.championships;

      const career =
        stats?.career;

      const hasGames =
        (career?.games ?? 0) > 0;

      const values:
        Record<string, CellValue> = {
          name: manager.name,

          seasons:
            stats?.seasonsPlayed ?? null,

          games:
            career?.games ?? null,

          wins:
            career?.wins ?? null,

          losses:
            career?.losses ?? null,

          ties:
            career?.ties ?? null,

          winPct:
            career?.winPercentage ?? null,

          regular:
            stats
              ? `${stats.regularSeason.wins}-` +
                `${stats.regularSeason.losses}-` +
                `${stats.regularSeason.ties}`
              : null,

          playoffs:
            stats
              ? `${stats.playoffs.wins}-` +
                `${stats.playoffs.losses}-` +
                `${stats.playoffs.ties}`
              : null,

          playoffWins:
            stats?.playoffs.wins ?? null,

          pointsFor:
            career?.pointsFor ?? null,

          pointsAgainst:
            career?.pointsAgainst ?? null,

          difference:
            career
              ? career.pointsFor -
                career.pointsAgainst
              : null,

          average:
            career?.pointsPerGame ?? null,

          winStreak:
            hasGames
              ? stats?.longestWinStreak ?? null
              : null,

          lossStreak:
            hasGames
              ? stats?.longestLossStreak ?? null
              : null,

          titles:
            titles?.championships ?? null,

          finals:
            titles?.championshipAppearances ?? null,

          playoffApps:
            playoffAppearances[manager.id] ??
            null,
        };

      return {
        id: manager.id,
        values,
      };
    }
  );

  rows.sort((a, b) => {
    const first =
      a.values[sortColumn] ?? null;

    const second =
      b.values[sortColumn] ?? null;

    if (
      first === null &&
      second === null
    ) {
      return 0;
    }

    if (first === null) return 1;
    if (second === null) return -1;

    const comparison =
      typeof first === "number" &&
      typeof second === "number"
        ? first - second
        : String(first).localeCompare(
            String(second),
            undefined,
            { numeric: true }
          );

    return descending
      ? -comparison
      : comparison;
  });

  function changeSort(column: Column) {
    if (sortColumn === column.id) {
      setDescending(value => !value);
    } else {
      setSortColumn(column.id);

      setDescending(
        column.numeric === true
      );
    }
  }

  return (
    <section className="career-panel">
      <div className="career-heading">
        <div className="career-kicker">
          THE ALL-TIME CAREER LEADERBOARD
        </div>

        <h3>MANAGER CAREER STATISTICS</h3>

        <p>
          Select a column heading to sort
          the leaderboard. Scroll horizontally
          to explore every career statistic.
        </p>
      </div>

      <div className="career-scroll">
        <table>
          <thead>
            <tr>
              {columns.map(column => (
                <th
                  key={column.id}
                  aria-sort={
                    sortColumn === column.id
                      ? descending
                        ? "descending"
                        : "ascending"
                      : "none"
                  }
                >
                  <button
                    type="button"
                    onClick={() =>
                      changeSort(column)
                    }
                  >
                    {column.label}

                    {sortColumn === column.id
                      ? descending
                        ? " ↓"
                        : " ↑"
                      : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.map(row => (
              <tr key={row.id}>
                {columns.map(column => (
                  <td
                    key={column.id}
                    className={
                      column.id === sortColumn
                        ? "career-selected"
                        : ""
                    }
                  >
                    {formatValue(
                      column.id,
                      row.values[column.id] ??
                        null
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="career-footer">
        <strong>
          {records
            ? "Historical career statistics"
            : "Awaiting verified historical data"}
        </strong>

        <p>
          Career totals include regular-season
          and championship-playoff matchups.
          Consolation games are excluded.
          Games against former managers count
          toward active managers&apos; records.
          Streaks can span consecutive seasons.
        </p>
      </div>

      <style jsx>{`
        .career-panel {
          background: #ffffff;
          color: #14251f;
          border: 1px solid #e2e9e4;
          border-radius: 14px;
          overflow: hidden;
        }

        .career-heading {
          padding: 20px;
        }

        .career-kicker {
          font-size: 11px;
          font-weight: 800;
          color: #52665a;
          letter-spacing: 1.5px;
        }

        h3 {
          margin: 8px 0;
          font-size: 23px;
        }

        p {
          font-size: 13px;
          color: #68736d;
          line-height: 1.7;
        }

        .career-scroll {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 2000px;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }

        th {
          background: #edf5f0;
          border-bottom: 1px solid #dce7df;
          white-space: nowrap;
        }

        th button {
          background: transparent;
          border: none;
          color: #52665a;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          padding: 15px 12px;
          cursor: pointer;
        }

        th button:hover {
          color: #197655;
        }

        td {
          padding: 15px 12px;
          font-size: 13px;
          border-bottom: 1px solid #e2e9e4;
          white-space: nowrap;
          font-variant-numeric: tabular-nums;
        }

        th:first-child,
        td:first-child {
          position: sticky;
          left: 0;
          z-index: 1;
          box-shadow: 3px 0 5px #14251f0d;
        }

        td:first-child {
          background: #ffffff;
          font-weight: 800;
        }

        .career-selected {
          color: #197655;
          font-weight: 800;
          background: #f0faf5;
        }

        tr:hover td {
          background: #f4f8f5;
        }

        .career-footer {
          padding: 20px;
          font-size: 13px;
        }

        .career-footer p {
          margin-bottom: 0;
        }
      `}</style>
    </section>
  );
}
