import {
  createDocumentaryTestInput,
  createFictionalScript,
} from "./documentary-test-data";

import {
  prepareDocumentaryGeneration,
} from "./documentary-script-generator";

import {
  validateDocumentaryScript,
} from "./documentary-script-validation";

export const DOCUMENTARY_DEMO_IDS = [
  "dominant",
  "comeback",
] as const;

export type DocumentaryDemoId =
  (typeof DOCUMENTARY_DEMO_IDS)[number];

export function isDocumentaryDemoId(
  value: unknown
): value is DocumentaryDemoId {
  return (
    value === "dominant" ||
    value === "comeback"
  );
}

export function buildDocumentaryDemoDraft(
  previewId: DocumentaryDemoId
) {
  const input =
    createDocumentaryTestInput(previewId);

  const generation =
    prepareDocumentaryGeneration(input);

  if (
    !generation.verified ||
    !generation.brief
  ) {
    throw new Error(
      generation.issues.join("; ") ||
      "Documentary brief unavailable."
    );
  }

  const brief = generation.brief;

  const script = createFictionalScript(
    brief.season,
    brief.centralStory.id,
    brief.championship.id
  );

  script.title =
    previewId === "dominant"
      ? "THE REIGN OF TERROR"
      : "AGAINST ALL ODDS";

  script.subtitle =
    previewId === "dominant"
      ? "A fictional dominant championship season"
      : "A fictional championship comeback";

  const validation =
    validateDocumentaryScript(
      script,
      brief
    );

  if (
    !validation.verified ||
    !validation.review
  ) {
    throw new Error(
      validation.issues.join("; ") ||
      "Documentary validation failed."
    );
  }

  return {
    previewId,

    season: brief.season,

    script: validation.review.script,

    review: validation.review,

    brief,

    warnings: [
      ...generation.warnings,
      ...validation.warnings,
    ],

    fictional: true as const,

    readyForRendering: false,

    readyForPublication: false,
  };
}