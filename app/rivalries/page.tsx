
import Link from "next/link";

import {
  ACTIVE_MANAGERS,
  LEAGUE_START_YEAR,
} from "../../lib/league-managers";

import {
  calculateLifetimeRecords,
  type HistoricalGame,
} from "../../lib/lifetime-records";

import {
  calculateRivalryRecords,
} from "../../lib/rivalry-records";

import {
  buildRivalryLeaderboards,
} from "../../lib/rivalry-leaderboards";

import RivalryComparison
  from "../components/rivalry-comparison";

import RivalryMatrix
  from "../components/rivalry-matrix";

import RivalryLeaderboards
  from "../components/rivalry-leaderboards";

export const dynamic = "force-dynamic";

// Live historical data remains disconnected
// until verification and authorization.
//
// Do not replace this with an unrestricted
// Yahoo retrieval or persistent data source.

const historicalGames:
  readonly HistoricalGame[] = [];

const historicalCoverageVerified = false;

const publicationAuthorized = false;

function CareerStandings({
  games,
  verified,
}: {
  games: readonly HistoricalGame[];
  verified: boolean;
}) {
  const results =
    calculateLifetimeRecords(
      verified ? games : []
    );

  return (
    <section
      className="card"
      style={{ marginTop: 24 }}
    >
      <div className="label">
        ALL-TIME MATCHUP HISTORY
      </div>

      <h2 style={{ marginTop: 10 }}>
        MANAGER CAREER STANDINGS
      </h2>

      <p
        className="muted"
        style={{ lineHeight: 1.7 }}
      >
        Career records for the active
        managers, including official
        historical games against
        former league members.
      </p>

      <div
        style={{
          overflowX: "auto",
          marginTop: 20,
        }}
      >
        <table
          style={{
            width: "100%",
            minWidth: 850,
            borderCollapse: "collapse",
            textAlign: "left",
            fontVariantNumeric:
              "tabular-nums",
          }}
        >
          <thead>
            <tr>
              {[
                "MANAGER",
                "WINS",
                "LOSSES",
                "TIES",
                "WIN %",
                "GAMES",
                "POINTS FOR",
                "PLAYOFF WINS",
              ].map(heading => (
                <th
                  key={heading}
                  scope="col"
                  style={{
                    background: "#edf5f0",
                    color: "#52665a",
                    padding: "14px 12px",
                    fontSize: 11,
                    whiteSpace: "nowrap",
                  }}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {results.managers.map(
              manager => {
                const career =
                  manager.career;

                const hasGames =
                  verified &&
                  career.games > 0;

                const cells = [
                  career.wins,
                  career.losses,
                  career.ties,

                  career.winPercentage === null
                    ? "—"
                    : `${career.winPercentage
                        .toFixed(1)}%`,

                  career.games,

                  career.pointsFor
                    .toFixed(2),

                  manager.playoffs.wins,
                ];

                return (
                  <tr
                    key={manager.managerId}
                    style={{
                      borderBottom:
                        "1px solid #e2e9e4",
                    }}
                  >
                    <td
                      style={{
                        padding: "14px 12px",
                        fontWeight: 800,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {manager.name}
                    </td>

                    {cells.map(
                      (value, index) => (
                        <td
                          key={index}
                          style={{
                            padding: "14px 12px",
                            fontSize: 13,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {hasGames
                            ? value
                            : "—"}
                        </td>
                      )
                    )}
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function RivalriesPage() {
  const mayUseHistoricalData =
    historicalCoverageVerified &&
    publicationAuthorized;

  const rivalryResults =
    calculateRivalryRecords(
      mayUseHistoricalData
        ? historicalGames
        : [],
      mayUseHistoricalData
    );

  const records =
    rivalryResults.verified
      ? rivalryResults.records
      : [];

  const leaderboards =
    buildRivalryLeaderboards(
      records,
      rivalryResults.verified
    );

  const managerCount =
    ACTIVE_MANAGERS.length;

  const possibleRivalries =
    managerCount *
    (managerCount - 1) / 2;

  const navigation = [
    {
      label: "Head-to-Head HQ",
      href: "#comparison",
    },
    {
      label: "Rivalry Matrix",
      href: "#matrix",
    },
    {
      label: "Career Standings",
      href: "#career-standings",
    },
    {
      label: "Rivalry Records",
      href: "#rivalry-records",
    },
  ];

  const heroStats = [
    {
      label: "ACTIVE MANAGERS",
      value: managerCount,
    },
    {
      label: "POSSIBLE RIVALRIES",
      value: possibleRivalries,
    },
    {
      label: "LEAGUE ESTABLISHED",
      value: LEAGUE_START_YEAR,
    },
    {
      label: "VERIFIED RIVALRY GAMES",
      value:
        rivalryResults.verified
          ? rivalryResults.activeRivalryGames
          : "—",
    },
  ];

  return (
    <main className="shell">
      <style>{`
        .rivalry-anchor {
          scroll-margin-top: 145px;
        }

        .rivalry-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 24px 0;
        }

        .rivalry-nav a {
          background: #263d32;
          color: #ffffff;
          font-size: 12px;
          font-weight: 800;
          padding: 12px 16px;
          border-radius: 999px;
          text-decoration: none;
        }

        .rivalry-nav a:hover {
          background: #197655;
        }

        .rivalry-nav a:focus-visible {
          outline: 2px solid #c9a64b;
          outline-offset: 3px;
        }

        .rivalry-hero-grid {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-top: 24px;
        }

        .rivalry-hero-stat {
          background: #20382e;
          border: 1px solid #476055;
          border-radius: 10px;
          padding: 18px;
        }

        .rivalry-hero-stat-label {
          color: #c5d4cd;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .rivalry-hero-stat-value {
          color: #48d6a8;
          font-size: 36px;
          font-weight: 900;
          margin-top: 10px;
        }

        @media (max-width: 800px) {
          .rivalry-hero-grid {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>

      <div className="kicker">
        THE BOYS • FANTASY FOOTBALL • EST. 2020
      </div>

      <h1>LEAGUE RIVALRIES</h1>

      <p
        className="muted"
        style={{ fontSize: 17 }}
      >
        Friendships are temporary.
        Fantasy football receipts
        are forever.
      </p>

      <section
        style={{
          background: "#14251f",
          color: "#ffffff",
          padding:
            "clamp(18px, 4vw, 32px)",
          borderRadius: 16,
          marginTop: 25,
        }}
      >
        <div
          style={{
            color: "#48d6a8",
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: 2,
          }}
        >
          THE BOYS • HEAD-TO-HEAD HISTORY
        </div>

        <h2
          style={{
            fontSize:
              "clamp(36px, 6vw, 64px)",
            lineHeight: 1.05,
            margin: "16px 0",
          }}
        >
          EVERY MATCHUP.
          <br />
          EVERY RECEIPT.
        </h2>

        <p
          style={{
            color: "#c5d4cd",
            maxWidth: 760,
            lineHeight: 1.8,
          }}
        >
          From the inaugural 2020 season
          onward, every official meeting
          adds another chapter to league
          history. Compare managers,
          revisit old battles and find
          out who really owns the rivalry.
        </p>

        <div className="rivalry-hero-grid">
          {heroStats.map(stat => (
            <div
              key={stat.label}
              className="rivalry-hero-stat"
            >
              <div className="rivalry-hero-stat-label">
                {stat.label}
              </div>

              <div className="rivalry-hero-stat-value">
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </section>

      {!rivalryResults.verified && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            background: "#edf5f0",
            color: "#52665a",
            border: "1px solid #dce7df",
            borderRadius: 10,
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          <strong>
            Historical results pending.
          </strong>

          {" "}The rivalry interface is
          available, but historical
          statistics will remain empty
          until the required data
          verification and publication
          authorization are complete.
        </div>
      )}

      <nav
        className="rivalry-nav"
        aria-label="Rivalry page sections"
      >
        {navigation.map(item => (
          <a
            key={item.href}
            href={item.href}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div
        id="comparison"
        className="rivalry-anchor"
      >
        <RivalryComparison
          records={records}
        />
      </div>

      <div
        id="matrix"
        className="rivalry-anchor"
      >
        <RivalryMatrix
          records={records}
        />
      </div>

      <div
        id="career-standings"
        className="rivalry-anchor"
      >
        <CareerStandings
          games={
            mayUseHistoricalData
              ? historicalGames
              : []
          }
          verified={
            rivalryResults.verified
          }
        />
      </div>

      <div
        id="rivalry-records"
        className="rivalry-anchor"
      >
        <RivalryLeaderboards
          leaderboards={leaderboards}
        />
      </div>

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <div className="label">
          THE OFFICIAL RECORD
        </div>

        <h2>RIVALRY TRACKING RULES</h2>

        <div
          style={{
            lineHeight: 1.8,
          }}
        >
          <p className="muted">
            Historical records begin
            with the 2020 season.
            Regular-season and
            championship-bracket
            matchups count toward
            official statistics.
          </p>

          <p className="muted">
            Consolation and placement
            games are excluded from
            official rivalry statistics.
          </p>

          <p className="muted">
            Only active managers appear
            in the head-to-head matrix
            and rivalry leaderboards.
            Games against former managers
            still count toward active
            managers&apos; career records.
          </p>

          <p className="muted">
            Rivalry winning streaks
            count consecutive meetings
            between the same managers,
            even across different seasons.
            A loss or tie ends a
            winning streak.
          </p>

          <p className="muted">
            Official playoff tiebreakers
            count as wins and losses
            rather than tied results.
            Regular-season ties count
            as half a win when calculating
            win percentages.
          </p>

          <p className="muted">
            The most competitive rivalry
            rankings require at least
            five official meetings.
          </p>
        </div>
      </section>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 28,
        }}
      >
        <Link
          href="/records"
          className="button"
        >
          All-Time Record Book
        </Link>

        <Link
          href="/rafters"
          className="button"
        >
          Championship Rafters
        </Link>

        <Link
          href="/seasons"
          className="button"
        >
          Season Archives
        </Link>

        <Link
          href="/"
          className="button"
        >
          🏠 League HQ
        </Link>
      </div>
    </main>
  );
}
