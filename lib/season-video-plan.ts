import {
  SEASON_VIDEO_CONFIG,
  SEASON_VIDEO_SEGMENTS,
  type SeasonVideoPlan,
  type SeasonVideoScene,
  type VideoSegmentId,
} from "./season-video-types";

import {
  buildSeasonVideoStory,
  type FictionalSeasonVideoInput,
} from "./season-video-story";

const TRANSITIONS: Record<
  VideoSegmentId,
  SeasonVideoScene["transition"]
> = {
  opening: "fade",
  "regular-season": "scoreboard-wipe",
  performances: "flash",
  rivalries: "slide",
  playoffs: "scoreboard-wipe",
  championship: "flash",
  awards: "slide",
  closing: "fade",
};

function countWords(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

export function buildSeasonVideoPlan(
  input: FictionalSeasonVideoInput
) {
  const issues: string[] = [];
  const warnings: string[] = [];

  function failure() {
    return {
      verified: false as const,
      issues,
      warnings,
      plan: null,
      yahooRequests: 0,
      aiRequests: 0,
      renderingRequests: 0,
      databaseWrites: 0,
      readyForPublication: false,
    };
  }

  try {
    const stories =
      buildSeasonVideoStory(input);

    const scenes: SeasonVideoScene[] =
      [];

    let elapsedSeconds = 0;

    for (
      const segment of
      SEASON_VIDEO_SEGMENTS
    ) {
      const matchingStories =
        stories.filter(
          story =>
            story.id === segment.id
        );

      if (
        matchingStories.length !== 1
      ) {
        issues.push(
          `Missing or duplicate story: ${segment.id}`
        );

        continue;
      }

      const story = matchingStories[0];

      const startSeconds =
        elapsedSeconds;

      const endSeconds =
        startSeconds +
        segment.seconds;

      const wordCount =
        countWords(story.narration);

      const estimatedSpeakingSeconds =
        wordCount / 160 * 60;

      if (
        estimatedSpeakingSeconds >
        segment.seconds
      ) {
        warnings.push(
          `${segment.title}: narration may exceed its allocated duration.`
        );
      }

      scenes.push({
        ...story,

        graphic: segment.graphic,

        startSeconds,
        endSeconds,

        durationSeconds:
          segment.seconds,

        startFrame:
          startSeconds *
          SEASON_VIDEO_CONFIG.fps,

        endFrame:
          endSeconds *
          SEASON_VIDEO_CONFIG.fps,

        transition:
          TRANSITIONS[segment.id],
      });

      elapsedSeconds =
        endSeconds;
    }

    if (
      scenes.length !==
      SEASON_VIDEO_SEGMENTS.length
    ) {
      issues.push(
        "The video does not contain every required segment."
      );
    }

    if (
      elapsedSeconds !==
      SEASON_VIDEO_CONFIG.durationSeconds
    ) {
      issues.push(
        "The timeline does not total 120 seconds."
      );
    }

    for (
      let index = 1;
      index < scenes.length;
      index++
    ) {
      if (
        scenes[index].startFrame !==
        scenes[index - 1].endFrame
      ) {
        issues.push(
          "The timeline contains a gap or overlapping frames."
        );
      }
    }

    if (issues.length > 0) {
      return failure();
    }

    const narrationScript =
      scenes
        .map(
          scene => scene.narration
        )
        .join("\n\n");

    const narrationWordCount =
      countWords(narrationScript);

    if (
      narrationWordCount > 320
    ) {
      warnings.push(
        "The full narration may exceed two minutes at 160 words per minute."
      );
    }

    const plan: SeasonVideoPlan = {
      season: input.season,

      title: input.title,

      durationSeconds:
        elapsedSeconds,

      totalFrames:
        elapsedSeconds *
        SEASON_VIDEO_CONFIG.fps,

      width:
        SEASON_VIDEO_CONFIG.width,

      height:
        SEASON_VIDEO_CONFIG.height,

      fps:
        SEASON_VIDEO_CONFIG.fps,

      scenes,

      narrationScript,

      narrationWordCount,

      outputFilename:
        `the-boys-${input.season}-fictional-preview.mp4`,

      status: "draft",

      fictional: true,

      readyForRendering: false,

      readyForPublication: false,
    };

    return {
      verified: true as const,
      issues: [],
      warnings,
      plan,
      yahooRequests: 0,
      aiRequests: 0,
      renderingRequests: 0,
      databaseWrites: 0,
      readyForPublication: false,
    };
  } catch (error) {
    issues.push(
      error instanceof Error
        ? error.message
        : "Video planning failed."
    );

    return failure();
  }
}

export function getVideoSceneAtFrame(
  plan: SeasonVideoPlan,
  frame: number
): SeasonVideoScene | null {
  if (
    !Number.isInteger(frame) ||
    frame < 0 ||
    frame >= plan.totalFrames
  ) {
    return null;
  }

  return (
    plan.scenes.find(
      scene =>
        frame >= scene.startFrame &&
        frame < scene.endFrame
    ) ?? null
  );
}