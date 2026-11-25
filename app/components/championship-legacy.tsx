
import type {
  calculateChampionshipHistory,
} from "../../lib/championship-history";

type ChampionshipHistory =
  ReturnType<
    typeof calculateChampionshipHistory
  >;

export type ChampionshipFinal = {
  season: number;

  championId: string;
  championName: string;
  championTeamName: string;
  championPoints: number;

  runnerUpId: string;
  runnerUpName: string;
  runnerUpTeamName: string;
  runnerUpPoints: number;
};

type Props = {
  history?: ChampionshipHistory | null;

  finals?: readonly ChampionshipFinal[];
};

export default function ChampionshipLegacy({
  history = null,
  finals = [],
}: Props) {
  const managers =
    history?.managerChampionships ?? [];

  function leaders(
    metric:
      | "championships"
      | "championshipAppearances"
      | "runnerUpFinishes"
      | "longestTitleStreak"
  ) {
    const maximum = Math.max(
      0,
      ...managers.map(
        manager => manager[metric]
      )
    );

    if (maximum === 0) {
      return {
        value: history ? "0" : "—",
        names: history
          ? "No qualifying record"
          : "Awaiting historical data",
      };
    }

    return {
      value: String(maximum),

      names: managers
        .filter(
          manager =>
            manager[metric] === maximum
        )
        .map(
          manager => manager.managerName
        )
        .join(" / "),
    };
  }

  const highlights = [
    {
      title: "MOST CHAMPIONSHIPS",
      ...leaders("championships"),
    },
    {
      title: "MOST FINALS",
      ...leaders(
        "championshipAppearances"
      ),
    },
    {
      title: "MOST RUNNER-UP FINISHES",
      ...leaders("runnerUpFinishes"),
    },
    {
      title: "CONSECUTIVE TITLES",
      ...leaders("longestTitleStreak"),
    },
  ];

  const sortedFinals = [...finals].sort(
    (a, b) => b.season - a.season
  );

  return (
    <section
      style={{
        marginTop: 30,
        background: "#ffffff",
        color: "#14251f",
        border: "1px solid #e2e9e4",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "#14251f",
          color: "#ffffff",
          padding: 24,
        }}
      >
        <div
          style={{
            color: "#e9c875",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          THE BOYS • CHAMPIONSHIP LEGACY
        </div>

        <h2
          style={{
            fontSize:
              "clamp(26px, 4vw, 38px)",
            margin: "12px 0",
          }}
        >
          THE ROAD TO THE RAFTERS
        </h2>

        <p
          style={{
            color: "#c5d4cd",
            lineHeight: 1.6,
          }}
        >
          Celebrating the managers who
          reached the biggest stage in
          league history.
        </p>
      </div>

      <div style={{ padding: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
            gap: 12,
          }}
        >
          {highlights.map(item => (
            <div
              key={item.title}
              style={{
                background: "#f4f8f5",
                border: "1px solid #e2e9e4",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div
                style={{
                  color: "#52665a",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {item.title}
              </div>

              <div
                style={{
                  color: "#197655",
                  fontSize: 42,
                  fontWeight: 900,
                  margin: "8px 0",
                }}
              >
                {item.value}
              </div>

              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {item.names}
              </div>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: 30 }}>
          CHAMPIONSHIP HISTORY
        </h3>

        <div
          style={{
            display: "grid",
            gap: 14,
            marginTop: 16,
          }}
        >
          {sortedFinals.length === 0 ? (
            <div
              style={{
                background: "#f4f8f5",
                padding: 30,
                textAlign: "center",
                borderRadius: 12,
                color: "#68736d",
                fontSize: 13,
              }}
            >
              Awaiting verified championship
              results from 2020 onward.
            </div>
          ) : (
            sortedFinals.map(final => (
              <article
                key={final.season}
                style={{
                  border: "1px solid #dce7df",
                  borderRadius: 12,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#263d32",
                    color: "#ffffff",
                    padding: "10px 16px",
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  {final.season} CHAMPIONSHIP
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
                  }}
                >
                  <div
                    style={{
                      background: "#edf8f1",
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        color: "#987322",
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      🏆 CHAMPION
                    </div>

                    <h3>
                      {final.championTeamName}
                    </h3>

                    <p>
                      {final.championName}
                    </p>

                    <strong
                      style={{
                        fontSize: 32,
                        color: "#197655",
                      }}
                    >
                      {final.championPoints.toFixed(2)}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        color: "#68736d",
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      RUNNER-UP
                    </div>

                    <h3>
                      {final.runnerUpTeamName}
                    </h3>

                    <p>
                      {final.runnerUpName}
                    </p>

                    <strong
                      style={{
                        fontSize: 32,
                      }}
                    >
                      {final.runnerUpPoints.toFixed(2)}
                    </strong>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
