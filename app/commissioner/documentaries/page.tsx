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

import DocumentaryArchive
  from "./documentary-archive";

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

  const navigation = [
    {
      label: "Script Review",
      href: "#script-review",
    },
    {
      label: "Version History",
      href: "#version-history",
    },
    {
      label: "Narration",
      href: "#narration",
    },
    {
      label: "Graphics",
      href: "#graphics",
    },
    {
      label: "Video Production",
      href: "#video-production",
    },
    {
      label: "Annual Archive",
      href: "#annual-archive",
    },
  ];

  return (
    <main className="shell">

      <div className="kicker">
        THE BOYS • ORIGINAL PRODUCTIONS
      </div>

      <h1>DOCUMENTARY HQ</h1>

      <p className="muted">
        The complete documentary development
        workspace for The Boys League HQ.
        Review storylines, approve scripts,
        preview narration, develop graphics
        and review demonstration videos.
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
          The demonstration workflow includes
          persistent script reviews, editorial
          version history, local narration,
          animated graphics and silent video
          export.
        </p>

        <p className="muted">
          The annual production queue
          automatically follows the existing
          season archive calendar.
        </p>

        <p className="muted">
          Real Yahoo processing, paid AI
          generation, synchronized audio,
          permanent video storage, automated
          production and publication remain
          disabled in this workflow.
        </p>
      </section>

      <nav
        aria-label="Documentary production sections"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {navigation.map(item => (
          <a
            key={item.href}
            href={item.href}
            style={{
              background: "#173d30",
              border: "1px solid #315747",
              borderRadius: 7,
              padding: "10px 14px",
              color: "#edf7f1",
              fontSize: 12,
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div
        id="script-review"
        style={{ scrollMarginTop: 140 }}
      >
        <PersistentReviewPanel />
      </div>

      <div
        id="version-history"
        style={{ scrollMarginTop: 140 }}
      >
        <DocumentaryVersions />
      </div>

      <div
        id="narration"
        style={{ scrollMarginTop: 140 }}
      >
        <DocumentaryNarration />
      </div>

      <div
        id="graphics"
        style={{ scrollMarginTop: 140 }}
      >
        <DocumentaryGraphics />
      </div>

      <div
        id="video-production"
        style={{ scrollMarginTop: 140 }}
      >
        <DocumentaryVideo />
      </div>

      <div
        id="annual-archive"
        style={{ scrollMarginTop: 140 }}
      >
        <DocumentaryArchive />
      </div>

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