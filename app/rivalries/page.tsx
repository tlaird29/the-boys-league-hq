
import Link from "next/link";

const activeManagers = [
  "Tyler Laird",
  "Caleb Burnham",
  "Lane Lehman",
  "Braden Riley",
  "Tyler Gay",
  "Hunter Crownover",
  "Hunter Kovick",
  "Kyler Landa",
  "Cade Burnham",
  "Cody Carpenter",
];

type Matchup = {
  season: number;
  week: number;
  manager1: string;
  manager2: string;
  score1: number;
  score2: number;
  isPlayoff: boolean;
};

// Historical games will be imported from Yahoo.
// Do not add unverified results here.
const matchups: Matchup[] = [];

const formerManagers = [
  "Brad McCain",
  "John Villareal",
  "Dillon Lowder",
];

function formatPoints(value: number) {
  return value.toFixed(2);
}

function getManagerGames(name: string) {
  return matchups.filter(
    (game) =>
      game.manager1 === name ||
      game.manager2 === name
  );
}

function getHeadToHead(first: string, second: string) {
  const games = matchups
    .filter(
      (game) =>
        (game.manager1 === first &&
          game.manager2 === second) ||
        (game.manager1 === second &&
          game.manager2 === first)
    )
    .sort(
      (a, b) =>
        a.season - b.season ||
        a.week - b.week
    );

  let wins = 0;
  let losses = 0;
  let ties = 0;
  let pointsFor = 0;
  let pointsAgainst = 0;
  let playoffWins = 0;
  let biggestWin = 0;
  let longestWinStreak = 0;
  let currentStreak = 0;

  for (const game of games) {
    const firstScore =
      game.manager1 === first
        ? game.score1
        : game.score2;

    const secondScore =
      game.manager1 === first
        ? game.score2
        : game.score1;

    pointsFor += firstScore;
    pointsAgainst += secondScore;

    if (firstScore > secondScore) {
      wins++;

      if (game.isPlayoff) {
        playoffWins++;
      }

      const margin = firstScore - secondScore;
      biggestWin = Math.max(biggestWin, margin);

      currentStreak++;
      longestWinStreak = Math.max(
        longestWinStreak,
        currentStreak
      );
    } else if (firstScore < secondScore) {
      losses++;
      currentStreak = 0;
    } else {
      ties++;
      currentStreak = 0;
    }
  }

  return {
    games: games.length,
    wins,
    losses,
    ties,
    pointsFor,
    pointsAgainst,
    playoffWins,
    biggestWin,
    longestWinStreak,
  };
}

function getCareerRecord(name: string) {
  const games = getManagerGames(name);

  let wins = 0;
  let losses = 0;
  let ties = 0;

  for (const game of games) {
    const ownScore =
      game.manager1 === name
        ? game.score1
        : game.score2;

    const opponentScore =
      game.manager1 === name
        ? game.score2
        : game.score1;

    if (ownScore > opponentScore) wins++;
    else if (ownScore < opponentScore) losses++;
    else ties++;
  }

  return { wins, losses, ties, games: games.length };
}

function getBiggestBlowouts() {
  return [...matchups]
    .filter((game) => game.score1 !== game.score2)
    .map((game) => {
      const firstWon = game.score1 > game.score2;

      return {
        ...game,
        winner: firstWon
          ? game.manager1
          : game.manager2,
        loser: firstWon
          ? game.manager2
          : game.manager1,
        winnerScore: Math.max(
          game.score1,
          game.score2
        ),
        loserScore: Math.min(
          game.score1,
          game.score2
        ),
        margin: Math.abs(
          game.score1 - game.score2
        ),
      };
    })
    .sort((a, b) => b.margin - a.margin)
    .slice(0, 10);
}

function getClosestGames() {
  return [...matchups]
    .filter((game) => game.score1 !== game.score2)
    .map((game) => ({
      ...game,
      margin: Math.abs(
        game.score1 - game.score2
      ),
    }))
    .sort((a, b) => a.margin - b.margin)
    .slice(0, 10);
}

const thStyle: React.CSSProperties = {
  padding: "13px 12px",
  textAlign: "left",
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: "nowrap",
  background: "#edf5f0",
  color: "#52665a",
  borderBottom: "1px solid #dce7df",
};

const tdStyle: React.CSSProperties = {
  padding: "13px 12px",
  fontSize: 13,
  whiteSpace: "nowrap",
  borderBottom: "1px solid #e2e9e4",
};

function DataTable({
  headings,
  children,
  minWidth = 700,
}: {
  headings: string[];
  children: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          minWidth,
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            {headings.map((heading) => (
              <th key={heading} style={thStyle}>
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function EmptyRow({
  columns,
  message = "Awaiting verified historical Yahoo data.",
}: {
  columns: number;
  message?: string;
}) {
  return (
    <tr>
      <td
        colSpan={columns}
        style={{
          padding: 32,
          textAlign: "center",
          color: "#68736d",
          fontSize: 13,
        }}
      >
        {message}
      </td>
    </tr>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div className="label">{eyebrow}</div>
      <h2 style={{ marginTop: 8 }}>{title}</h2>
      <p className="muted">{description}</p>
    </div>
  );
}

export default function RivalriesPage() {
  const blowouts = getBiggestBlowouts();
  const closest = getClosestGames();

  const rivalryPairs = activeManagers.flatMap(
    (first, index) =>
      activeManagers
        .slice(index + 1)
        .map((second) => {
          const stats = getHeadToHead(first, second);

          return {
            first,
            second,
            ...stats,
          };
        })
  );

  const rankedRivalries = rivalryPairs
    .filter((pair) => pair.games > 0)
    .sort((a, b) => b.games - a.games);

  const streakLeaders = rivalryPairs
    .flatMap((pair) => {
      const first = getHeadToHead(
        pair.first,
        pair.second
      );

      const second = getHeadToHead(
        pair.second,
        pair.first
      );

      return [
        {
          manager: pair.first,
          opponent: pair.second,
          streak: first.longestWinStreak,
        },
        {
          manager: pair.second,
          opponent: pair.first,
          streak: second.longestWinStreak,
        },
      ];
    })
    .filter((item) => item.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 10);

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • EST. 2020
      </div>

      <h1>LEAGUE RIVALRIES</h1>

      <p className="muted">
        Friendships are temporary. Fantasy football
        receipts are forever.
      </p>

      {/* RIVALRY INTRODUCTION */}

      <section
        style={{
          background: "#14251f",
          color: "#ffffff",
          padding: 26,
          borderRadius: 16,
          marginTop: 25,
        }}
      >
        <div
          style={{
            color: "#48d6a8",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
          }}
        >
          THE BOYS • HEAD-TO-HEAD HISTORY
        </div>

        <h2
          style={{
            fontSize: 42,
            marginTop: 12,
          }}
        >
          EVERY MATCHUP.
          <br />
          EVERY RECEIPT.
        </h2>

        <p
          style={{
            color: "#c5d4cd",
            lineHeight: 1.7,
          }}
        >
          Seven seasons of rivalries, bragging rights,
          beatdowns, and heartbreaking losses.
          Regular-season and playoff games count
          toward lifetime head-to-head records.
        </p>

        <span
          className="pill"
          style={{
            background: "#263d32",
            color: "#48d6a8",
          }}
        >
          10 ACTIVE MANAGERS
        </span>
      </section>

      {/* HEAD TO HEAD MATRIX */}

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <SectionHeader
          eyebrow="THE ULTIMATE SCORECARD"
          title="HEAD-TO-HEAD MATRIX"
          description="Each row shows a manager's lifetime wins and losses against every other active manager. Read each cell from the row manager's perspective."
        />

        <DataTable
          minWidth={1450}
          headings={[
            "MANAGER",
            ...activeManagers.map(
              (name) =>
                name.split(" ")[0] +
                " " +
                name.split(" ").slice(1).map(
                  (part) => part.charAt(0) + "."
                ).join("")
            ),
          ]}
        >
          {activeManagers.map((manager) => (
            <tr key={manager}>
              <td
                style={{
                  ...tdStyle,
                  fontWeight: 800,
                }}
              >
                {manager}
              </td>

              {activeManagers.map((opponent) => {
                if (manager === opponent) {
                  return (
                    <td
                      key={opponent}
                      style={{
                        ...tdStyle,
                        background: "#e9efeb",
                        textAlign: "center",
                      }}
                    >
                      —
                    </td>
                  );
                }

                const stats = getHeadToHead(
                  manager,
                  opponent
                );

                return (
                  <td
                    key={opponent}
                    style={{
                      ...tdStyle,
                      fontWeight: 700,
                      textAlign: "center",
                      color:
                        stats.games === 0
                          ? "#9aa69e"
                          : stats.wins > stats.losses
                          ? "#159c73"
                          : stats.wins < stats.losses
                          ? "#b44b4b"
                          : "#14251f",
                    }}
                    title={`${manager} vs. ${opponent}`}
                  >
                    {stats.games
                      ? `${stats.wins}-${stats.losses}${
                          stats.ties
                            ? `-${stats.ties}`
                            : ""
                        }`
                      : "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </DataTable>

        <p
          style={{
            fontSize: 12,
            color: "#68736d",
            marginTop: 15,
          }}
        >
          Green = winning head-to-head record.
          Red = losing head-to-head record.
          Dashes indicate no verified imported matchup.
        </p>
      </section>

      {/* MANAGER RIVALRY STANDINGS */}

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <SectionHeader
          eyebrow="ALL-TIME MATCHUP HISTORY"
          title="MANAGER RIVALRY STANDINGS"
          description="Lifetime records for each active manager. Games against former managers are included in career totals."
        />

        <DataTable
          headings={[
            "MANAGER",
            "WINS",
            "LOSSES",
            "TIES",
            "WIN %",
            "GAMES",
          ]}
        >
          {activeManagers
            .map((name) => ({
              name,
              ...getCareerRecord(name),
            }))
            .sort((a, b) => b.wins - a.wins)
            .map((manager) => (
              <tr key={manager.name}>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: 800,
                  }}
                >
                  {manager.name}
                </td>

                {[
                  manager.games
                    ? manager.wins
                    : "—",
                  manager.games
                    ? manager.losses
                    : "—",
                  manager.games
                    ? manager.ties
                    : "—",
                  manager.games
                    ? (
                        (manager.wins +
                          manager.ties / 2) /
                        manager.games *
                        100
                      ).toFixed(1) + "%"
                    : "—",
                  manager.games || "—",
                ].map((value, index) => (
                  <td key={index} style={tdStyle}>
                    {value}
                  </td>
                ))}
              </tr>
            ))}
        </DataTable>
      </section>

      {/* MOST PLAYED RIVALRIES */}

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <SectionHeader
          eyebrow="THE LONGEST-RUNNING BEEF"
          title="MOST PLAYED RIVALRIES"
          description="The active manager pairs that have faced each other the most."
        />

        <DataTable
          headings={[
            "RANK",
            "RIVALRY",
            "GAMES",
            "HEAD-TO-HEAD",
            "POINTS FOR / AGAINST",
            "PLAYOFF WINS",
          ]}
          minWidth={950}
        >
          {rankedRivalries.length === 0 ? (
            <EmptyRow columns={6} />
          ) : (
            rankedRivalries
              .slice(0, 25)
              .map((pair, index) => (
                <tr
                  key={`${pair.first}-${pair.second}`}
                >
                  <td style={tdStyle}>
                    #{index + 1}
                  </td>
                  <td
                    style={{
                      ...tdStyle,
                      fontWeight: 800,
                    }}
                  >
                    {pair.first} vs. {pair.second}
                  </td>
                  <td style={tdStyle}>
                    {pair.games}
                  </td>
                  <td style={tdStyle}>
                    {pair.wins}-{pair.losses}
                    {pair.ties
                      ? `-${pair.ties}`
                      : ""}
                  </td>
                  <td style={tdStyle}>
                    {formatPoints(pair.pointsFor)}
                    {" / "}
                    {formatPoints(pair.pointsAgainst)}
                  </td>
                  <td style={tdStyle}>
                    {pair.playoffWins}
                  </td>
                </tr>
              ))
          )}
        </DataTable>
      </section>

      {/* WINNING STREAKS */}

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <SectionHeader
          eyebrow="RENT FREE"
          title="LONGEST RIVALRY WINNING STREAKS"
          description="The longest consecutive winning streaks by one manager against a specific opponent."
        />

        <DataTable
          headings={[
            "RANK",
            "MANAGER",
            "OPPONENT",
            "CONSECUTIVE WINS",
          ]}
        >
          {streakLeaders.length === 0 ? (
            <EmptyRow columns={4} />
          ) : (
            streakLeaders.map((item, index) => (
              <tr
                key={`${item.manager}-${item.opponent}`}
              >
                <td style={tdStyle}>
                  #{index + 1}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: 800,
                  }}
                >
                  {item.manager}
                </td>
                <td style={tdStyle}>
                  {item.opponent}
                </td>
                <td style={tdStyle}>
                  {item.streak}
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </section>

      {/* BIGGEST BLOWOUTS */}

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <SectionHeader
          eyebrow="ABSOLUTE DESTRUCTION"
          title="BIGGEST RIVALRY BLOWOUTS"
          description="The ten most lopsided matchups in league history."
        />

        <DataTable
          headings={[
            "RANK",
            "WINNER",
            "LOSER",
            "SEASON / WEEK",
            "FINAL SCORE",
            "MARGIN",
          ]}
          minWidth={900}
        >
          {blowouts.length === 0 ? (
            <EmptyRow columns={6} />
          ) : (
            blowouts.map((game, index) => (
              <tr
                key={`${game.season}-${game.week}-${game.winner}-${game.loser}`}
              >
                <td style={tdStyle}>
                  #{index + 1}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: 800,
                  }}
                >
                  {game.winner}
                </td>
                <td style={tdStyle}>
                  {game.loser}
                </td>
                <td style={tdStyle}>
                  {game.season} / W{game.week}
                  {game.isPlayoff ? " • PLAYOFF" : ""}
                </td>
                <td style={tdStyle}>
                  {formatPoints(game.winnerScore)}
                  {" - "}
                  {formatPoints(game.loserScore)}
                </td>
                <td style={tdStyle}>
                  {formatPoints(game.margin)}
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </section>

      {/* CLOSEST GAMES */}

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <SectionHeader
          eyebrow="HEARTBREAK HOTEL"
          title="CLOSEST RIVALRY MATCHUPS"
          description="The ten closest decided games in league history."
        />

        <DataTable
          headings={[
            "RANK",
            "MATCHUP",
            "SEASON / WEEK",
            "FINAL SCORE",
            "MARGIN",
          ]}
          minWidth={850}
        >
          {closest.length === 0 ? (
            <EmptyRow columns={5} />
          ) : (
            closest.map((game, index) => (
              <tr
                key={`${game.season}-${game.week}-${game.manager1}-${game.manager2}`}
              >
                <td style={tdStyle}>
                  #{index + 1}
                </td>
                <td
                  style={{
                    ...tdStyle,
                    fontWeight: 800,
                  }}
                >
                  {game.manager1} vs. {game.manager2}
                </td>
                <td style={tdStyle}>
                  {game.season} / W{game.week}
                  {game.isPlayoff ? " • PLAYOFF" : ""}
                </td>
                <td style={tdStyle}>
                  {formatPoints(game.score1)}
                  {" - "}
                  {formatPoints(game.score2)}
                </td>
                <td style={tdStyle}>
                  {formatPoints(game.margin)}
                </td>
              </tr>
            ))
          )}
        </DataTable>
      </section>

      {/* HISTORICAL RULES */}

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <SectionHeader
          eyebrow="THE OFFICIAL RECORD"
          title="RIVALRY TRACKING RULES"
          description="How historical matchup statistics are counted."
        />

        <p className="muted">
          Head-to-head records include regular-season
          and playoff games from 2020 onward.
        </p>

        <p className="muted">
          Only the ten current managers appear in
          active-manager rivalry rankings.
        </p>

        <p className="muted">
          Former managers are not included in the
          active head-to-head matrix, but historical
          matchups against them count toward current
          managers' career records.
        </p>

        <p className="muted">
          Former managers retained in historical
          matchup records: {formerManagers.join(", ")}.
        </p>

        <p className="muted">
          Rivalry winning streaks count consecutive
          meetings between the same managers.
          A loss or tie ends a streak.
        </p>

        <p
          style={{
            color: "#159c73",
            fontWeight: 800,
            marginTop: 18,
          }}
        >
          Verified historical data will populate
          these tables after Yahoo API approval
          and league-history import.
        </p>
      </section>

      <div style={{ marginTop: 28 }}>
        <Link href="/" className="button">
          🏠 Home / League HQ
        </Link>
      </div>
    </main>
  );
}
