
import Link from "next/link";
import { commissioner } from "../../../lib/server-auth";
import { db } from "../../../lib/yahoo";

export const dynamic = "force-dynamic";

const STARTING_BUDGET = 10;

type UsageRow = {
  id: string;
  created_at: string;
  feature: string;
  model: string;
  season: number | null;
  week: number | null;
  source_type: string;
  input_tokens: number;
  output_tokens: number;
  estimated_cost_usd: number;
};

function money(value: number) {
  return `$${value.toFixed(4)}`;
}

export default async function AICostTracker() {
  const user = await commissioner();

  if (!user) {
    return (
      <main className="shell">
        <h1>COMMISSIONER LOGIN REQUIRED</h1>
        <Link className="button" href="/login">
          SIGN IN
        </Link>
      </main>
    );
  }

  let rows: UsageRow[] = [];
  let errorMessage = "";

  try {
    const result = await db()
      .from("ai_usage_log")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(1000);

    if (result.error) {
      throw result.error;
    }

    rows = (result.data ?? []) as UsageRow[];
  } catch {
    errorMessage =
      "Could not load AI usage. Check that " +
      "the Supabase SQL has been run.";
  }

  const spent = rows.reduce(
    (sum, row) =>
      sum + Number(row.estimated_cost_usd),
    0
  );

  const remaining = STARTING_BUDGET - spent;

  const articleCalls = rows.filter(
    row => row.feature === "article-writer"
  );

  const inputTokens = rows.reduce(
    (sum, row) => sum + row.input_tokens,
    0
  );

  const outputTokens = rows.reduce(
    (sum, row) => sum + row.output_tokens,
    0
  );

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • COMMISSIONER • AI USAGE
      </div>

      <h1>AI COST TRACKER</h1>

      <p className="muted">
        Monitor estimated OpenAI API spending
        for tracked newsletter generation.
      </p>

      {errorMessage && (
        <section className="card">
          <p>{errorMessage}</p>
        </section>
      )}

      <div
        className="grid"
        style={{ marginTop: 24 }}
      >
        <section className="card span6">
          <div className="label">
            REFERENCE BUDGET
          </div>
          <h2>$10.00</h2>
          <p className="muted">
            Starting amount for this tracker.
          </p>
        </section>

        <section className="card span6">
          <div className="label">
            ESTIMATED TRACKED SPENDING
          </div>
          <h2>{money(spent)}</h2>
          <p className="muted">
            Based on recorded token usage.
          </p>
        </section>

        <section className="card span6">
          <div className="label">
            ESTIMATED BUDGET REMAINING
          </div>
          <h2>{money(remaining)}</h2>
          <p className="muted">
            Not your actual OpenAI account balance.
          </p>
        </section>

        <section className="card span6">
          <div className="label">
            TRACKED ARTICLE GENERATIONS
          </div>
          <h2>{articleCalls.length}</h2>
          <p className="muted">
            Includes fictional tests once
            logging is connected.
          </p>
        </section>

        <section className="card span6">
          <div className="label">
            INPUT TOKENS
          </div>
          <h2>
            {inputTokens.toLocaleString()}
          </h2>
        </section>

        <section className="card span6">
          <div className="label">
            OUTPUT TOKENS
          </div>
          <h2>
            {outputTokens.toLocaleString()}
          </h2>
        </section>
      </div>

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <h2>RECENT AI ACTIVITY</h2>

        {rows.length === 0 ? (
          <p className="muted">
            No AI usage has been recorded yet.
            Earlier API calls are not included.
          </p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
              }}
            >
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>FEATURE</th>
                  <th>TYPE</th>
                  <th>TOKENS</th>
                  <th>EST. COST</th>
                </tr>
              </thead>

              <tbody>
                {rows.map(row => (
                  <tr key={row.id}>
                    <td style={{ padding: 8 }}>
                      {new Date(
                        row.created_at
                      ).toLocaleDateString()}
                    </td>
                    <td style={{ padding: 8 }}>
                      {row.feature}
                      {row.week
                        ? ` • Week ${row.week}`
                        : ""}
                    </td>
                    <td style={{ padding: 8 }}>
                      {row.source_type}
                    </td>
                    <td style={{ padding: 8 }}>
                      {(
                        row.input_tokens +
                        row.output_tokens
                      ).toLocaleString()}
                    </td>
                    <td style={{ padding: 8 }}>
                      {money(
                        Number(
                          row.estimated_cost_usd
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="muted">
        This dashboard currently displays up to
        1,000 recent usage records. Spending totals
        reflect those records only. API usage
        outside this website is not included.
      </p>

      <Link
        className="button"
        href="/commissioner"
      >
        BACK TO COMMISSIONER HQ
      </Link>
    </main>
  );
}
