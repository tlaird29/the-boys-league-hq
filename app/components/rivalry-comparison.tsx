
"use client";

import { useState } from "react";

import {
  ACTIVE_MANAGERS,
} from "../../lib/league-managers";

import {
  getRivalryRecord,
  type RivalryRecord,
} from "../../lib/rivalry-records";

type Period =
  | "combined"
  | "regularSeason"
  | "playoffs";

type Props = {
  records?: readonly RivalryRecord[];
};

export default function RivalryComparison({
  records = [],
}: Props) {
  const [managerId, setManagerId] =
    useState<string>(
      ACTIVE_MANAGERS[0].id
    );

  const [opponentId, setOpponentId] =
    useState<string>(
      ACTIVE_MANAGERS[1].id
    );

  const [period, setPeriod] =
    useState<Period>("combined");

  const manager = ACTIVE_MANAGERS.find(
    item => item.id === managerId
  );

  const opponent = ACTIVE_MANAGERS.find(
    item => item.id === opponentId
  );

  const record = getRivalryRecord(
    records,
    managerId,
    opponentId
  );

  const totals = record?.[period];

  const hasGames =
    (totals?.games ?? 0) > 0;

  const meetings =
    record?.meetings.filter(
      game =>
        period === "combined" ||
        (
          period === "playoffs"
            ? game.isPlayoffs
            : !game.isPlayoffs
        )
    ) ?? [];

  const winShare =
    totals?.winPercentage ?? 50;

  const stats = [
    {
      label: "TOTAL MEETINGS",
      value: totals?.games,
    },
    {
      label: "POINTS FOR",
      value:
        totals?.pointsFor.toFixed(2),
    },
    {
      label: "POINTS AGAINST",
      value:
        totals?.pointsAgainst.toFixed(2),
    },
    {
      label: "POINTS PER GAME",
      value:
        totals?.pointsPerGame?.toFixed(2),
    },
    {
      label: "POINT DIFFERENTIAL",
      value:
        totals?.pointDifferential.toFixed(2),
    },
    {
      label: "WIN PERCENTAGE",
      value:
        totals?.winPercentage !== null &&
        totals?.winPercentage !== undefined
          ? `${totals.winPercentage.toFixed(1)}%`
          : null,
    },
  ];

  return (
    <section className="rc-root">
      <style>{`
        .rc-root {
          background: #14251f;
          color: #ffffff;
          border-radius: 16px;
          padding: clamp(16px, 4vw, 30px);
          margin-top: 24px;
        }

        .rc-kicker {
          color: #48d6a8;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .rc-selectors {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            auto
            minmax(0, 1fr);
          align-items: end;
          gap: 16px;
          margin: 26px 0;
        }

        .rc-selectors label {
          display: block;
          color: #c5d4cd;
          font-size: 11px;
          font-weight: 800;
        }

        .rc-selectors select {
          display: block;
          width: 100%;
          background: #263d32;
          color: #ffffff;
          border: 1px solid #779889;
          border-radius: 8px;
          padding: 13px 10px;
          margin-top: 9px;
          font-size: 14px;
        }

        .rc-versus {
          color: #e9c875;
          font-size: 24px;
          font-weight: 900;
          padding-bottom: 9px;
        }

        .rc-periods {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 22px;
        }

        .rc-period {
          border: 1px solid #476055;
          background: #263d32;
          color: #ffffff;
          padding: 10px 16px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .rc-period.active {
          background: #48d6a8;
          color: #14251f;
          border-color: #48d6a8;
        }

        .rc-period:focus-visible,
        .rc-selectors select:focus-visible {
          outline: 2px solid #e9c875;
          outline-offset: 3px;
        }

        .rc-scoreboard {
          background: #20382e;
          border: 1px solid #476055;
          border-radius: 12px;
          padding: 24px 15px;
        }

        .rc-score-row {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            auto
            minmax(0, 1fr);
          align-items: center;
          gap: 12px;
          text-align: center;
        }

        .rc-score-name {
          color: #c5d4cd;
          font-size: 13px;
          font-weight: 800;
          overflow-wrap: anywhere;
        }

        .rc-score-number {
          font-family:
            'Barlow Condensed',
            Impact,
            sans-serif;
          font-size:
            clamp(45px, 9vw, 86px);
          line-height: 1;
          font-weight: 900;
          margin: 12px 0;
        }

        .rc-score-divider {
          color: #779889;
          font-size: 30px;
        }

        .rc-winbar {
          display: flex;
          height: 9px;
          border-radius: 8px;
          overflow: hidden;
          background: #476055;
          margin: 20px 0 12px;
        }

        .rc-stat-grid {
          display: grid;
          grid-template-columns:
            repeat(
              auto-fit,
              minmax(min(100%, 155px), 1fr)
            );
          gap: 12px;
          margin-top: 18px;
        }

        .rc-stat {
          background: #20382e;
          border: 1px solid #476055;
          border-radius: 10px;
          padding: 16px;
        }

        .rc-stat-label {
          font-size: 10px;
          font-weight: 800;
          color: #c5d4cd;
          letter-spacing: 1px;
        }

        .rc-stat-value {
          font-size: 25px;
          font-weight: 900;
          color: #48d6a8;
          margin-top: 10px;
        }

        .rc-history {
          overflow-x: auto;
          margin-top: 18px;
        }

        .rc-history table {
          width: 100%;
          min-width: 780px;
          border-collapse: collapse;
          text-align: left;
        }

        .rc-history th {
          background: #263d32;
          color: #c5d4cd;
          font-size: 10px;
          letter-spacing: .5px;
        }

        .rc-history td,
        .rc-history th {
          padding: 13px 10px;
          border-bottom:
            1px solid #476055;
        }

        .rc-history td {
          font-size: 13px;
        }

        @media (max-width: 550px) {
          .rc-selectors {
            gap: 8px;
          }

          .rc-versus {
            font-size: 16px;
          }

          .rc-selectors select {
            font-size: 12px;
            padding: 11px 5px;
          }
        }
      `}</style>

      <div className="rc-kicker">
        THE BOYS • TALE OF THE TAPE
      </div>

      <h2
        style={{
          fontSize:
            "clamp(30px, 5vw, 46px)",
          margin: "12px 0",
        }}
      >
        HEAD-TO-HEAD HQ
      </h2>

      <p
        style={{
          color: "#c5d4cd",
          lineHeight: 1.7,
        }}
      >
        Pick two managers.
        Settle the argument.
        The receipts speak for themselves.
      </p>

      <div className="rc-selectors">
        <label>
          MANAGER ONE

          <select
            value={managerId}
            onChange={event =>
              setManagerId(
                event.target.value
              )
            }
          >
            {ACTIVE_MANAGERS
              .filter(
                item =>
                  item.id !== opponentId
              )
              .map(item => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
          </select>
        </label>

        <div className="rc-versus">
          VS
        </div>

        <label>
          MANAGER TWO

          <select
            value={opponentId}
            onChange={event =>
              setOpponentId(
                event.target.value
              )
            }
          >
            {ACTIVE_MANAGERS
              .filter(
                item =>
                  item.id !== managerId
              )
              .map(item => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.name}
                </option>
              ))}
          </select>
        </label>
      </div>

      <div
        className="rc-periods"
        aria-label="Matchup period"
      >
        {([
          ["combined", "All-Time"],
          ["regularSeason", "Regular Season"],
          ["playoffs", "Playoffs"],
        ] as const).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={period === value}
            className={
              period === value
                ? "rc-period active"
                : "rc-period"
            }
            onClick={() =>
              setPeriod(value)
            }
          >
            {label}
          </button>
        ))}
      </div>

      <div className="rc-scoreboard">
        <div className="rc-score-row">
          <div>
            <div className="rc-score-name">
              {manager?.name}
            </div>

            <div
              className="rc-score-number"
              style={{ color: "#48d6a8" }}
            >
              {hasGames
                ? totals?.wins
                : "—"}
            </div>

            <small>WINS</small>
          </div>

          <div className="rc-score-divider">
            –
          </div>

          <div>
            <div className="rc-score-name">
              {opponent?.name}
            </div>

            <div
              className="rc-score-number"
              style={{ color: "#e9c875" }}
            >
              {hasGames
                ? totals?.losses
                : "—"}
            </div>

            <small>WINS</small>
          </div>
        </div>

        {hasGames && (
          <div
            className="rc-winbar"
            aria-label={
              `Win percentage ${winShare}%`
            }
          >
            <div
              style={{
                width: `${winShare}%`,
                background: "#48d6a8",
              }}
            />

            <div
              style={{
                flex: 1,
                background: "#e9c875",
              }}
            />
          </div>
        )}

        <p
          style={{
            textAlign: "center",
            color: "#c5d4cd",
            fontSize: 12,
            marginBottom: 0,
          }}
        >
          {hasGames
            ? `${totals?.games} meetings • ${totals?.ties} ties`
            : record
              ? "No verified meetings in this period."
              : "Awaiting verified historical results."}
        </p>
      </div>

      <div className="rc-stat-grid">
        {stats.map(stat => (
          <div
            key={stat.label}
            className="rc-stat"
          >
            <div className="rc-stat-label">
              {stat.label}
            </div>

            <div className="rc-stat-value">
              {hasGames
                ? stat.value ?? "—"
                : "—"}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 30 }}>
        ALL-TIME RIVALRY RECORDS
      </h3>

      <div className="rc-stat-grid">
        {[
          {
            label: "LONGEST WIN STREAK",
            value: record?.longestWinStreak,
          },
          {
            label: "LONGEST LOSS STREAK",
            value: record?.longestLossStreak,
          },
          {
            label: "CURRENT STREAK",
            value:
              record?.currentStreak.type
                ? record.currentStreak.type +
                  record.currentStreak.length
                : null,
          },
          {
            label: "BIGGEST WIN",
            value:
              record?.biggestWin?.margin
                .toFixed(2),
          },
          {
            label: "BIGGEST LOSS",
            value: record?.biggestLoss
              ? Math.abs(
                  record.biggestLoss.margin
                ).toFixed(2)
              : null,
          },
          {
            label: "CLOSEST DECIDED GAME",
            value: record?.closestGame
              ? Math.abs(
                  record.closestGame.margin
                ).toFixed(2)
              : null,
          },
        ].map(stat => (
          <div
            key={stat.label}
            className="rc-stat"
          >
            <div className="rc-stat-label">
              {stat.label}
            </div>

            <div className="rc-stat-value">
              {record?.combined.games
                ? stat.value ?? "—"
                : "—"}
            </div>
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: 30 }}>
        THE MATCHUP HISTORY
      </h3>

      <p
        style={{
          color: "#c5d4cd",
          fontSize: 13,
        }}
      >
        Original team names and results,
        newest meetings first.
      </p>

      <div className="rc-history">
        <table>
          <thead>
            <tr>
              {[
                "SEASON",
                "WEEK",
                "TYPE",
                "TEAM",
                "OPPONENT",
                "SCORE",
                "RESULT",
                "MARGIN",
              ].map(label => (
                <th key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {meetings.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    textAlign: "center",
                    padding: 30,
                    color: "#c5d4cd",
                  }}
                >
                  No verified matchup history
                  available for this selection.
                </td>
              </tr>
            ) : (
              meetings.map(game => (
                <tr key={game.id}>
                  <td>{game.season}</td>
                  <td>{game.week}</td>

                  <td>
                    {game.isPlayoffs
                      ? "Playoffs"
                      : "Regular"}
                  </td>

                  <td>{game.teamName}</td>

                  <td>
                    {game.opponentTeamName}
                  </td>

                  <td
                    style={{
                      whiteSpace: "nowrap",
                    }}
                  >
                    {game.points.toFixed(2)}
                    {" - "}
                    {game.opponentPoints
                      .toFixed(2)}
                  </td>

                  <td
                    style={{
                      fontWeight: 900,
                      color:
                        game.outcome === "W"
                          ? "#48d6a8"
                          : game.outcome === "L"
                            ? "#ff9292"
                            : "#e9c875",
                    }}
                  >
                    {game.outcome}
                  </td>

                  <td>
                    {game.margin > 0
                      ? "+"
                      : ""}
                    {game.margin.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p
        style={{
          color: "#c5d4cd",
          fontSize: 12,
          lineHeight: 1.7,
          marginTop: 20,
        }}
      >
        Official regular-season and
        championship-bracket games only.
        Ties count as half a win for
        win-percentage calculations.
        Consolation games are excluded
        from the verified input.
      </p>
    </section>
  );
}
