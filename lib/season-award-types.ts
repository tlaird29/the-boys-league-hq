export const SEASON_AWARD_DEFINITIONS = [
  {
    id: "champion",
    name: "League Champion",
    icon: "🏆",
    group: "honors",
    method: "automatic",
    description: "The official league champion.",
  },
  {
    id: "manager-of-year",
    name: "Manager of the Year",
    icon: "👑",
    group: "honors",
    method: "review",
    description: "The season's defining manager.",
  },
  {
    id: "league-mvp",
    name: "League MVP",
    icon: "⭐",
    group: "honors",
    method: "review",
    description: "The most impactful fantasy player.",
  },
  {
    id: "highest-scoring-team",
    name: "Highest Scoring Team",
    icon: "🔥",
    group: "honors",
    method: "automatic",
    description: "Most points in official season matchups.",
  },
  {
    id: "draft-steal",
    name: "Draft Steal",
    icon: "💎",
    group: "honors",
    method: "review",
    description: "Exceptional production relative to draft cost.",
  },
  {
    id: "trade-of-year",
    name: "Trade of the Year",
    icon: "🤝",
    group: "honors",
    method: "review",
    description: "The trade with the greatest positive impact.",
  },
  {
    id: "performance-of-year",
    name: "Performance of the Year",
    icon: "⚡",
    group: "honors",
    method: "automatic",
    description: "Highest official weekly team score.",
  },
  {
    id: "bum-of-year",
    name: "BUM of the Year",
    icon: "💀",
    group: "shame",
    method: "review",
    description: "The season's defining disappointment.",
  },
  {
    id: "collapse",
    name: "The Collapse",
    icon: "📉",
    group: "shame",
    method: "review",
    description: "The most dramatic decline by a contender.",
  },
  {
    id: "draft-disaster",
    name: "Draft Disaster",
    icon: "🤡",
    group: "shame",
    method: "review",
    description: "The most disappointing return on draft investment.",
  },
  {
    id: "trade-robbery",
    name: "Trade Robbery",
    icon: "🚨",
    group: "shame",
    method: "review",
    description: "The most one-sided trade in hindsight.",
  },
  {
    id: "worst-weekly-score",
    name: "Worst Weekly Score",
    icon: "🧊",
    group: "shame",
    method: "automatic",
    description: "Lowest official weekly team score.",
  },
  {
    id: "last-place",
    name: "Last Place Finisher",
    icon: "🥀",
    group: "shame",
    method: "automatic",
    description: "The manager at the bottom of the official final standings.",
  },
] as const;

export type AwardDefinition =
  (typeof SEASON_AWARD_DEFINITIONS)[number];

export type SeasonAwardId =
  AwardDefinition["id"];

export type AwardStatus =
  | "awaiting-data"
  | "awaiting-season-completion"
  | "awaiting-review"
  | "calculated"
  | "approved";

export type AwardRecipient = {
  managerId: string;
  managerName: string;
  teamName: string;
  playerName?: string;
  value?: number;
  unit?: string;
  week?: number;
  evidence: string;
};

export type SeasonAward = {
  season: number;
  id: SeasonAwardId;
  name: string;
  icon: string;
  group: "honors" | "shame";
  method: "automatic" | "review";
  description: string;
  status: AwardStatus;
  recipients: AwardRecipient[];
  explanation: string;
};

export function createPendingSeasonAwards(
  season: number,
  seasonComplete = false
): SeasonAward[] {
  return SEASON_AWARD_DEFINITIONS.map(
    definition => ({
      ...definition,
      season,
      status: seasonComplete
        ? "awaiting-data"
        : "awaiting-season-completion",
      recipients: [],
      explanation: seasonComplete
        ? "Awaiting verified season evidence."
        : "Final awards are determined after the season ends.",
    })
  );
}