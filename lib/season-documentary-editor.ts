import {
  detectSeasonStorylines,
  type SeasonStorylineInput,
  type Storyline,
} from "./season-storylines";

const THEMES: Partial<
  Record<Storyline["type"], string>
> = {
  comeback: "AGAINST ALL ODDS",
  dominance: "THE REIGN OF TERROR",
  collapse: "THE FALL",
  "playoff-upset": "BRACKET BUSTERS",
  "winning-streak": "UNSTOPPABLE",
  "losing-streak": "THE LONG SEASON",
  "scoring-explosion": "ABSOLUTE CHAOS",
  blowout: "NO MERCY",
  "nail-biter": "DOWN TO THE WIRE",
};

export function prepareSeasonDocumentary(
  input: SeasonStorylineInput
) {
  const analysis =
    detectSeasonStorylines(input);

  if (!analysis.verified) {
    return {
      verified: false,
      issues: analysis.issues,
      documentary: null,
      aiRequests: 0,
      readyForPublication: false,
    };
  }

  const championship =
    analysis.storylines.find(
      story =>
        story.type === "championship"
    );

  if (!championship) {
    return {
      verified: false,
      issues: [
        "Missing championship storyline.",
      ],
      documentary: null,
      aiRequests: 0,
      readyForPublication: false,
    };
  }

  const centralStory =
    analysis.storylines.find(
      story =>
        story.type !== "championship"
    ) ?? championship;

  const title =
    THEMES[centralStory.type] ??
    "THE FINAL CHAPTER";

  const selected: Storyline[] = [
    centralStory,
  ];

  const usedIds = new Set([
    centralStory.id,
    championship.id,
  ]);

  const usedTypes = new Set([
    centralStory.type,
  ]);

  for (const story of analysis.storylines) {
    if (selected.length >= 5) break;

    if (
      usedIds.has(story.id) ||
      usedTypes.has(story.type)
    ) {
      continue;
    }

    selected.push(story);
    usedIds.add(story.id);
    usedTypes.add(story.type);
  }

  if (
    centralStory.id !== championship.id
  ) {
    selected.push(championship);
  }

  const evidence = selected.map(
    story => ({
      id: story.id,
      type: story.type,
      weeks: story.weeks,
      managers: story.managerIds,
      fact: story.evidence,
    })
  );

  const editorialInstructions = [
    "Write an original short sports documentary.",

    "Use an energetic, irreverent sports-radio voice with original jokes and dramatic storytelling.",

    "Do not imitate a specific announcer's voice or copy an existing broadcast.",

    "Make the central storyline the narrative thread throughout the documentary.",

    "Explain how the season developed, rather than reading a list of statistics.",

    "Use chronological developments where appropriate, but allow flashbacks and creative transitions.",

    "Build toward the championship and explain how the champion earned the title.",

    "Do not force identical scenes, introductions, jokes or transitions across seasons.",

    "Select a title that reflects the actual season story.",

    "Target approximately 260 to 290 spoken words for a two-minute production.",

    "Choose between five and ten scenes based on the story, not a mandatory scene template.",

    "Assign each scene a duration and supporting visual direction.",

    "All scene durations must total exactly 120 seconds.",

    "Every factual claim must be supported by supplied evidence identifiers.",

    "Do not invent injuries, draft decisions, trades, projections, player performances or game timing.",

    "Calculated standings ranks must not be described as official playoff seeds.",

    "Do not invent conversations, quotes or personal reactions.",

    "Finish with ICE TF UP!",

    "Return a complete script and dynamic storyboard for commissioner review.",
  ];

  return {
    verified: true,
    issues: [],

    documentary: {
      season: input.season,
      proposedTitle: title,
      centralStory,
      championship,
      supportingStories: selected,
      evidence,
      editorialInstructions,

      production: {
        targetSeconds: 120,
        minimumNarrationWords: 260,
        maximumNarrationWords: 290,
        minimumScenes: 5,
        maximumScenes: 10,
        width: 1920,
        height: 1080,
        fps: 30,
      },

      status: "awaiting-script",
      fictional: true,
      commissionerApproved: false,
      readyForRendering: false,
      readyForPublication: false,
    },

    aiRequests: 0,
    yahooRequests: 0,
    databaseWrites: 0,
    renderingRequests: 0,
    readyForPublication: false,
  };
}