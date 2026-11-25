
export type SeasonStandingRow = {
  managerId: string;
  managerName: string;
  teamName: string;
  regularSeasonRank: number;
  finalRank: number | null;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
  playoffQualified: boolean;
  activeManager: boolean;
};

type Props = {
  year: number;
  standings?: readonly SeasonStandingRow[];
  seasonComplete?: boolean;
};

export default function SeasonStandings({
  year,
  standings = [],
  seasonComplete = false,
}: Props) {
  const rows = [...standings].sort(
    (a, b) =>
      a.regularSeasonRank -
      b.regularSeasonRank
  );

  return (
    <section
      style={{
        background: "#ffffff",
        color: "#14251f",
        border: "1px solid #dce7df",
        borderRadius: 16,
        overflow: "hidden",
        marginTop: 24,
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
            color: "#48d6a8",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          THE OFFICIAL RECORD • {year}
        </div>

        <h2 style={{ margin: "12px 0" }}>
          {seasonComplete
            ? "FINAL SEASON STANDINGS"
            : "SEASON STANDINGS"}
        </h2>

        <p style={{ color: "#c5d4cd" }}>
          Regular-season performance and
          championship-bracket results.
        </p>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            minWidth: 950,
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr>
              {[
                "SEED",
                "TEAM / MANAGER",
                "W-L-T",
                "WIN %",
                "POINTS FOR",
                "POINTS AGAINST",
                "POINT DIFF.",
                "PPG",
                "FINAL PLACE",
              ].map(label => (
                <th
                  key={label}
                  style={{
                    padding: "14px 12px",
                    background: "#edf5f0",
                    color: "#52665a",
                    fontSize: 11,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  style={{
                    padding: 35,
                    textAlign: "center",
                    color: "#68736d",
                    fontSize: 13,
                  }}
                >
                  Awaiting verified and authorized
                  {` ${year} `}standings.
                </td>
              </tr>
            ) : (
              rows.map(row => {
                const games =
                  row.wins +
                  row.losses +
                  row.ties;

                const winPercentage =
                  games > 0
                    ? (
                        (row.wins +
                          row.ties * 0.5) /
                        games
                      ) * 100
                    : null;

                const ppg =
                  games > 0
                    ? row.pointsFor / games
                    : null;

                const cells = [
                  `${row.wins}-${row.losses}-${row.ties}`,

                  winPercentage === null
                    ? "—"
                    : `${winPercentage.toFixed(1)}%`,

                  row.pointsFor.toFixed(2),

                  row.pointsAgainst.toFixed(2),

                  (
                    row.pointsFor -
                    row.pointsAgainst
                  ).toFixed(2),

                  ppg === null
                    ? "—"
                    : ppg.toFixed(2),

                  row.finalRank === 1
                    ? "🏆 Champion"
                    : row.finalRank === 2
                      ? "Runner-up"
                      : row.finalRank !== null
                        ? `#${row.finalRank}`
                        : "—",
                ];

                return (
                  <tr
                    key={row.managerId}
                    style={{
                      background:
                        row.finalRank === 1
                          ? "#f0f8ee"
                          : "#ffffff",
                      borderBottom:
                        "1px solid #e2e9e4",
                    }}
                  >
                    <td
                      style={{
                        padding: 14,
                        fontWeight: 900,
                        color:
                          row.playoffQualified
                            ? "#197655"
                            : "#68736d",
                      }}
                    >
                      #{row.regularSeasonRank}
                    </td>

                    <td
                      style={{
                        padding: 14,
                        whiteSpace: "nowrap",
                      }}
                    >
                      <strong>
                        {row.teamName}
                      </strong>

                      <div
                        style={{
                          fontSize: 12,
                          color: "#68736d",
                          marginTop: 5,
                        }}
                      >
                        {row.managerName}

                        {!row.activeManager &&
                          " • Former manager"}
                      </div>
                    </td>

                    {cells.map((value, index) => (
                      <td
                        key={index}
                        style={{
                          padding: 14,
                          fontSize: 13,
                          whiteSpace: "nowrap",
                          fontVariantNumeric:
                            "tabular-nums",
                        }}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div
        style={{
          padding: 18,
          fontSize: 12,
          color: "#68736d",
          lineHeight: 1.7,
        }}
      >
        Green seed numbers identify
        championship-playoff qualifiers.
        Historical standings preserve
        participating managers and original
        team names, including former managers.
        Regular-season statistics exclude
        consolation games.
      </div>
    </section>
  );
}
