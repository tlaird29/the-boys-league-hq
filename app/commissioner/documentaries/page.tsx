import Link from "next/link";

import {
  commissioner,
} from "../../../lib/server-auth";

import {
  DOCUMENTARY_DEMO_IDS,
  buildDocumentaryDemoDraft,
} from "../../../lib/documentary-demo-draft";

import DocumentaryReview
  from "./documentary-review";

import PersistentReviewPanel
  from "./persistent-review-panel";

import DocumentaryVersions
  from "./documentary-versions";

import DocumentaryNarration
  from "./documentary-narration";

import DocumentaryGraphics
  from "./documentary-graphics";

import DocumentaryVideo
  from "./documentary-video";

export const dynamic = "force-dynamic";

export default async function DocumentaryPage() {
  const user = await commissioner();

  if (!user) {
    return (
      <main className="shell">
        <div className="kicker">
          THE BOYS • COMMISSIONER
        </div>

        <h1>
          COMMISSIONER SIGN IN REQUIRED
        </h1>

        <Link
          href="/login"
          className="button"
        >
          Commissioner Sign In
        </Link>
      </main>
    );
  }

  const previews =
    DOCUMENTARY_DEMO_IDS.map(id => {
      const label =
        id === "dominant"
          ? "Dominant champion"
          : "Championship comeback";

      try {
        const demo =
          buildDocumentaryDemoDraft(id);

        return {
          id,
          label,
          brief: demo.brief,
          review: demo.review,
          issues: [],
          warnings: demo.warnings,
        };

      } catch (error) {
        return {
          id,
          label,
          brief: null,
          review: null,

          issues: [
            error instanceof Error
              ? error.message
              : "Preview unavailable.",
          ],

          warnings: [],
        };
      }
    });

  return (
    <main className="shell">

      <div className="kicker">
        THE BOYS • ORIGINAL PRODUCTIONS
      </div>

      <h1>DOCUMENTARY HQ</h1>

      <p className="muted">
        Review season storylines,
        original narration, production
        timelines and supporting evidence
        before approving annual league
        documentaries.
      </p>

      <section
        style={{
          border: "1px solid #315747",
          borderRadius: 10,
          padding: 18,
          marginBottom: 24,
        }}
      >
        <strong
          style={{ color: "#48d6a8" }}
        >
          FICTIONAL PRODUCTION MODE
        </strong>

        <p className="muted">
          Documentary drafts, editorial
          revisions and review decisions
          can be saved. Approved scripts
          are available for local narration,
          animated graphics previews and
          silent demonstration video export.
        </p>

        <p className="muted">
          Real Yahoo data, paid AI generation,
          synchronized audio production,
          permanent video storage and
          publication remain disabled.
        </p>
      </section>

      <PersistentReviewPanel />

      <DocumentaryVersions />

      <DocumentaryNarration />

      <DocumentaryGraphics />

      <DocumentaryVideo />

      <details
        style={{
          marginTop: 30,
          marginBottom: 24,
          border: "1px solid #315747",
          borderRadius: 10,
          padding: 18,
        }}
      >
        <summary
          style={{
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          STORYLINE & PRODUCTION PREVIEW
        </summary>

        <p className="muted">
          This is the original production
          simulator. Review actions inside
          this preview are temporary.
          Use the persistent review panel
          above to save official demo
          script decisions.
        </p>

        <DocumentaryReview
          previews={previews}
        />
      </details>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 12,
          marginTop: 28,
        }}
      >
        <Link
          href="/commissioner"
          className="button"
        >
          COMMISSIONER HQ
        </Link>

        <Link
          href="/seasons"
          className="button"
        >
          SEASON ARCHIVES
        </Link>

        <Link
          href="/awards"
          className="button"
        >
          YEAR IN REVIEW
        </Link>
      </div>

    </main>
  );
}