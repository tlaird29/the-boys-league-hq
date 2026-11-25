
"use client";

import { useState } from "react";

import type {
  calculateAllTimeRecords,
} from "../../lib/all-time-records";

type AllTimeRecords =
  ReturnType<typeof calculateAllTimeRecords>;

type Category =
  | "allTime"
  | "regularSeason"
  | "playoffs";

type Metric =
  | "wins"
  | "points"
  | "winPercentage"
  | "average"
  | "winStreak"
  | "lossStreak";

type Props = {
  records?: AllTimeRecords | null;
};

const categories = [
  { id: "allTime", label: "Combined" },
  { id: "regularSeason", label: "Regular Season" },
  { id: "playoffs", label: "Playoffs" },
] as const;

const metrics = [
  { id: "wins", label: "Career Wins" },
  { id: "points", label: "Career Points" },
  { id: "winPercentage", label: "Win Percentage" },
  { id: "average", label: "Points Per Game" },
  { id: "winStreak", label: "Winning Streaks" },
  { id: "lossStreak", label: "Losing Streaks" },
] as const;

export default function LeagueRecordCategories({
  records = null,
}: Props) {
  const [category, setCategory] =
    useState<Category>("allTime");

  const [metric, setMetric] =
    useState<Metric>("wins");

  const selected =
    records?.records[category];

  const lifetime =
    selected?.mostCareerWins ?? [];

  const managers = lifetime.map(manager => {
    let value: number | null;

    switch (metric) {
      case "points":
        value = manager.career.pointsFor;
        break;

      case "winPercentage":
        value = manager.career.winPercentage;
        break;

      case "average":
        value = manager.career.pointsPerGame;
        break;

      case "winStreak":
        value = manager.longestWinStreak;
        break;

      case "lossStreak":
        value = manager.longestLossStreak;
        break;

      default:
        value = manager.career.wins;
    }

    return {
      id: manager.managerId,
      name: manager.name,
      value,
      wins: manager.career.wins,
      losses: manager.career.losses,
      ties: manager.career.ties,
      games: manager.career.games,
    };
  }).filter(
    manager => manager.value !== null
  ).sort(
    (a, b) =>
      (b.value ?? 0) - (a.value ?? 0) ||
      a.name.localeCompare(b.name)
  ).slice(0, 25);

  const leader = managers[0];

  const metricLabel =
    metrics.find(
      item => item.id === metric
    )?.label ?? "Career Wins";

  function format(value: number | null) {
    if (value === null) return "—";

    if (metric === "winPercentage") {
      return `${value.toFixed(2)}%`;
    }

    if (
      metric === "points" ||
      metric === "average"
    ) {
      return value.toLocaleString(
        "en-US",
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );
    }

    return String(value);
  }

  const sections = [
    {
      title: "HIGHEST WEEKLY SCORES",
      description:
        "The greatest weekly team scoring performances.",
      count:
        selected?.highestWeeklyScores.length ?? 0,
    },
    {
      title: "LOWEST WEEKLY SCORES",
      description:
        "The performances nobody wants to remember.",
      count:
        selected?.lowestWeeklyScores.length ?? 0,
    },
    {
      title: "BIGGEST BLOWOUTS",
      description:
        "The largest margins of victory in league history.",
      count:
        selected?.biggestVictories.length ?? 0,
    },
    {
      title: "CLOSEST GAMES",
      description:
        "The narrowest victories in league history.",
      count:
        selected?.closestVictories.length ?? 0,
    },
    {
      title: "BEST SINGLE-SEASON RECORDS",
      description:
        "The winningest completed seasons.",
      count:
        selected?.mostWinsInCompletedSeason.length ?? 0,
    },
    {
      title: "HIGHEST SCORING SEASONS",
      description:
        "The most fantasy points in completed seasons.",
      count:
        selected?.mostPointsInCompletedSeason.length ?? 0,
    },
  ];

  return (
    <section className="league-records">
      <div className="lr-kicker">
        THE BOYS • THE HISTORY BOOKS
      </div>

      <h2>ALL-TIME LEAGUE RECORDS</h2>

      <p className="lr-description">
        Explore the greatest team performances
        and manager achievements since 2020.
        Consolation matchups are excluded.
      </p>

      <div className="lr-controls">
        {categories.map(item => (
          <button
            key={item.id}
            type="button"
            aria-pressed={category === item.id}
            onClick={() => setCategory(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="lr-controls">
        {metrics.map(item => (
          <button
            key={item.id}
            type="button"
            aria-pressed={metric === item.id}
            onClick={() => setMetric(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="lr-spotlight">
        <div>
          <div className="lr-gold">
            RECORD HOLDER SPOTLIGHT
          </div>

          <h3>
            {leader?.name ??
              "Awaiting verified records"}
          </h3>

          <p>{metricLabel}</p>
        </div>

        <div className="lr-score">
          {format(leader?.value ?? null)}
        </div>
      </div>

      <div className="lr-table">
        <div className="lr-heading">
          <h3>
            {metricLabel.toUpperCase()}
          </h3>

          <p>
            {
              categories.find(
                item => item.id === category
              )?.label
            }
          </p>
        </div>

        <div className="lr-scroll">
          <table>
            <thead>
              <tr>
                <th>RANK</th>
                <th>MANAGER</th>
                <th>GAMES</th>
                <th>W-L-T</th>
                <th>{metricLabel.toUpperCase()}</th>
              </tr>
            </thead>

            <tbody>
              {managers.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="lr-empty"
                  >
                    Awaiting verified and
                    authorized historical data.
                  </td>
                </tr>
              ) : (
                managers.map((manager, index) => (
                  <tr key={manager.id}>
                    <td>#{index + 1}</td>

                    <td>
                      <strong>{manager.name}</strong>
                    </td>

                    <td>{manager.games}</td>

                    <td>
                      {manager.wins}-
                      {manager.losses}-
                      {manager.ties}
                    </td>

                    <td className="lr-value">
                      {format(manager.value)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="lr-sections">
        {sections.map(section => (
          <details key={section.title}>
            <summary>
              <strong>{section.title}</strong>

              <p>{section.description}</p>
            </summary>

            <div className="lr-section-body">
              {section.count > 0
                ? `${section.count} calculated records. Detailed leaderboard display is pending.`
                : "Awaiting verified historical results."}
            </div>
          </details>
        ))}
      </div>

      <style jsx>{`
        .league-records {
          background: #14251f;
          color: #ffffff;
          border-radius: 16px;
          padding: 24px;
          margin: 30px 0;
        }

        .lr-kicker {
          color: #48d6a8;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        h2 {
          font-size: clamp(26px, 4vw, 38px);
          margin: 12px 0;
        }

        .lr-description {
          color: #c5d4cd;
          line-height: 1.7;
          margin-bottom: 24px;
        }

        .lr-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 12px 0;
        }

        button {
          border: 1px solid #476055;
          background: #263d32;
          color: #ffffff;
          border-radius: 9px;
          padding: 12px 16px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        button[aria-pressed="true"] {
          background: #48d6a8;
          color: #14251f;
          border-color: #48d6a8;
        }

        button:focus-visible {
          outline: 2px solid #e9c875;
          outline-offset: 3px;
        }

        .lr-spotlight {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          background: #20382e;
          border: 1px solid #476055;
          border-radius: 14px;
          padding: 24px;
          margin: 24px 0 18px;
        }

        .lr-gold {
          color: #e9c875;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .lr-spotlight h3 {
          font-size: 24px;
          margin: 10px 0;
        }

        .lr-spotlight p {
          color: #c5d4cd;
          font-size: 13px;
        }

        .lr-score {
          color: #48d6a8;
          font-size: 40px;
          font-weight: 900;
        }

        .lr-table {
          background: #ffffff;
          color: #14251f;
          border-radius: 14px;
          overflow: hidden;
        }

        .lr-heading {
          padding: 20px;
        }

        .lr-heading h3 {
          margin: 0 0 8px;
        }

        .lr-heading p {
          color: #68736d;
          font-size: 13px;
        }

        .lr-scroll {
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 540px;
          border-collapse: collapse;
          text-align: left;
        }

        th {
          background: #edf5f0;
          color: #52665a;
          padding: 14px 12px;
          font-size: 11px;
          white-space: nowrap;
        }

        td {
          padding: 14px 12px;
          font-size: 13px;
          border-bottom: 1px solid #e2e9e4;
          white-space: nowrap;
        }

        .lr-value {
          color: #197655;
          font-weight: 900;
        }

        .lr-empty {
          padding: 36px 18px;
          color: #68736d;
          text-align: center;
          white-space: normal;
        }

        .lr-sections {
          display: grid;
          gap: 12px;
          margin-top: 24px;
        }

        details {
          background: #ffffff;
          color: #14251f;
          border-radius: 12px;
          overflow: hidden;
        }

        summary {
          padding: 18px;
          cursor: pointer;
          font-size: 14px;
        }

        summary p {
          color: #68736d;
          font-size: 12px;
          line-height: 1.6;
          margin: 8px 0 0;
        }

        .lr-section-body {
          padding: 20px;
          border-top: 1px solid #e2e9e4;
          color: #68736d;
          font-size: 13px;
        }

        @media (max-width: 600px) {
          .league-records {
            padding: 15px;
          }

          button {
            padding: 10px 12px;
          }
        }
      `}</style>
    </section>
  );
}
