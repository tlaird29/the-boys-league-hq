
"use client";

import { useState } from "react";

import {
  RECORD_POSITIONS,
  type RecordPosition,
  type PlayerRecordCategory,
  type PlayerRecordBook,
} from "../../lib/player-record-types";

import type {
  calculateWeeklyPlayerRecords,
} from "../../lib/player-weekly-records";

type WeeklyRecords = NonNullable<
  ReturnType<
    typeof calculateWeeklyPlayerRecords
  >["records"]
>;

type Props = {
  seasonRecords?: PlayerRecordBook | null;
  weeklyRecords?: WeeklyRecords | null;
};

const categories = [
  {
    id: "combined",
    label: "Combined",
  },
  {
    id: "regularSeason",
    label: "Regular Season",
  },
  {
    id: "playoffs",
    label: "Playoffs",
  },
] as const;

const positionNames = {
  QB: "Quarterbacks",
  RB: "Running Backs",
  WR: "Wide Receivers",
  TE: "Tight Ends",
  K: "Kickers",
  DEF: "Defenses",
};

export default function PlayerLeaderboards({
  seasonRecords = null,
  weeklyRecords = null,
}: Props) {
  const [position, setPosition] =
    useState<RecordPosition>("QB");

  const [category, setCategory] =
    useState<PlayerRecordCategory>(
      "combined"
    );

  const [period, setPeriod] =
    useState<"season" | "weekly">(
      "season"
    );

  const seasonRows =
    seasonRecords?.[category]?.[position]
      ?.slice(0, 25) ?? [];

  const weeklyRows =
    weeklyRecords?.[category]?.[position]
      ?.slice(0, 25) ?? [];

  const rows =
    period === "season"
      ? seasonRows.map(item => ({
          key: JSON.stringify([
            item.season,
            item.playerId,
            item.managerId,
          ]),

          rank: item.rank,

          player: item.playerName,

          nflTeam:
            item.nflTeams.join(" / "),

          season: item.season,

          detail:
            item.seasonComplete
              ? "Completed"
              : "In progress",

          team:
            item.fantasyTeamNames.join(" / "),

          manager: item.managerName,

          games: item.games,

          average: item.pointsPerGame,

          points: item.points,
        }))
      : weeklyRows.map(item => ({
          key: JSON.stringify([
            item.season,
            item.week,
            item.playerId,
            item.managerId,
          ]),

          rank: item.rank,

          player: item.playerName,

          nflTeam: item.nflTeam,

          season: item.season,

          detail: `Week ${item.week}`,

          team: item.fantasyTeamName,

          manager: item.managerName,

          games: 1,

          average: item.points,

          points: item.points,
        }));

  const leader = rows[0];

  const dataAvailable =
    period === "season"
      ? seasonRecords !== null
      : weeklyRecords !== null;

  return (
    <section className="player-records">
      <div className="pr-kicker">
        THE BOYS LEAGUE • HALL OF FAME
      </div>

      <h2>ALL-TIME PLAYER RECORDS</h2>

      <p className="pr-description">
        The greatest individual performances
        in league history. Starting-lineup
        contributions from 2020 onward,
        excluding consolation games.
      </p>

      <div
        className="pr-controls"
        aria-label="Record period"
      >
        <button
          type="button"
          aria-pressed={period === "season"}
          onClick={() => setPeriod("season")}
        >
          Best Player Seasons
        </button>

        <button
          type="button"
          aria-pressed={period === "weekly"}
          onClick={() => setPeriod("weekly")}
        >
          Best Weekly Performances
        </button>
      </div>

      <div
        className="pr-controls pr-positions"
        aria-label="Player position"
      >
        {RECORD_POSITIONS.map(pos => (
          <button
            key={pos}
            type="button"
            aria-pressed={position === pos}
            onClick={() => setPosition(pos)}
          >
            {pos}
          </button>
        ))}
      </div>

      <div
        className="pr-controls"
        aria-label="Scoring category"
      >
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

      <div className="pr-spotlight">
        <div>
          <div className="pr-gold">
            RECORD HOLDER SPOTLIGHT
          </div>

          <h3>
            {leader
              ? leader.player
              : "Awaiting verified records"}
          </h3>

          <p>
            {leader
              ? `${leader.manager} • ${leader.season}`
              : "Historical scoring data has not been published."}
          </p>
        </div>

        <div className="pr-leader-score">
          {leader
            ? leader.points.toFixed(2)
            : "—"}

          <small>FANTASY POINTS</small>
        </div>
      </div>

      <div className="pr-table-card">
        <div className="pr-table-heading">
          <div className="pr-table-label">
            HISTORICAL LEADERBOARD
          </div>

          <h3>
            TOP 25 {position}{" "}
            {period === "season"
              ? "SEASONS"
              : "WEEKLY SCORES"}
          </h3>

          <p>
            {positionNames[position]} •{" "}
            {
              categories.find(
                item => item.id === category
              )?.label
            }
          </p>
        </div>

        <div className="pr-table-scroll">
          <table>
            <thead>
              <tr>
                <th>RANK</th>
                <th>PLAYER</th>
                <th>SEASON</th>
                <th>FANTASY TEAM / OWNER</th>

                {period === "season" && (
                  <>
                    <th>STARTS</th>
                    <th>PPG</th>
                  </>
                )}

                <th>POINTS</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    className="pr-empty"
                    colSpan={
                      period === "season"
                        ? 7
                        : 5
                    }
                  >
                    {dataAvailable
                      ? "No eligible performances in this category."
                      : "Awaiting verified and authorized historical data."}
                  </td>
                </tr>
              ) : (
                rows.map(item => (
                  <tr key={item.key}>
                    <td>
                      <strong
                        className={
                          item.rank === 1
                            ? "pr-first"
                            : ""
                        }
                      >
                        #{item.rank}
                      </strong>
                    </td>

                    <td>
                      <strong>
                        {item.player}
                      </strong>

                      <small>
                        {item.nflTeam}
                      </small>
                    </td>

                    <td>
                      {item.season}

                      <small>
                        {item.detail}
                      </small>
                    </td>

                    <td>
                      <strong>
                        {item.team}
                      </strong>

                      <small>
                        {item.manager}
                      </small>
                    </td>

                    {period === "season" && (
                      <>
                        <td>
                          {item.games}
                        </td>

                        <td>
                          {item.average.toFixed(2)}
                        </td>
                      </>
                    )}

                    <td className="pr-points">
                      {item.points.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pr-footer">
          Showing {rows.length} of 25 possible
          records. Only active managers are
          eligible for these rankings.
          Traded player contributions are
          credited separately to each manager.
        </div>
      </div>

      <style jsx>{`
        .player-records {
          margin: 28px 0;
          padding: 24px;
          border-radius: 16px;
          background: #14251f;
          color: #ffffff;
        }

        .pr-kicker {
          color: #48d6a8;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        h2 {
          font-size: clamp(26px, 4vw, 42px);
          margin: 12px 0;
        }

        .pr-description {
          color: #c5d4cd;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .pr-controls {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin: 12px 0;
        }

        .pr-controls button {
          border: 1px solid #476055;
          background: #263d32;
          color: #ffffff;
          border-radius: 9px;
          padding: 12px 18px;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
        }

        .pr-controls button:hover {
          border-color: #48d6a8;
        }

        .pr-controls button[aria-pressed="true"] {
          background: #48d6a8;
          color: #14251f;
          border-color: #48d6a8;
        }

        .pr-controls button:focus-visible {
          outline: 2px solid #e9c875;
          outline-offset: 3px;
        }

        .pr-positions button {
          min-width: 60px;
        }

        .pr-spotlight {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 20px;
          padding: 24px;
          margin: 24px 0 18px;
          border: 1px solid #476055;
          border-radius: 14px;
          background: #20382e;
        }

        .pr-gold {
          color: #e9c875;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .pr-spotlight h3 {
          font-size: 24px;
          margin: 10px 0;
        }

        .pr-spotlight p {
          color: #c5d4cd;
          font-size: 13px;
        }

        .pr-leader-score {
          color: #48d6a8;
          font-size: 42px;
          font-weight: 900;
          font-variant-numeric: tabular-nums;
        }

        .pr-leader-score small {
          display: block;
          color: #c5d4cd;
          font-size: 10px;
          letter-spacing: 1px;
        }

        .pr-table-card {
          background: #ffffff;
          color: #14251f;
          border-radius: 14px;
          overflow: hidden;
        }

        .pr-table-heading {
          padding: 20px;
        }

        .pr-table-label {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #52665a;
        }

        .pr-table-heading h3 {
          font-size: 23px;
          margin: 8px 0;
        }

        .pr-table-heading p {
          color: #68736d;
          font-size: 13px;
        }

        .pr-table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        table {
          width: 100%;
          min-width: 660px;
          border-collapse: collapse;
          text-align: left;
        }

        th {
          background: #edf5f0;
          color: #52665a;
          padding: 14px 12px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        td {
          padding: 14px 12px;
          border-bottom: 1px solid #e2e9e4;
          font-size: 13px;
          white-space: nowrap;
        }

        td small {
          display: block;
          margin-top: 4px;
          color: #68736d;
          font-size: 11px;
        }

        .pr-first {
          color: #987322;
        }

        .pr-points {
          color: #197655;
          font-weight: 900;
          font-variant-numeric: tabular-nums;
        }

        .pr-empty {
          text-align: center;
          color: #68736d;
          padding: 36px 18px;
          white-space: normal;
        }

        .pr-footer {
          padding: 18px 20px;
          color: #68736d;
          font-size: 12px;
          line-height: 1.7;
        }

        @media (max-width: 600px) {
          .player-records {
            padding: 15px;
          }

          .pr-controls button {
            padding: 10px 12px;
            font-size: 12px;
          }

          .pr-positions button {
            min-width: 44px;
          }

          .pr-spotlight {
            padding: 18px;
          }
        }
      `}</style>
    </section>
  );
}
