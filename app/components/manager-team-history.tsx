
import {
  ACTIVE_MANAGERS,
} from "../../lib/league-managers";

import type {
  calculateAllTimeRecords,
} from "../../lib/all-time-records";

import type {
  HistoricalGame,
} from "../../lib/lifetime-records";

type AllTimeRecords =
  ReturnType<typeof calculateAllTimeRecords>;

type Props = {
  records?: AllTimeRecords | null;

  games?: readonly HistoricalGame[];
};

export default function ManagerTeamHistory({
  records = null,
  games = [],
}: Props) {
  return (
    <section
      style={{
        marginTop: 30,
        background: "#ffffff",
        color: "#14251f",
        border: "1px solid #e2e9e4",
        borderRadius: 16,
        padding: 20,
      }}
    >
      <div
        style={{
          color: "#52665a",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.5,
        }}
      >
        THE BOYS • MANAGER ARCHIVES
      </div>

      <h2
        style={{
          margin: "10px 0",
        }}
      >
        EVERY MANAGER. EVERY ERA.
      </h2>

      <p
        style={{
          color: "#68736d",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        Explore the team names, career
        accomplishments and championship
        seasons of each active manager.
      </p>

      <div
        style={{
          display: "grid",
          gap: 10,
          marginTop: 20,
        }}
      >
        {ACTIVE_MANAGERS.map(manager => {
          const profile =
            records?.managerProfiles.find(
              item =>
                item.managerId === manager.id
            );

          const stats =
            profile?.statistics;

          const championships =
            profile?.championships;

          const titles =
            new Set(
              championships
                ?.championshipSeasons ?? []
            );

          const teamNamesByYear =
            new Map<number, Set<string>>();

          for (const game of games) {
            for (
              const team of [game.a, game.b]
            ) {
              if (
                team.managerId !== manager.id
              ) {
                continue;
              }

              const names =
                teamNamesByYear.get(
                  game.season
                ) ?? new Set<string>();

              names.add(team.teamName);

              teamNamesByYear.set(
                game.season,
                names
              );
            }
          }

          const seasons =
            [...teamNamesByYear.entries()]
              .sort(
                (a, b) => b[0] - a[0]
              );

          const metrics = [
            {
              label: "CAREER WINS",
              value:
                stats?.career.wins ?? "—",
            },
            {
              label: "CAREER POINTS",
              value:
                stats?.career.pointsFor
                  .toLocaleString(
                    "en-US",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  ) ?? "—",
            },
            {
              label: "CHAMPIONSHIPS",
              value:
                championships
                  ?.championships ?? "—",
            },
            {
              label: "PLAYOFF WINS",
              value:
                stats?.playoffs.wins ?? "—",
            },
          ];

          return (
            <details
              key={manager.id}
              style={{
                border: "1px solid #dce7df",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <summary
                style={{
                  padding: 18,
                  cursor: "pointer",
                  background: "#f4f8f5",
                }}
              >
                <strong>
                  {manager.name}
                </strong>

                {manager.commissioner && (
                  <span
                    style={{
                      color: "#197655",
                      fontSize: 11,
                      fontWeight: 800,
                      marginLeft: 10,
                    }}
                  >
                    COMMISSIONER
                  </span>
                )}
              </summary>

              <div
                style={{
                  padding: 18,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 140px), 1fr))",
                    gap: 10,
                  }}
                >
                  {metrics.map(metric => (
                    <div
                      key={metric.label}
                      style={{
                        background: "#14251f",
                        color: "#ffffff",
                        borderRadius: 10,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          color: "#c5d4cd",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        {metric.label}
                      </div>

                      <div
                        style={{
                          color: "#48d6a8",
                          fontSize: 25,
                          fontWeight: 900,
                          marginTop: 8,
                        }}
                      >
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>

                <h3
                  style={{ marginTop: 24 }}
                >
                  HISTORICAL TEAM NAMES
                </h3>

                {seasons.length === 0 ? (
                  <p
                    style={{
                      color: "#68736d",
                      fontSize: 13,
                    }}
                  >
                    Awaiting verified team
                    name history.
                  </p>
                ) : (
                  seasons.map(
                    ([year, names]) => (
                      <div
                        key={year}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          flexWrap: "wrap",
                          gap: 16,
                          padding: "14px 0",
                          borderBottom:
                            "1px solid #e2e9e4",
                        }}
                      >
                        <strong>
                          {year}
                        </strong>

                        <span
                          style={{
                            flex: 1,
                            fontSize: 13,
                          }}
                        >
                          {[...names].join(" / ")}
                        </span>

                        {titles.has(year) && (
                          <strong
                            style={{
                              color: "#987322",
                              fontSize: 11,
                            }}
                          >
                            🏆 CHAMPION
                          </strong>
                        )}
                      </div>
                    )
                  )
                )}
              </div>
            </details>
          );
        })}
      </div>
    </section>
  );
}
