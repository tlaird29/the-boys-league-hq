import {
  prepareSeasonDocumentary,
} from "./season-documentary-editor";

import {
  buildDocumentaryHistory,
  type DocumentaryHistoryInput,
} from "./documentary-history";

import {
  getRelevantLeagueLore,
  DOCUMENTARY_HUMOR_RULES,
} from "./documentary-league-lore";

import {
  detectSeasonStorylines,
} from "./season-storylines";

export type DocumentaryProductionInput =
  DocumentaryHistoryInput & {
    previousTitles?: readonly string[];
    previousOpeningLines?: readonly string[];
    previousPunchlines?: readonly string[];
  };

export type DocumentaryEvidence = {
  id: string;
  type: string;
  headline: string;
  fact: string;
  managerIds: string[];
  seasons: number[];
  weeks: number[];
  importance: number;
};

export function buildDocumentaryProductionBrief(
  input: DocumentaryProductionInput
) {
  function failure(issues: string[]) {
    return {
      verified: false as const,
      issues,
      brief: null,
      aiRequests: 0,
      yahooRequests: 0,
      databaseWrites: 0,
      readyForRendering: false,
      readyForPublication: false,
    };
  }

  if (input.fictional !== true) {
    return failure([
      "Live documentary production is disabled.",
    ]);
  }

  const editorial =
    prepareSeasonDocumentary(
      input.current
    );

  if (
    !editorial.verified ||
    !editorial.documentary
  ) {
    return failure(
      editorial.issues
    );
  }

  const historical =
    buildDocumentaryHistory(input);

  if (!historical.verified) {
    return failure(
      historical.issues
    );
  }

  const seasonAnalysis =
    detectSeasonStorylines(
      input.current
    );

  if (!seasonAnalysis.verified) {
    return failure(
      seasonAnalysis.issues
    );
  }

  const currentEvidence:
    DocumentaryEvidence[] =
      seasonAnalysis.storylines.map(
        story => ({
          id: `season:${story.id}`,
          type: story.type,
          headline: story.headline,
          fact: story.evidence,
          managerIds: story.managerIds,
          seasons: [
            input.current.season,
          ],
          weeks: story.weeks,
          importance: story.importance,
        })
      );

  const historicalEvidence:
    DocumentaryEvidence[] =
      historical.stories.map(
        story => ({
          id: `history:${story.id}`,
          type: story.type,
          headline: story.headline,
          fact: story.evidence,
          managerIds: story.managerIds,
          seasons: story.seasons,
          weeks: story.weeks,
          importance: story.importance,
        })
      );

  const allEvidence = [
    ...currentEvidence,
    ...historicalEvidence,
  ].sort(
    (a, b) =>
      b.importance - a.importance ||
      a.id.localeCompare(b.id)
  );

  const championship =
    allEvidence.find(
      item =>
        item.type === "championship"
    );

  if (!championship) {
    return failure([
      "Championship evidence is missing.",
    ]);
  }

  const centralStory =
    allEvidence.find(
      item =>
        item.type !== "championship"
    ) ?? championship;

  const selected:
    DocumentaryEvidence[] = [
      centralStory,
    ];

  const usedIds = new Set([
    centralStory.id,
    championship.id,
  ]);

  const usedTypes = new Set([
    centralStory.type,
  ]);

  for (const item of allEvidence) {
    if (selected.length >= 7) {
      break;
    }

    if (
      usedIds.has(item.id) ||
      usedTypes.has(item.type)
    ) {
      continue;
    }

    selected.push(item);
    usedIds.add(item.id);
    usedTypes.add(item.type);
  }

  if (
    centralStory.id !==
      championship.id
  ) {
    selected.push(championship);
  }

  const featuredManagerIds = [
    ...new Set(
      selected.flatMap(
        item => item.managerIds
      )
    ),
  ];

  const relevantLore =
    getRelevantLeagueLore(
      featuredManagerIds,
      input.approvedLoreIds ?? []
    );

  const proposedTitle =
    centralStory.headline.toUpperCase();

  const previousTitles =
    input.previousTitles ?? [];

  const titleAlreadyUsed =
    previousTitles.some(
      title =>
        title.trim().toLowerCase() ===
        proposedTitle
          .trim()
          .toLowerCase()
    );

  return {
    verified: true as const,
    issues: [],

    brief: {
      season: input.current.season,

      proposedTitle:
        titleAlreadyUsed
          ? null
          : proposedTitle,

      originalTitleRequired: true,

      centralStory,

      championship,

      selectedEvidence: selected,

      additionalEvidence:
        allEvidence.filter(
          item =>
            !selected.some(
              chosen =>
                chosen.id === item.id
            )
        ),

      featuredManagerIds,

      leagueLore: relevantLore,

      historicalCoverageComplete:
        historical
          .historicalCoverageComplete,

      previousDocumentaries: {
        titles: previousTitles,

        openingLines:
          input.previousOpeningLines ??
          [],

        punchlines:
          input.previousPunchlines ??
          [],
      },

      editorialInstructions: [
        ...editorial.documentary
          .editorialInstructions,

        ...DOCUMENTARY_HUMOR_RULES,

        "Treat the championship as the conclusion of a season-long story.",

        "Use historical context when it meaningfully explains the current season.",

        "Do not force every historical fact into the narration.",

        "Use the strongest storyline as the narrative thread, even if the eventual champion was not the early-season favorite.",

        "Do not repeat titles, opening lines or punchlines supplied from previous documentaries.",

        "Do not assume every current friendship or living arrangement applied in earlier seasons.",

        "Clearly distinguish historical rivalry records from current-season records.",

        "Do not describe a championship as a first-ever title unless complete historical coverage supports that claim.",

        "Use an original opening hook rather than a standard annual introduction.",

        "Vary the number of scenes, scene lengths, visual composition and storytelling structure.",

        "The final narration should sound like a coherent sports documentary, not an awards presentation or a statistical report.",

        "Use a single continuous narration with natural transitions between scenes.",

        "Every scene must identify the evidence supporting its factual statements.",

        "Use league lore only as approved editorial context, never as statistical evidence.",

        "End with ICE TF UP!",
      ],

      production: {
        durationSeconds: 120,
        minimumWords: 260,
        maximumWords: 290,
        minimumScenes: 5,
        maximumScenes: 10,
        width: 1920,
        height: 1080,
        fps: 30,

        availableGraphics: [
          "cinematic-title",
          "weekly-standings-progression",
          "winning-streak-animation",
          "losing-streak-animation",
          "head-to-head-history",
          "historical-timeline",
          "scoreboard-reveal",
          "playoff-bracket",
          "championship-banner",
          "dynasty-banner-collection",
          "award-reveal",
          "newspaper-headline",
          "closing-logo",
        ],
      },

      status: "awaiting-original-script",

      fictional: true,

      commissionerApproved: false,

      readyForRendering: false,

      readyForPublication: false,
    },

    aiRequests: 0,
    yahooRequests: 0,
    databaseWrites: 0,
    renderingRequests: 0,
    readyForRendering: false,
    readyForPublication: false,
  };
}