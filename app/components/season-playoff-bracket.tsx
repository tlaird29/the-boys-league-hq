
export type PlayoffTeam = {
  managerId: string;
  managerName: string;
  teamName: string;
  seed: number;
  points: number;
};

export type PlayoffMatchup = {
  id: string;
  week: number;

  round:
    | "quarterfinal"
    | "semifinal"
    | "championship";

  slot: number;
  teamA: PlayoffTeam;
  teamB: PlayoffTeam;
  winnerManagerId: string;
};

type Props = {
  year: number;
  matchups?: readonly PlayoffMatchup[];
};

function MatchupCard({
  matchup,
  label,
}: {
  matchup?: PlayoffMatchup;
  label: string;
}) {
  const teams = matchup
    ? [matchup.teamA, matchup.teamB]
    : [null, null];

  return (
    <div className="pb-matchup">
      <div className="pb-matchup-label">
        {label}

        {matchup &&
          ` • WEEK ${matchup.week}`}
      </div>

      {teams.map((team, index) => {
        const winner =
          team !== null &&
          matchup?.winnerManagerId ===
            team.managerId;

        return (
          <div
            key={index}
            className={
              winner
                ? "pb-team pb-winner"
                : "pb-team"
            }
          >
            <div className="pb-seed">
              {team?.seed ?? "—"}
            </div>

            <div className="pb-team-info">
              <strong>
                {team?.teamName ??
                  "Awaiting results"}
              </strong>

              <small>
                {team?.managerName ??
                  "Unconfirmed"}
              </small>
            </div>

            <div className="pb-points">
              {team
                ? team.points.toFixed(2)
                : "—"}

              {winner && (
                <small>WINNER</small>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function SeasonPlayoffBracket({
  year,
  matchups = [],
}: Props) {
  const rounds = [
    {
      id: "quarterfinal",
      title: "QUARTERFINALS",
      count: 4,
    },
    {
      id: "semifinal",
      title: "SEMIFINALS",
      count: 2,
    },
    {
      id: "championship",
      title: "CHAMPIONSHIP",
      count: 1,
    },
  ] as const;

  const final = matchups.find(
    item =>
      item.round === "championship" &&
      item.slot === 1
  );

  const champion = final
    ? [final.teamA, final.teamB].find(
        team =>
          team.managerId ===
          final.winnerManagerId
      )
    : undefined;

  return (
    <section className="pb-root">
      <style>{`
        .pb-root {
          margin-top: 24px;
          padding: 24px;
          background: #14251f;
          color: #ffffff;
          border-radius: 16px;
        }

        .pb-kicker {
          color: #48d6a8;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .pb-root h2 {
          font-size: clamp(28px, 4vw, 42px);
          margin: 12px 0;
        }

        .pb-description {
          color: #c5d4cd;
          font-size: 14px;
          line-height: 1.7;
        }

        .pb-scroll {
          overflow-x: auto;
          padding: 20px 0;
        }

        .pb-grid {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(245px, 1fr));
          gap: 36px;
          min-width: 820px;
        }

        .pb-round {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .pb-round-title {
          color: #e9c875;
          text-align: center;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.5px;
          padding-bottom: 18px;
        }

        .pb-round-games {
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          flex: 1;
          gap: 22px;
        }

        .pb-matchup {
          background: #20382e;
          border: 1px solid #476055;
          border-radius: 10px;
          overflow: hidden;
        }

        .pb-matchup-label {
          background: #263d32;
          padding: 9px 12px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          color: #c5d4cd;
        }

        .pb-team {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 13px 10px;
          border-top: 1px solid #476055;
          min-height: 65px;
        }

        .pb-winner {
          background: #284b3c;
          box-shadow:
            inset 3px 0 0 #48d6a8;
        }

        .pb-seed {
          color: #c5d4cd;
          font-size: 12px;
          font-weight: 800;
          min-width: 15px;
        }

        .pb-team-info {
          flex: 1;
          min-width: 0;
          overflow-wrap: anywhere;
          font-size: 12px;
        }

        .pb-team-info small {
          display: block;
          color: #c5d4cd;
          font-size: 10px;
          margin-top: 5px;
        }

        .pb-points {
          color: #ffffff;
          font-weight: 900;
          font-size: 15px;
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .pb-winner .pb-points {
          color: #48d6a8;
        }

        .pb-points small {
          display: block;
          font-size: 8px;
          letter-spacing: 1px;
          margin-top: 5px;
        }

        .pb-champion {
          text-align: center;
          background: #20382e;
          border: 1px solid #c9a64b;
          border-radius: 12px;
          padding: 26px;
          margin-top: 18px;
        }

        .pb-champion-label {
          color: #e9c875;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .pb-champion h3 {
          font-size: 28px;
          margin: 12px 0;
        }

        @media (max-width: 600px) {
          .pb-root {
            padding: 15px;
          }
        }
      `}</style>

      <div className="pb-kicker">
        THE ROAD TO THE RAFTERS • {year}
      </div>

      <h2>THE CHAMPIONSHIP BRACKET</h2>

      <p className="pb-description">
        Eight contenders. Three rounds.
        Seven championship-bracket matchups.
        One champion. No first-round byes.
      </p>

      <div className="pb-scroll">
        <div className="pb-grid">
          {rounds.map(round => (
            <div
              key={round.id}
              className="pb-round"
            >
              <div className="pb-round-title">
                {round.title}
              </div>

              <div className="pb-round-games">
                {Array.from(
                  { length: round.count },
                  (_, index) => {
                    const slot = index + 1;

                    const matchup =
                      matchups.find(
                        item =>
                          item.round === round.id &&
                          item.slot === slot
                      );

                    return (
                      <MatchupCard
                        key={slot}
                        matchup={matchup}
                        label={
                          round.id ===
                          "championship"
                            ? "TITLE GAME"
                            : `GAME ${slot}`
                        }
                      />
                    );
                  }
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pb-champion">
        <div style={{ fontSize: 42 }}>
          🏆
        </div>

        <div className="pb-champion-label">
          {year} LEAGUE CHAMPION
        </div>

        <h3>
          {champion?.teamName ??
            "AWAITING VERIFIED RESULTS"}
        </h3>

        <p className="pb-description">
          {champion?.managerName ??
            "The championship will be recorded after verification."}
        </p>
      </div>

      <p
        className="pb-description"
        style={{ fontSize: 12 }}
      >
        Only championship-bracket matchups
        appear here. Consolation and
        placement games are excluded.
        Scroll horizontally on smaller
        screens to explore all three rounds.
      </p>
    </section>
  );
}
