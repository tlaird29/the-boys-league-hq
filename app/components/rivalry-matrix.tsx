
import {
  ACTIVE_MANAGERS,
} from "../../lib/league-managers";

import {
  getRivalryRecord,
  type RivalryRecord,
} from "../../lib/rivalry-records";

type Props = {
  records?: readonly RivalryRecord[];
};

export default function RivalryMatrix({
  records = [],
}: Props) {
  return (
    <section className="rm-root">
      <style>{`
        .rm-root {
          background: #ffffff;
          color: #14251f;
          border: 1px solid #dce7df;
          border-radius: 16px;
          padding: 24px;
          margin-top: 24px;
        }

        .rm-scroll {
          overflow-x: auto;
          margin-top: 22px;
        }

        .rm-table {
          width: 100%;
          min-width: 1100px;
          border-collapse: separate;
          border-spacing: 0;
          font-variant-numeric: tabular-nums;
        }

        .rm-table th {
          background: #14251f;
          color: #ffffff;
          padding: 15px 12px;
          font-size: 11px;
          white-space: nowrap;
          text-align: center;
        }

        .rm-table td {
          padding: 17px 12px;
          font-size: 13px;
          font-weight: 800;
          text-align: center;
          border-bottom:
            1px solid #e2e9e4;
          border-right:
            1px solid #e2e9e4;
          white-space: nowrap;
        }

        .rm-table th:first-child,
        .rm-table td:first-child {
          position: sticky;
          left: 0;
          z-index: 1;
          text-align: left;
          min-width: 150px;
        }

        .rm-table td:first-child {
          background: #edf5f0;
          color: #14251f;
        }

        .rm-table th:first-child {
          z-index: 2;
        }

        .rm-table tbody tr:hover td {
          box-shadow:
            inset 0 2px 0 #c6dcd0,
            inset 0 -2px 0 #c6dcd0;
        }

        .rm-win {
          background: #e3f5e9;
          color: #197655;
        }

        .rm-loss {
          background: #fbe9e9;
          color: #a43737;
        }

        .rm-even {
          background: #f5f2e8;
          color: #75602c;
        }

        .rm-empty {
          background: #ffffff;
          color: #9aa69e;
        }

        .rm-self {
          background: #e2e9e4;
          color: #68736d;
        }

        .rm-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 18px;
          font-size: 12px;
          font-weight: 700;
        }

        .rm-legend span {
          padding: 7px 10px;
          border-radius: 5px;
        }

        @media (max-width: 600px) {
          .rm-root {
            padding: 15px;
          }
        }
      `}</style>

      <div className="label">
        THE ULTIMATE SCORECARD
      </div>

      <h2 style={{ marginTop: 10 }}>
        HEAD-TO-HEAD MATRIX
      </h2>

      <p
        style={{
          color: "#68736d",
          lineHeight: 1.7,
        }}
      >
        Each row represents a manager&apos;s
        lifetime record against every
        other active manager.
        Read each cell from the row
        manager&apos;s perspective.
      </p>

      <div className="rm-scroll">
        <table className="rm-table">
          <thead>
            <tr>
              <th scope="col">
                MANAGER
              </th>

              {ACTIVE_MANAGERS.map(
                manager => (
                  <th
                    key={manager.id}
                    scope="col"
                    title={manager.name}
                  >
                    {manager.displayName}
                  </th>
                )
              )}
            </tr>
          </thead>

          <tbody>
            {ACTIVE_MANAGERS.map(
              manager => (
                <tr key={manager.id}>
                  <td>{manager.name}</td>

                  {ACTIVE_MANAGERS.map(
                    opponent => {
                      if (
                        manager.id ===
                        opponent.id
                      ) {
                        return (
                          <td
                            key={opponent.id}
                            className="rm-self"
                          >
                            —
                          </td>
                        );
                      }

                      const record =
                        getRivalryRecord(
                          records,
                          manager.id,
                          opponent.id
                        );

                      const totals =
                        record?.combined;

                      const hasGames =
                        (totals?.games ?? 0) > 0;

                      const className =
                        !hasGames || !totals
                          ? "rm-empty"
                          : totals.wins >
                              totals.losses
                            ? "rm-win"
                            : totals.wins <
                                totals.losses
                              ? "rm-loss"
                              : "rm-even";

                      const display =
                        hasGames && totals
                          ? `${totals.wins}-${totals.losses}` +
                            (
                              totals.ties
                                ? `-${totals.ties}`
                                : ""
                            )
                          : "—";

                      const description =
                        hasGames && totals
                          ? `${manager.name} vs. ${opponent.name}: ` +
                            `${totals.wins} wins, ` +
                            `${totals.losses} losses, ` +
                            `${totals.ties} ties.`
                          : `${manager.name} vs. ${opponent.name}: ` +
                            "No verified meetings.";

                      return (
                        <td
                          key={opponent.id}
                          className={className}
                          title={description}
                          aria-label={description}
                        >
                          {display}
                        </td>
                      );
                    }
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <div className="rm-legend">
        <span className="rm-win">
          Winning record
        </span>

        <span className="rm-loss">
          Losing record
        </span>

        <span className="rm-even">
          Even record
        </span>

        <span className="rm-empty">
          — No verified meetings
        </span>
      </div>

      <p
        style={{
          fontSize: 12,
          color: "#68736d",
          lineHeight: 1.7,
          marginTop: 18,
        }}
      >
        Records include regular-season
        and championship-playoff meetings.
        Consolation games are excluded.
        Former managers do not appear
        in the active-manager matrix.
      </p>
    </section>
  );
}
