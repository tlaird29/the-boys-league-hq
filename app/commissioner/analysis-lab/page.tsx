
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  WeeklyAnalysis,
} from "../../../lib/matchup-analysis";

export default function AnalysisLabPage() {
  const [data, setData] =
    useState<WeeklyAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalysis() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/commissioner/test-analysis",
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Analysis failed."
        );
      }

      setData(result.analysis);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load analysis."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalysis();
  }, []);

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • COMMISSIONER HQ
      </div>

      <h1>🏈 MATCHUP ANALYSIS LAB</h1>

      <p className="muted">
        Preview the player-impact calculations
        that will eventually power your
        automatic weekly sports articles.
      </p>

      <p
        style={{
          color: "#a25a00",
          fontWeight: 800,
          marginTop: 12,
        }}
      >
        FICTIONAL TEST DATA — NOT LIVE YAHOO RESULTS
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          margin: "20px 0",
        }}
      >
        <button
          className="button"
          disabled={loading}
          onClick={loadAnalysis}
        >
          {loading
            ? "ANALYZING..."
            : "🔄 RUN ANALYSIS"}
        </button>

        <Link
          href="/commissioner"
          className="button"
        >
          ← COMMISSIONER HQ
        </Link>
      </div>

      {error && (
        <p role="alert" style={{ color: "#a22" }}>
          {error}
        </p>
      )}

      {data && (
        <>
          <section className="card">
            <div className="label">
              WEEKLY ANALYSIS
            </div>

            <h2>
              Week {data.week} — {data.season}
            </h2>

            <p className="muted">
              {data.matchups.length} matchups analyzed
              {" • "}
              Source: {data.source.toUpperCase()}
              {" • "}
              {data.scoringFinal
                ? "Final scoring"
                : "Scoring in progress"}
            </p>
          </section>

          <div
            className="grid"
            style={{ marginTop: 20 }}
          >
            <section className="card span6">
              <div className="label">
                🐐 GOAT OF THE WEEK
              </div>

              <h2>
                {data.goat?.manager ?? "Not available"}
              </h2>

              <p>
                {data.goat
                  ? `${data.goat.points} fantasy points`
                  : "Waiting for final scores"}
              </p>
            </section>

            <section className="card span6">
              <div className="label">
                🗑️ BUM OF THE WEEK
              </div>

              <h2>
                {data.bum?.manager ?? "Not available"}
              </h2>

              <p>
                {data.bum
                  ? `${data.bum.points} fantasy points`
                  : "Waiting for final scores"}
              </p>
            </section>
          </div>

          <h2 style={{ marginTop: 28 }}>
            MATCHUP BREAKDOWNS
          </h2>

          <div
            style={{
              display: "grid",
              gap: 20,
              marginTop: 16,
            }}
          >
            {data.matchups.map((matchup, index) => (
              <section
                key={matchup.id}
                className="card"
              >
                <div className="label">
                  MATCHUP {index + 1}
                </div>

                <h2 style={{ marginTop: 10 }}>
                  {matchup.home} vs. {matchup.away}
                </h2>

                <div
                  style={{
                    display: "flex",
                    gap: 24,
                    flexWrap: "wrap",
                    margin: "16px 0",
                  }}
                >
                  <div>
                    <strong>{matchup.home}</strong>
                    <h2>{matchup.homeScore}</h2>
                  </div>

                  <div>
                    <strong>{matchup.away}</strong>
                    <h2>{matchup.awayScore}</h2>
                  </div>
                </div>

                <p>
                  <strong>Winner:</strong>{" "}
                  {matchup.winner ?? "Tie"}
                </p>

                <p>
                  <strong>Winning margin:</strong>{" "}
                  {matchup.margin} points
                </p>

                <hr />

                <h3>⭐ Matchup MVP</h3>

                <p>
                  {matchup.mvp
                    ? `${matchup.mvp.player} (${matchup.mvp.manager}) — ${matchup.mvp.points} points`
                    : "No starter data available"}
                </p>

                <h3>📉 Biggest Projection Bust</h3>

                <p>
                  {matchup.biggestBust &&
                  (matchup.biggestBust.difference ?? 0) < 0
                    ? `${matchup.biggestBust.player} — ${matchup.biggestBust.points} points (${matchup.biggestBust.difference} vs. projection)`
                    : "No below-projection starters"}
                </p>

                <h3>🔥 Top Overperformers</h3>

                {matchup.overperformers.length ? (
                  <ul>
                    {matchup.overperformers.map(
                      (player, i) => (
                        <li key={i}>
                          {player.player}:{" "}
                          {player.points} points
                          {" "}({player.difference !== null &&
                            player.difference > 0
                              ? "+"
                              : ""}
                          {player.difference} vs. projection)
                        </li>
                      )
                    )}
                  </ul>
                ) : (
                  <p className="muted">
                    No overperformers identified.
                  </p>
                )}

                <h3>🪑 Bench Opportunities</h3>

                {matchup.benchOpportunities.length ? (
                  <ul>
                    {matchup.benchOpportunities
                      .slice(0, 3)
                      .map((opportunity, i) => (
                        <li key={i}>
                          <strong>
                            {opportunity.manager}:
                          </strong>{" "}
                          {opportunity.benchPlayer}
                          {" "}over{" "}
                          {opportunity.starter}
                          {" "}could gain{" "}
                          {opportunity.potentialGain}
                          {" "}points.
                          {opportunity.wouldChangeResult
                            ? " This would reverse the result."
                            : ""}
                        </li>
                      ))}
                  </ul>
                ) : (
                  <p className="muted">
                    No positive bench substitutions found.
                  </p>
                )}

                <h3>📊 Biggest Positional Advantages</h3>

                <ul>
                  {matchup.positionalAdvantages
                    .filter(item => item.advantage > 0)
                    .slice(0, 3)
                    .map(item => (
                      <li key={item.position}>
                        {item.position}:{" "}
                        {item.leader} +{item.advantage}
                        {" "}points
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>

          <section
            className="card"
            style={{ marginTop: 24 }}
          >
            <div className="label">
              NEXT DEVELOPMENT PHASE
            </div>

            <h2>📰 Automatic Article Writer</h2>

            <p className="muted">
              These calculations will feed the
              AI newsletter writer, which will
              turn each matchup into entertaining
              sports-column paragraphs.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
