import Link from "next/link";

import {
  commissioner,
} from "../../../lib/server-auth";

import {
  createDocumentaryTestInput,
  createFictionalScript,
} from "../../../lib/documentary-test-data";

import {
  prepareDocumentaryGeneration,
} from "../../../lib/documentary-script-generator";

import {
  validateDocumentaryScript,
} from "../../../lib/documentary-script-validation";

import DocumentaryReview from "./documentary-review";

export const dynamic = "force-dynamic";

export default async function DocumentaryPage() {
  const user = await commissioner();

  if (!user) {
    return (
      <main className="shell">
        <div className="kicker">
          THE BOYS • COMMISSIONER
        </div>

        <h1>COMMISSIONER SIGN IN REQUIRED</h1>

        <Link href="/login" className="button">
          Commissioner Sign In
        </Link>
      </main>
    );
  }

  const styles = [
    "dominant",
    "comeback",
  ] as const;

  const previews = styles.map(style => {
    const input =
      createDocumentaryTestInput(style);

    const generation =
      prepareDocumentaryGeneration(input);

    if (
      !generation.verified ||
      !generation.brief
    ) {
      return {
        id: style,
        label:
          style === "dominant"
            ? "Dominant champion"
            : "Championship comeback",
        brief: null,
        review: null,
        issues: generation.issues,
        warnings: [],
      };
    }

    const brief = generation.brief;

    const script =
      createFictionalScript(
        brief.season,
        brief.centralStory.id,
        brief.championship.id
      );

    script.title =
      style === "dominant"
        ? "THE REIGN OF TERROR"
        : "AGAINST ALL ODDS";

    script.subtitle =
      style === "dominant"
        ? "A fictional dominant championship season"
        : "A fictional championship comeback";

    const validation =
      validateDocumentaryScript(
        script,
        brief
      );

    return {
      id: style,

      label:
        style === "dominant"
          ? "Dominant champion"
          : "Championship comeback",

      brief,

      review: validation.review,

      issues: validation.issues,

      warnings: [
        ...generation.warnings,
        ...validation.warnings,
      ],
    };
  });

  return (
    <main className="shell">
      <div className="kicker">
        THE BOYS • ORIGINAL PRODUCTIONS
      </div>

      <h1>DOCUMENTARY HQ</h1>

      <p className="muted">
        Review season storylines, original
        narration, production timelines and
        supporting evidence before approving
        annual league documentaries.
      </p>

      <DocumentaryReview
        previews={previews}
      />

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