
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type {
  WeeklyAnalysis,
} from "../../../lib/matchup-analysis";
import type {
  ClutchWeekAnalysis,
} from "../../../lib/clutch-impact";

type TestResult = {
  success: boolean;
  analysis: WeeklyAnalysis;
  clutch: ClutchWeekAnalysis;
};

const windowLabels: Record<string, string> = {
  THURSDAY: "Thursday Night Football",
  SUNDAY_EARLY: "Sunday Early",
  SUNDAY_LATE: "Sunday Afternoon",
  SUNDAY_NIGHT: "Sunday Night Football",
  MONDAY_NIGHT: "Monday Night Football",
  UNKNOWN: "Game Time Unknown",
};

export default function AnalysisLabPage() {
  const [data, setData] =
    useState<TestResult | null>(null);
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

      setData(result);
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
        Player impact, projection surprises,
        lineup decisions, and game-time context.
      </p>

      <p
        style={{
          color: "#a25a00",
          fontWeight: 800,
        }}
      >
        FICTIONAL TEST DATA — NOT LIVE RESULTS
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
          className="button"
          href="/commissioner"
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
              WEEKLY INTELLIGENCE
            </div>

            <h2>
              Week {data.analysis.week} —{" "}
              {data.analysis.season}
            </h2>

            <p className="muted">
              {data.analysis.matchups.length} matchups
              {" • "}
              {data.analysis.source.toUpperCase()}
              {" • "}
              {data.analysis.scoringFinal
                ? "Final scores"
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
                {data.analysis.goat?.manager ??
                  "Unavailable"}
              </h2>

              <p>
                {data.analysis.goat?.points ?? "—"}
                {" "}fantasy points
              </p>
            </section>

            <section className="card span6">
              <div className="label">
                🗑️ BUM OF THE WEEK
              </div>

              <h2>
                {data.analysis.bum?.manager ??
                  "Unavailable"}
              </h2>

              <p>
                {data.analysis.bum?.points ?? "—"}
                {" "}fantasy points
              </p>
            </section>
          </div>

          <h2 style={{ marginTop: 28 }}>
            MATCHUP IMPACT REPORTS
          </h2>

          <div
            style={{
              display: "grid",
              gap: 20,
              marginTop: 16,
            }}
          >
            {data.analysis.matchups.map(
              (matchup, index) => {
                const clutch =
                  data.clutch.matchups.find(
                    item =>
                      item.matchupId === matchup.id
                  );

                const mvp = clutch?.mostImpactful;
                const scorer = clutch?.topScorer;

                return (
                  <section
                    key={matchup.id}
                    className="card"
                  >
                    <div className="label">
                      MATCHUP {index + 1}
                    </div>

                    <h2>
                      {matchup.home} vs. {matchup.away}
                    </h2>

                    <h3>
                      {matchup.homeScore} –{" "}
                      {matchup.awayScore}
                    </h3>

                    <p>
                      <strong>Winner:</strong>{" "}
                      {matchup.winner ?? "Tie"}
                      {" • "}
                      <strong>Margin:</strong>{" "}
                      {matchup.margin}
                    </p>

                    <hr />

                    <h3>⭐ Most Impactful Player</h3>

                    {mvp ? (
                      <>
                        <p>
                          <strong>
                            {mvp.player}
                          </strong>
                          {" "}({mvp.manager})
                          {" — "}
                          {mvp.points} points
                        </p>

                        <p>
                          <strong>Impact rating:</strong>{" "}
                          {mvp.impactScore}
                        </p>

                        <p>
                          <strong>Game window:</strong>{" "}
                          {windowLabels[mvp.gameWindow]}
                        </p>

                        <ul>
                          {mvp.reasons.map(
                            (reason, i) => (
                              <li key={i}>
                                {reason}
                              </li>
                            )
                          )}
                        </ul>
                      </>
                    ) : (
                      <p className="muted">
                        No winning-team MVP available.
                      </p>
                    )}

                    <h3>🔥 Highest Scoring Player</h3>

                    <p>
                      {scorer
                        ? `${scorer.player} — ${scorer.points} points`
                        : "Unavailable"}
                    </p>

                    <h3>📉 Biggest Projection Bust</h3>

                    <p>
                      {matchup.biggestBust &&
                      (matchup.biggestBust.difference ?? 0) < 0
                        ? `${matchup.biggestBust.player}: ${matchup.biggestBust.difference} vs. projection`
                        : "No below-projection starter identified"}
                    </p>

                    <h3>🪑 Bench Opportunities</h3>

                    {matchup.benchOpportunities.length ? (
                      <ul>
                        {matchup.benchOpportunities
                          .slice(0, 3)
                          .map((item, i) => (
                            <li key={i}>
                              {item.manager}:{" "}
                              {item.benchPlayer}
                              {" "}over{" "}
                              {item.starter}
                              {" — "}
                              +{item.potentialGain}
                              {" "}potential points
                              {item.wouldChangeResult
                                ? " (would reverse result)"
                                : ""}
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="muted">
                        No positive substitutions.
                      </p>
                    )}

                    <h3>📊 Positional Advantages</h3>

                    <ul>
                      {matchup.positionalAdvantages
                        .filter(item => item.advantage > 0)
                        .slice(0, 3)
                        .map(item => (
                          <li key={item.position}>
                            {item.position}:{" "}
                            {item.leader} +{item.advantage}
                          </li>
                        ))}
                    </ul>

                    <hr />

                    <h3>🕒 Game Window Timeline</h3>

                    <p className="muted">
                      Shows when players were scheduled
                      to play. Not a verified live
                      fantasy scoring timeline.
                    </p>

                    {clutch?.gameTimeline.map(item => (
                      <div
                        key={item.window}
                        style={{
                          borderTop:
                            "1px solid #d9e2db",
                          padding: "12px 0",
                        }}
                      >
                        <strong>
                          {windowLabels[item.window]}
                        </strong>

                        <p>
                          {item.players.join(", ")}
                        </p>
                      </div>
                    ))}

                    <p className="muted">
                      Confirmed comeback:{" "}
                      {clutch?.confirmedComeback === null
                        ? "Not available without chronological scoring"
                        : clutch?.confirmedComeback
                          ? "Yes"
                          : "No"}
                    </p>
                  </section>
                );
              }
            )}
          </div>

          <section
            className="card"
            style={{ marginTop: 24 }}
          >
            <div className="label">
              ANALYSIS METHODOLOGY
            </div>

            <h2>How MVPs Are Selected</h2>

            <p className="muted">
              The current model combines
              winning-team scoring contribution,
              positive projection surprises,
              and final-margin relevance.
              It does not automatically favor
              Monday night players.
            </p>

            <p className="muted">
              {data.clutch.note}
            </p>
          </section>
        </>
      )}
    </main>
  );
}
