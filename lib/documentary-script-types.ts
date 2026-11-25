export const DOCUMENTARY_SCRIPT_CONFIG = {
  durationSeconds: 120,
  minimumScenes: 5,
  maximumScenes: 10,
  minimumWords: 260,
  maximumWords: 290,
  minimumSceneSeconds: 5,
  maximumSceneSeconds: 35,
  width: 1920,
  height: 1080,
  fps: 30,
  closingLine: "ICE TF UP!",
} as const;

export const DOCUMENTARY_GRAPHICS = [
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
  "player-performance-card",
  "draft-pick-reveal",
  "transaction-scoreboard",
  "player-contribution-chart",
  "championship-hero-reveal",
] as const;

export const DOCUMENTARY_TRANSITIONS = [
  "fade",
  "cut",
  "slide",
  "scoreboard-wipe",
  "flash",
  "zoom",
] as const;

export type DocumentaryGraphic =
  (typeof DOCUMENTARY_GRAPHICS)[number];

export type DocumentaryTransition =
  (typeof DOCUMENTARY_TRANSITIONS)[number];

export type DocumentaryScriptScene = {
  id: string;
  headline: string;
  narration: string;
  durationSeconds: number;
  graphic: DocumentaryGraphic;
  visualDirection: string;
  transition: DocumentaryTransition;
  evidenceIds: string[];
  loreIds: string[];
};

export type DocumentaryScript = {
  season: number;
  title: string;
  subtitle: string;
  centralStoryId: string;
  scenes: DocumentaryScriptScene[];
};

export type DocumentaryTimelineScene =
  DocumentaryScriptScene & {
    startSeconds: number;
    endSeconds: number;
    startFrame: number;
    endFrame: number;
    narrationWords: number;
    estimatedWordsPerMinute: number;
  };

export type DocumentaryScriptReview = {
  script: DocumentaryScript;
  timeline: DocumentaryTimelineScene[];
  fullNarration: string;
  totalWords: number;
  totalSeconds: number;
  totalFrames: number;
  evidenceUsed: string[];
  status: "awaiting-commissioner-review";
  fictional: true;
  factualReviewRequired: true;
  commissionerApproved: false;
  readyForRendering: false;
  readyForPublication: false;
};

export function countDocumentaryWords(
  value: string
) {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

export function normalizeDocumentaryText(
  value: string
) {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}