
import Link from "next/link";
import { commissioner } from "../../../lib/server-auth";
import {
  importYahooScoreboard,
  type YahooScoreboard,
} from "../../../lib/yahoo-scoreboard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

type PageProps = {
  searchParams: Promise<{
    league?: string;
    week?: string;
  }>;
};

export default async function YahooMatchupsPage({
  searchParams,
}: PageProps) {
  const user = await commissioner();

  if (!user) {
    return (
      <main className="shell">
        <div className="kicker">
          THE BOYS • COMMISSIONER
        </div>

        <h1>SIGN IN REQUIRED</h1>

        <Link href="/login" className="button">
          COMMISSIONER SIGN IN
        </Link>
      </main>
    );
  }

  const params = await searchParams;

  const leagueKey = params.league?.trim() || "";
  const week = Number(params.week || "12");

  let scoreboard: YahooScoreboard | null = null;
  let errorMessage = "";

  if (leagueKey) {
    try {
      scoreboard = await importYahooScoreboard(
        user.id,
        leagueKey,
        week
      );
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : "Yahoo scoreboard retrieval failed.";
    }
  }

  const rankedTeams = scoreboard
    ? scoreboard.games
        .flatMap(game => [game.a, game.b])
        .sort((a, b) => b.points - a.points)
    : [];

  const goat =
    scoreboard?.scoringFinal
      ? rankedTeams[0]
      : null;

  const bum =
    scoreboard?.scoringFinal
      ? rankedTeams[rankedTeams.length - 1]
      : null;

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • YAHOO INTEGRATION
      </div>

      <h1>MATCHUP IMPORTER</h1>

      <p className="muted">
        Retrieve real Yahoo Fantasy Football
        matchup scores in a private,
        read-only preview.
      </p>

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <h2>SELECT LEAGUE AND WEEK</h2>

        <form
          method="GET"
          action="/commissioner/yahoo-matchups"
          style={{
            display: "grid",
            gap: 16,
          }}
        >
          <label>
            <strong>Yahoo League Key</strong>

            <input
              name="league"
              defaultValue={leagueKey}
              placeholder="Game ID.l.League ID"
              required
              pattern="[0-9]+[.]l[.][0-9]+"
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 8,
                borderRadius: 8,
                border: "1px solid #999",
                background: "transparent",
                color: "inherit",
              }}
            />
          </label>

          <label>
            <strong>Fantasy Week</strong>

            <select
              name="week"
              defaultValue={String(week)}
              style={{
                display: "block",
                width: "100%",
                padding: 12,
                marginTop: 8,
                borderRadius: 8,
                border: "1px solid #999",
                color: "#111",
                background: "#fff",
              }}
            >
              {Array.from(
                { length: 18 },
                (_, index) => index + 1
              ).map(number => (
                <option
                  key={number}
                  value={number}
                >
                  Week {number}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className="button"
          >
            RETRIEVE YAHOO MATCHUPS
          </button>
        </form>

        <p
          className="muted"
          style={{ marginTop: 16 }}
        >
          Find your league key using
          the League Discovery page.
        </p>

        <Link
          href="/commissioner/yahoo-leagues"
          className="button"
        >
          FIND MY LEAGUE
        </Link>
      </section>

      {errorMessage && (
        <section
          className="card"
          style={{ marginTop: 20 }}
        >
          <div className="label">
            IMPORT STATUS
          </div>

          <h2>DATA NOT AVAILABLE</h2>

          <p>{errorMessage}</p>

          <p className="muted">
            If Yahoo returns HTTP 403,
            access activation or permissions
            may still be pending.
          </p>
        </section>
      )}

      {scoreboard && (
        <>
          <section
            className="card"
            style={{ marginTop: 20 }}
          >
            <div className="label">
              LIVE YAHOO DATA • PRIVATE PREVIEW
            </div>

            <h2>{scoreboard.leagueName}</h2>

            <p>
              Season {scoreboard.season}
              {" • "}
              Week {scoreboard.week}
            </p>

            <p>
              Matchups retrieved:{" "}
              {scoreboard.games.length}
            </p>

            <p>
              Scoring status:{" "}
              <strong>
                {scoreboard.scoringFinal
                  ? "REPORTED COMPLETE"
                  : "NOT VERIFIED"}
              </strong>
            </p>

            <p className="muted">
              Retrieved:{" "}
              {new Date(
                scoreboard.retrievedAt
              ).toLocaleString()}
            </p>

            {scoreboard.warnings.map(warning => (
              <p key={warning}>
                ⚠️ {warning}
              </p>
            ))}
          </section>

          <div
            className="grid"
            style={{ marginTop: 20 }}
          >
            {scoreboard.games.map(game => (
              <section
                key={`${game.a.key}-${game.b.key}`}
                className="card span6"
              >
                <div className="label">
                  WEEK {game.week}
                  {game.isPlayoffs
                    ? " • PLAYOFFS"
                    : ""}
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                    marginTop: 16,
                  }}
                >
                  <strong>{game.a.name}</strong>

                  <strong>
                    {game.a.points.toFixed(2)}
                  </strong>
                </div>

                <hr />

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <strong>{game.b.name}</strong>

                  <strong>
                    {game.b.points.toFixed(2)}
                  </strong>
                </div>

                <p
                  className="muted"
                  style={{ marginTop: 16 }}
                >
                  {scoreboard.scoringFinal
                    ? "Winner by score: "
                    : "Current leader: "}

                  {game.a.points === game.b.points
                    ? "Tied"
                    : game.a.points > game.b.points
                      ? game.a.name
                      : game.b.name}
                </p>

                <p className="muted">
                  Margin:{" "}
                  {Math.abs(
                    game.a.points - game.b.points
                  ).toFixed(2)}
                </p>
              </section>
            ))}
          </div>

          {goat && bum && (
            <div
              className="grid"
              style={{ marginTop: 20 }}
            >
              <section className="card span6">
                <div className="label">
                  PREVIEW • GOAT OF THE WEEK
                </div>

                <h2>🐐 {goat.name}</h2>

                <h3>
                  {goat.points.toFixed(2)} PTS
                </h3>
              </section>

              <section className="card span6">
                <div className="label">
                  PREVIEW • BUM OF THE WEEK
                </div>

                <h2>🗑️ {bum.name}</h2>

                <h3>
                  {bum.points.toFixed(2)} PTS
                </h3>
              </section>
            </div>
          )}
        </>
      )}

      <section
        className="card"
        style={{ marginTop: 20 }}
      >
        <h2>IMPORT SAFETY</h2>

        <p className="muted">
          This preview retrieves Yahoo
          scoreboard data without saving
          official league records or
          publishing newsletters.
        </p>

        <p className="muted">
          Scores and completion indicators
          must be validated before they
          can be used by automated articles.
        </p>
      </section>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 24,
        }}
      >
        <Link
          href="/commissioner"
          className="button"
        >
          BACK TO COMMISSIONER HQ
        </Link>

        <Link
          href="/commissioner/yahoo-status"
          className="button"
        >
          CONNECTION CHECK
        </Link>

        <Link
          href="/commissioner/yahoo-leagues"
          className="button"
        >
          LEAGUE DISCOVERY
        </Link>
      </div>
    </main>
  );
}
