
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
  const [copied, setCopied] = useState(false);

  async function generateArticle() {
    setLoading(true);
    setError("");
    setCopied(false);
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

    const headline =
      article.sections[0]?.title || "";

    const body = article.sections
      .map(section => section.body.trim())
      .filter(Boolean)
      .join("\n\n");

    const text = `${headline}\n\n${body}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setError("");
    } catch {
      setError(
        "Could not copy automatically. " +
        "Please select and copy the article."
      );
    }
  }

  const headline =
    article?.sections[0]?.title || "";

  const paragraphs = article
    ? article.sections.flatMap(section =>
        section.body
          .split(/\n\s*\n/)
          .map(paragraph => paragraph.trim())
          .filter(Boolean)
      )
    : [];

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • COMMISSIONER HQ
      </div>

      <h1>📰 AUTOMATIC ARTICLE WRITER</h1>

      <p className="muted">
        Generate one continuous sports-column
        newsletter with a single headline,
        meaningful player analysis, game timing,
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
          This test uses fictional matchup data.
          Nothing is published, emailed, or
          saved to Supabase.
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
            Analyzing five matchups and writing
            one continuous newspaper article.
            This may take several seconds.
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
              {copied
                ? "✓ ARTICLE COPIED"
                : "📋 COPY COMPLETE ARTICLE"}
            </button>
          </section>

          <article
            className="card"
            style={{
              marginTop: 20,
              maxWidth: 850,
              marginLeft: "auto",
              marginRight: "auto",
              padding: 32,
            }}
          >
            <div className="kicker">
              THE BOYS LEAGUE HQ • WEEKLY EDITION
            </div>

            <h2
              style={{
                marginTop: 20,
                marginBottom: 28,
                lineHeight: 1.3,
              }}
            >
              {headline}
            </h2>

            {paragraphs.map((paragraph, index) => (
              <p
                key={index}
                style={{
                  lineHeight: 1.9,
                  marginBottom: 20,
                  whiteSpace: "pre-wrap",
                }}
              >
                {paragraph}
              </p>
            ))}
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
              After we approve the article's
              writing quality, we will connect
              this generator to the newsletter
              editor and Wednesday email
              approval workflow.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
