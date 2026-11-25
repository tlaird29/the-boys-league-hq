
import type {
  ReactNode,
} from "react";

import {
  findManagerById,
} from "../../lib/league-managers";

import {
  buildRivalryLeaderboards,
  type RivalryLeaderboardEntry,
} from "../../lib/rivalry-leaderboards";

import type {
  RivalryMeeting,
} from "../../lib/rivalry-records";

type Leaderboards = ReturnType<
  typeof buildRivalryLeaderboards
>;

type Props = {
  leaderboards: Leaderboards;
};

function managerName(id: string) {
  return (
    findManagerById(id)?.name ??
    "Unknown manager"
  );
}

function LeaderboardTable({
  kicker,
  title,
  description,
  headings,
  rows,
}: {
  kicker: string;
  title: string;
  description: string;
  headings: readonly string[];
  rows: readonly ReactNode[][];
}) {
  return (
    <section className="rl-card">
      <div className="rl-kicker">
        {kicker}
      </div>

      <h3>{title}</h3>

      <p className="rl-description">
        {description}
      </p>

      <div className="rl-scroll">
        <table className="rl-table">
          <thead>
            <tr>
              <th scope="col">
                #
              </th>

              {headings.map(heading => (
                <th
                  key={heading}
                  scope="col"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    headings.length + 1
                  }
                  className="rl-empty"
                >
                  Awaiting verified and
                  authorized historical results.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index}>
                  <td className="rl-rank">
                    {index + 1}
                  </td>

                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PairName({
  first,
  second,
}: {
  first: string;
  second: string;
}) {
  return (
    <div className="rl-pair">
      <strong>{first}</strong>

      <small>
        vs. {second}
      </small>
    </div>
  );
}

function MetricLeaderboard({
  kicker,
  title,
  description,
  metric,
  entries,
}: {
  kicker: string;
  title: string;
  description: string;
  metric: string;
  entries: readonly RivalryLeaderboardEntry[];
}) {
  return (
    <LeaderboardTable
      kicker={kicker}
      title={title}
      description={description}
      headings={[
        "RIVALRY",
        metric,
      ]}
      rows={entries.map(entry => [
        <PairName
          key="pair"
          first={entry.managerName}
          second={entry.opponentName}
        />,

        <strong
          key="value"
          className="rl-value"
        >
          {entry.value}
        </strong>,
      ])}
    />
  );
}

function GameLeaderboard({
  kicker,
  title,
  description,
  meetings,
}: {
  kicker: string;
  title: string;
  description: string;
  meetings: readonly RivalryMeeting[];
}) {
  return (
    <LeaderboardTable
      kicker={kicker}
      title={title}
      description={description}
      headings={[
        "WINNER / OPPONENT",
        "SEASON",
        "SCORE",
        "MARGIN",
      ]}
      rows={meetings.map(game => [
        <PairName
          key="pair"
          first={managerName(
            game.managerId
          )}
          second={managerName(
            game.opponentId
          )}
        />,

        <div key="date">
          <strong>
            {game.season} / W{game.week}
          </strong>

          <small className="rl-subtext">
            {game.isPlayoffs
              ? "Playoffs"
              : "Regular season"}
          </small>
        </div>,

        `${game.points.toFixed(2)} - ` +
          game.opponentPoints.toFixed(2),

        <strong
          key="margin"
          className="rl-value"
        >
          {Math.abs(game.margin)
            .toFixed(2)}
        </strong>,
      ])}
    />
  );
}

export default function RivalryLeaderboards({
  leaderboards,
}: Props) {
  return (
    <div className="rl-root">
      <style>{`
        .rl-root {
          margin-top: 32px;
          color: #14251f;
        }

        .rl-header {
          background: #14251f;
          color: #ffffff;
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 20px;
        }

        .rl-header h2 {
          font-size:
            clamp(30px, 5vw, 46px);
          margin: 12px 0;
        }

        .rl-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 20px;
        }

        .rl-card {
          background: #ffffff;
          color: #14251f;
          border: 1px solid #dce7df;
          border-radius: 14px;
          padding: 20px;
          min-width: 0;
          margin-bottom: 20px;
        }

        .rl-grid .rl-card {
          margin-bottom: 0;
        }

        .rl-kicker {
          color: #197655;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .rl-card h3 {
          font-size: 23px;
          line-height: 1.2;
          margin: 10px 0;
        }

        .rl-description {
          color: #68736d;
          font-size: 13px;
          line-height: 1.65;
          margin-bottom: 20px;
        }

        .rl-scroll {
          overflow-x: auto;
        }

        .rl-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .rl-table th {
          background: #edf5f0;
          color: #52665a;
          padding: 12px 10px;
          font-size: 10px;
          white-space: nowrap;
        }

        .rl-table td {
          padding: 14px 10px;
          font-size: 13px;
          border-bottom:
            1px solid #e2e9e4;
          font-variant-numeric: tabular-nums;
        }

        .rl-rank {
          font-weight: 900;
          color: #68736d;
        }

        .rl-pair strong {
          display: block;
          white-space: nowrap;
        }

        .rl-pair small,
        .rl-subtext {
          display: block;
          color: #68736d;
          font-size: 11px;
          margin-top: 5px;
        }

        .rl-value {
          color: #197655;
          font-size: 16px;
          font-weight: 900;
          white-space: nowrap;
        }

        .rl-table .rl-empty {
          padding: 30px 12px;
          text-align: center;
          color: #68736d;
          font-size: 12px;
        }

        .rl-full {
          margin-top: 20px;
        }

        .rl-full .rl-table {
          min-width: 650px;
        }

        @media (max-width: 800px) {
          .rl-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .rl-card {
            padding: 15px;
          }
        }
      `}</style>

      <div className="rl-header">
        <div
          style={{
            color: "#48d6a8",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 2,
          }}
        >
          THE BOYS • THE RECEIPTS
        </div>

        <h2>RIVALRY RECORD BOOK</h2>

        <p
          style={{
            color: "#c5d4cd",
            lineHeight: 1.7,
          }}
        >
          The beatdowns, heartbreakers,
          winning streaks and personal
          vendettas that define league history.
        </p>
      </div>

      <div className="rl-grid">
        <MetricLeaderboard
          kicker="THE LONGEST-RUNNING BEEF"
          title="MOST PLAYED RIVALRIES"
          description="Manager pairs with the most official meetings."
          metric="GAMES"
          entries={
            leaderboards.mostPlayed
          }
        />

        <MetricLeaderboard
          kicker="POSTSEASON HISTORY"
          title="MOST PLAYOFF MEETINGS"
          description="Rivalries that have repeatedly met in the championship bracket."
          metric="GAMES"
          entries={
            leaderboards.mostPlayoffMeetings
          }
        />

        <MetricLeaderboard
          kicker="RENT FREE"
          title="LONGEST WINNING STREAKS"
          description="The longest consecutive winning streaks against a single opponent."
          metric="WINS"
          entries={
            leaderboards.longestWinningStreaks
          }
        />

        <MetricLeaderboard
          kicker="THE STREAK CONTINUES"
          title="ACTIVE WINNING STREAKS"
          description="Current consecutive rivalry wins as of the latest verified results."
          metric="WINS"
          entries={
            leaderboards.activeWinningStreaks
          }
        />

        <MetricLeaderboard
          kicker="ABSOLUTE OWNERSHIP"
          title="MOST WINS VS. ONE OPPONENT"
          description="The managers with the most lifetime wins against a specific active opponent."
          metric="WINS"
          entries={
            leaderboards.mostWinsAgainstOpponent
          }
        />

        <MetricLeaderboard
          kicker="WHEN IT MATTERS MOST"
          title="PLAYOFF DOMINANCE"
          description="The most championship-bracket wins against one active opponent."
          metric="WINS"
          entries={
            leaderboards
              .mostPlayoffWinsAgainstOpponent
          }
        />
      </div>

      <div className="rl-full">
        <GameLeaderboard
          kicker="ABSOLUTE DESTRUCTION"
          title="BIGGEST RIVALRY BLOWOUTS"
          description="The largest winning margins between active managers."
          meetings={
            leaderboards.biggestBlowouts
          }
        />

        <GameLeaderboard
          kicker="HEARTBREAK HOTEL"
          title="CLOSEST RIVALRY MATCHUPS"
          description="The smallest decided margins, including official playoff tiebreakers."
          meetings={
            leaderboards.closestGames
          }
        />

        <LeaderboardTable
          kicker="ALL GAS, NO BRAKES"
          title="HIGHEST SCORING BATTLES"
          description="The highest combined scores from two active managers in a single official matchup."
          headings={[
            "MATCHUP",
            "SEASON",
            "FINAL SCORE",
            "COMBINED POINTS",
          ]}
          rows={
            leaderboards.highestCombinedScores
              .map(game => [
                <PairName
                  key="pair"
                  first={managerName(
                    game.managerId
                  )}
                  second={managerName(
                    game.opponentId
                  )}
                />,

                <div key="date">
                  {game.season} / W{game.week}

                  <small className="rl-subtext">
                    {game.isPlayoffs
                      ? "Playoffs"
                      : "Regular season"}
                  </small>
                </div>,

                `${game.points.toFixed(2)} - ` +
                  game.opponentPoints.toFixed(2),

                <strong
                  key="total"
                  className="rl-value"
                >
                  {game.combinedPoints
                    .toFixed(2)}
                </strong>,
              ])
          }
        />

        <LeaderboardTable
          kicker="SOMEBODY HAS TO BLINK"
          title="MOST COMPETITIVE RIVALRIES"
          description="The closest lifetime records among manager pairs with at least five official meetings."
          headings={[
            "RIVALRY",
            "GAMES",
            "RECORD",
            "WIN SHARE",
          ]}
          rows={
            leaderboards
              .mostCompetitiveRivalries
              .map(entry => [
                <PairName
                  key="pair"
                  first={entry.managerName}
                  second={entry.opponentName}
                />,

                entry.games,

                `${entry.wins}-${entry.losses}-${entry.ties}`,

                <strong
                  key="balance"
                  className="rl-value"
                >
                  {(
                    (
                      entry.wins +
                      entry.ties * 0.5
                    ) /
                    entry.games *
                    100
                  ).toFixed(1)}%
                </strong>,
              ])
          }
        />
      </div>

      <p
        style={{
          color: "#68736d",
          fontSize: 12,
          lineHeight: 1.7,
        }}
      >
        Rivalry leaderboards include
        active-manager pairings only.
        Matchup-based rankings count
        each game once.
        Equal values are ordered
        deterministically for display.
      </p>
    </div>
  );
}
