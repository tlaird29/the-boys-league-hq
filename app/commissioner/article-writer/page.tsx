
"use client";

import Link from "next/link";
import { useState } from "react";

type Section = {
  id: string;
  title: string;
  body: string;
};

type ArticleResult = {
  success: boolean;
  warning: string;
  year: number;
  week: number;
  sections: Section[];
  analysisSummary: {
    matchupCount: number;
    goat: {
      manager: string;
      points: number;
    } | null;
    bum: {
      manager: string;
      points: number;
    } | null;
  };
};

export default function ArticleWriterPage() {
  const [article, setArticle] =
    useState<ArticleResult | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateArticle() {
    setLoading(true);
    setError("");
    setArticle(null);

    try {
      const response = await fetch(
        "/api/commissioner/article-writer",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Article generation failed."
        );
      }

      setArticle(result as ArticleResult);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyArticle() {
    if (!article) return;

    const text = article.sections
      .map(section =>
        `${section.title}\n\n${section.body}`
      )
      .join("\n\n");

    try {
      await navigator.clipboard.writeText(text);
      window.alert("Article copied!");
    } catch {
      setError(
        "Could not copy automatically. " +
        "Please select and copy the article."
      );
    }
  }

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • COMMISSIONER HQ
      </div>

      <h1>📰 AUTOMATIC ARTICLE WRITER</h1>

      <p className="muted">
        Turn calculated fantasy football results
        into a full sports-column newsletter,
        including player impacts, game timing,
        and original league trash talk.
      </p>

      <section
        className="card"
        style={{ marginTop: 24 }}
      >
        <div className="label">
          ARTICLE GENERATION LAB
        </div>

        <h2>Week 12 — 2026 Test Edition</h2>

        <p className="muted">
          This preview uses fictional matchup
          data. Nothing will be published,
          emailed, or saved to Supabase.
        </p>

        <p
          style={{
            color: "#a25a00",
            fontWeight: 800,
          }}
        >
          FICTIONAL TEST DATA ONLY
        </p>

        <div
          style={{
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
            marginTop: 20,
          }}
        >
          <button
            type="button"
            className="button"
            onClick={generateArticle}
            disabled={loading}
          >
            {loading
              ? "✍️ WRITING THE ARTICLE..."
              : "🏈 GENERATE FULL ARTICLE"}
          </button>

          <Link
            href="/commissioner"
            className="button"
          >
            ← COMMISSIONER HQ
          </Link>
        </div>

        {loading && (
          <p role="status" className="muted">
            Analyzing matchups and writing
            the newspaper. This may take
            several seconds.
          </p>
        )}

        {error && (
          <div
            role="alert"
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 8,
              background: "#fff0f0",
              color: "#9d2525",
            }}
          >
            <strong>GENERATION FAILED</strong>
            <p>{error}</p>
          </div>
        )}
      </section>

      {article && (
        <>
          <section
            className="card"
            style={{ marginTop: 24 }}
          >
            <div className="label">
              GENERATED NEWSPAPER
            </div>

            <h2>
              THE BOYS — WEEK {article.week}
            </h2>

            <p className="muted">
              {article.analysisSummary.matchupCount}
              {" "}matchups analyzed
              {" • "}
              {article.year} season
            </p>

            <p
              style={{
                color: "#a25a00",
                fontWeight: 800,
              }}
            >
              FICTIONAL PREVIEW — DO NOT PUBLISH
            </p>

            <button
              className="button"
              type="button"
              onClick={copyArticle}
            >
              📋 COPY COMPLETE ARTICLE
            </button>
          </section>

          <article
            className="card"
            style={{
              marginTop: 20,
              maxWidth: 850,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            <div className="kicker">
              THE BOYS LEAGUE HQ • WEEKLY EDITION
            </div>

            {article.sections.map(
              (section, index) => (
                <section
                  key={section.id}
                  style={{
                    padding: "24px 0",
                    borderBottom:
                      index === article.sections.length - 1
                        ? "none"
                        : "1px solid #d9e2db",
                  }}
                >
                  <h2>{section.title}</h2>

                  {section.body
                    .split(/\n\s*\n/)
                    .filter(Boolean)
                    .map((paragraph, i) => (
                      <p
                        key={i}
                        style={{
                          lineHeight: 1.85,
                          marginTop: 16,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {paragraph}
                      </p>
                    ))}
                </section>
              )
            )}
          </article>

          <section
            className="card"
            style={{ marginTop: 24 }}
          >
            <div className="label">
              NEXT DEVELOPMENT STEP
            </div>

            <h2>Connect to Newsletter Drafts</h2>

            <p className="muted">
              Once the writing quality is
              approved, we will connect this
              generator to the existing
              commissioner editor and
              Wednesday email automation.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
