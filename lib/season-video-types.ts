export const SEASON_VIDEO_CONFIG = {
  width: 1920,
  height: 1080,
  fps: 30,
  durationSeconds: 120,
  format: "mp4",
  videoCodec: "h264",
  audioCodec: "aac",

  brand: {
    name: "THE BOYS",
    primary: "#14251f",
    secondary: "#48d6a8",
    gold: "#c9a64b",
    cream: "#f4f0e4",
    background: "#091711",
    closing: "ICE TF UP!",
  },
} as const;

export const SEASON_VIDEO_SEGMENTS = [
  {
    id: "opening",
    title: "Opening",
    seconds: 8,
    graphic: "title-reveal",
  },
  {
    id: "regular-season",
    title: "Regular Season",
    seconds: 20,
    graphic: "standings-board",
  },
  {
    id: "performances",
    title: "Biggest Performances",
    seconds: 18,
    graphic: "scoreboard",
  },
  {
    id: "rivalries",
    title: "Rivalry Highlights",
    seconds: 16,
    graphic: "head-to-head",
  },
  {
    id: "playoffs",
    title: "Playoff Drama",
    seconds: 20,
    graphic: "playoff-bracket",
  },
  {
    id: "championship",
    title: "Championship Celebration",
    seconds: 16,
    graphic: "championship-banner",
  },
  {
    id: "awards",
    title: "Awards and Hall of Shame",
    seconds: 16,
    graphic: "award-reveal",
  },
  {
    id: "closing",
    title: "Closing",
    seconds: 6,
    graphic: "closing-logo",
  },
] as const;

export type VideoSegmentDefinition =
  (typeof SEASON_VIDEO_SEGMENTS)[number];

export type VideoSegmentId =
  VideoSegmentDefinition["id"];

export type VideoGraphic =
  VideoSegmentDefinition["graphic"];

export type VideoStatistic = {
  label: string;
  value: string;
  detail?: string;
};

export type SeasonVideoStory = {
  id: VideoSegmentId;
  headline: string;
  narration: string;
  statistics: VideoStatistic[];
};

export type SeasonVideoScene =
  SeasonVideoStory & {
    graphic: VideoGraphic;
    startSeconds: number;
    endSeconds: number;
    durationSeconds: number;
    startFrame: number;
    endFrame: number;
    transition:
      | "fade"
      | "scoreboard-wipe"
      | "flash"
      | "slide";
  };

export type SeasonVideoPlan = {
  season: number;
  title: string;
  durationSeconds: number;
  totalFrames: number;
  width: number;
  height: number;
  fps: number;
  scenes: SeasonVideoScene[];
  narrationScript: string;
  narrationWordCount: number;
  outputFilename: string;
  status: "draft";
  fictional: true;
  readyForRendering: false;
  readyForPublication: false;
};