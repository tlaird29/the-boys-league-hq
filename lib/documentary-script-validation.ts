import {
  DOCUMENTARY_SCRIPT_CONFIG,
  DOCUMENTARY_GRAPHICS,
  DOCUMENTARY_TRANSITIONS,
  countDocumentaryWords,
  normalizeDocumentaryText,
  type DocumentaryScript,
  type DocumentaryScriptScene,
  type DocumentaryTimelineScene,
  type DocumentaryScriptReview,
  type DocumentaryGraphic,
  type DocumentaryTransition,
} from "./documentary-script-types";

import type {
  buildCompleteDocumentaryBrief,
} from "./documentary-complete-brief";

type CompleteBrief = NonNullable<
  ReturnType<
    typeof buildCompleteDocumentaryBrief
  >["brief"]
>;

function isObject(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function isText(
  value: unknown,
  maximumLength: number
): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maximumLength
  );
}

function isStringArray(
  value: unknown
): value is string[] {
  return (
    Array.isArray(value) &&
    value.every(
      item =>
        typeof item === "string" &&
        item.trim().length > 0
    )
  );
}

export function validateDocumentaryScript(
  raw: unknown,
  brief: CompleteBrief
) {
  const issues: string[] = [];
  const warnings: string[] = [];

  function failure() {
    return {
      verified: false as const,
      issues,
      warnings,
      review: null,
      readyForRendering: false,
      readyForPublication: false,
    };
  }

  if (brief.fictional !== true) {
    issues.push(
      "Only fictional script validation is enabled."
    );

    return failure();
  }

  let parsed: unknown = raw;

  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch {
      issues.push(
        "Script response is not valid JSON."
      );

      return failure();
    }
  }

  if (!isObject(parsed)) {
    issues.push(
      "Script must be a JSON object."
    );

    return failure();
  }

  if (parsed.season !== brief.season) {
    issues.push(
      "Script season does not match the production brief."
    );
  }

  if (!isText(parsed.title, 100)) {
    issues.push(
      "A valid original title is required."
    );
  }

  if (!isText(parsed.subtitle, 200)) {
    issues.push(
      "A valid subtitle is required."
    );
  }

  if (
    parsed.centralStoryId !==
      brief.centralStory.id
  ) {
    issues.push(
      "The script does not identify the selected central storyline."
    );
  }

  if (
    !Array.isArray(parsed.scenes) ||
    parsed.scenes.length <
      DOCUMENTARY_SCRIPT_CONFIG
        .minimumScenes ||
    parsed.scenes.length >
      DOCUMENTARY_SCRIPT_CONFIG
        .maximumScenes
  ) {
    issues.push(
      "The documentary must contain between five and ten scenes."
    );

    return failure();
  }

  const allowedEvidence = new Set(
    [
      ...brief.selectedEvidence,
      ...brief.additionalEvidence,
    ].map(item => item.id)
  );

  const allowedLore = new Set(
    brief.leagueLore.map(
      item => item.id
    )
  );

  const allowedGraphics =
    new Set<string>(
      DOCUMENTARY_GRAPHICS
    );

  const allowedTransitions =
    new Set<string>(
      DOCUMENTARY_TRANSITIONS
    );

  const usedSceneIds =
    new Set<string>();

  const usedEvidence =
    new Set<string>();

  const scenes:
    DocumentaryScriptScene[] = [];

  for (
    let index = 0;
    index < parsed.scenes.length;
    index++
  ) {
    const scene =
      parsed.scenes[index];

    const label =
      `Scene ${index + 1}`;

    if (!isObject(scene)) {
      issues.push(
        `${label}: invalid scene object.`
      );

      continue;
    }

    if (
      !isText(scene.id, 80) ||
      !isText(scene.headline, 120) ||
      !isText(scene.narration, 2500) ||
      !isText(
        scene.visualDirection,
        1500
      ) ||
      typeof scene.durationSeconds !==
        "number" ||
      !Number.isInteger(
        scene.durationSeconds
      ) ||
      scene.durationSeconds <
        DOCUMENTARY_SCRIPT_CONFIG
          .minimumSceneSeconds ||
      scene.durationSeconds >
        DOCUMENTARY_SCRIPT_CONFIG
          .maximumSceneSeconds ||
      typeof scene.graphic !==
        "string" ||
      !allowedGraphics.has(
        scene.graphic
      ) ||
      typeof scene.transition !==
        "string" ||
      !allowedTransitions.has(
        scene.transition
      ) ||
      !isStringArray(
        scene.evidenceIds
      ) ||
      !isStringArray(
        scene.loreIds
      )
    ) {
      issues.push(
        `${label}: missing or invalid required fields.`
      );

      continue;
    }

    if (usedSceneIds.has(scene.id)) {
      issues.push(
        `${label}: duplicate scene ID.`
      );
    }

    usedSceneIds.add(scene.id);

    if (
      scene.evidenceIds.length === 0
    ) {
      issues.push(
        `${label}: no supporting evidence was cited.`
      );
    }

    for (
      const evidenceId of
      scene.evidenceIds
    ) {
      if (
        !allowedEvidence.has(
          evidenceId
        )
      ) {
        issues.push(
          `${label}: unknown evidence ID ${evidenceId}.`
        );
      }

      usedEvidence.add(evidenceId);
    }

    for (
      const loreId of scene.loreIds
    ) {
      if (!allowedLore.has(loreId)) {
        issues.push(
          `${label}: unapproved league lore ${loreId}.`
        );
      }
    }

    scenes.push({
      id: scene.id,
      headline: scene.headline.trim(),
      narration: scene.narration.trim(),

      durationSeconds:
        scene.durationSeconds,

      graphic:
        scene.graphic as
          DocumentaryGraphic,

      visualDirection:
        scene.visualDirection.trim(),

      transition:
        scene.transition as
          DocumentaryTransition,

      evidenceIds: [
        ...new Set(
          scene.evidenceIds
        ),
      ],

      loreIds: [
        ...new Set(scene.loreIds),
      ],
    });
  }

  if (
    !usedEvidence.has(
      brief.centralStory.id
    )
  ) {
    issues.push(
      "The central storyline is not referenced."
    );
  }

  if (
    !usedEvidence.has(
      brief.championship.id
    )
  ) {
    issues.push(
      "Championship evidence is not referenced."
    );
  }

  if (
    issues.length > 0 ||
    scenes.length !==
      parsed.scenes.length ||
    typeof parsed.title !==
      "string" ||
    typeof parsed.subtitle !==
      "string"
  ) {
    return failure();
  }

  const script: DocumentaryScript = {
    season: brief.season,

    title: parsed.title.trim(),

    subtitle:
      parsed.subtitle.trim(),

    centralStoryId:
      brief.centralStory.id,

    scenes,
  };

  const normalizedTitle =
    normalizeDocumentaryText(
      script.title
    );

  if (!normalizedTitle) {
    issues.push(
      "The documentary title is empty after normalization."
    );
  }

  const repeatedTitle =
    brief.previousDocumentaries
      .titles.some(
        title =>
          normalizeDocumentaryText(
            title
          ) === normalizedTitle
      );

  if (repeatedTitle) {
    issues.push(
      "This documentary title was previously used."
    );
  }

  const fullNarration =
    scenes
      .map(
        scene => scene.narration
      )
      .join("\n\n");

  const normalizedNarration =
    normalizeDocumentaryText(
      fullNarration
    );

  const previousPhrases = [
    ...brief.previousDocumentaries
      .openingLines,

    ...brief.previousDocumentaries
      .punchlines,
  ];

  for (
    const phrase of previousPhrases
  ) {
    const normalized =
      normalizeDocumentaryText(
        phrase
      );

    if (
      normalized.length >= 20 &&
      countDocumentaryWords(
        normalized
      ) >= 4 &&
      normalizedNarration.includes(
        normalized
      )
    ) {
      issues.push(
        "Narration contains a previously used opening line or punchline."
      );
    }
  }

  const totalWords =
    countDocumentaryWords(
      fullNarration
    );

  if (
    totalWords <
      DOCUMENTARY_SCRIPT_CONFIG
        .minimumWords ||
    totalWords >
      DOCUMENTARY_SCRIPT_CONFIG
        .maximumWords
  ) {
    issues.push(
      `Narration contains ${totalWords} words. Required range: 260–290.`
    );
  }

  const totalSeconds =
    scenes.reduce(
      (sum, scene) =>
        sum +
        scene.durationSeconds,
      0
    );

  if (
    totalSeconds !==
      DOCUMENTARY_SCRIPT_CONFIG
        .durationSeconds
  ) {
    issues.push(
      `Timeline totals ${totalSeconds} seconds instead of 120.`
    );
  }

  if (
    !fullNarration.trim().endsWith(
      DOCUMENTARY_SCRIPT_CONFIG
        .closingLine
    )
  ) {
    issues.push(
      "The documentary must end with ICE TF UP!"
    );
  }

  const finalScene =
    scenes[scenes.length - 1];

  if (
    finalScene.graphic !==
      "closing-logo"
  ) {
    issues.push(
      "The final scene must use the closing logo graphic."
    );
  }

  let elapsedSeconds = 0;

  const timeline:
    DocumentaryTimelineScene[] =
      scenes.map(scene => {
        const startSeconds =
          elapsedSeconds;

        const endSeconds =
          startSeconds +
          scene.durationSeconds;

        elapsedSeconds =
          endSeconds;

        const narrationWords =
          countDocumentaryWords(
            scene.narration
          );

        const estimatedWordsPerMinute =
          Math.round(
            narrationWords /
              scene.durationSeconds *
              60
          );

        if (
          estimatedWordsPerMinute >
            185
        ) {
          issues.push(
            `${scene.id}: narration is too dense for its allocated duration.`
          );
        } else if (
          estimatedWordsPerMinute >
            160
        ) {
          warnings.push(
            `${scene.id}: narration may require a faster delivery.`
          );
        }

        return {
          ...scene,

          startSeconds,
          endSeconds,

          startFrame:
            startSeconds *
            DOCUMENTARY_SCRIPT_CONFIG
              .fps,

          endFrame:
            endSeconds *
            DOCUMENTARY_SCRIPT_CONFIG
              .fps,

          narrationWords,

          estimatedWordsPerMinute,
        };
      });

  if (issues.length > 0) {
    return failure();
  }

  warnings.push(
    "Evidence references are structurally valid, but every factual claim still requires review."
  );

  warnings.push(
    "Actual narration audio duration must be measured before final rendering."
  );

  const review:
    DocumentaryScriptReview = {
      script,

      timeline,

      fullNarration,

      totalWords,

      totalSeconds,

      totalFrames:
        totalSeconds *
        DOCUMENTARY_SCRIPT_CONFIG
          .fps,

      evidenceUsed: [
        ...usedEvidence,
      ],

      status:
        "awaiting-commissioner-review",

      fictional: true,

      factualReviewRequired: true,

      commissionerApproved: false,

      readyForRendering: false,

      readyForPublication: false,
    };

  return {
    verified: true as const,
    issues: [],
    warnings,
    review,
    readyForRendering: false,
    readyForPublication: false,
  };
}