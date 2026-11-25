
import type {
  RecordAlert,
} from "./record-alerts";

import type {
  CareerMilestone,
  ApproachingPlayerRecord,
} from "./record-milestones";

export type LeagueNewsCategory =
  | "BREAKING NEWS"
  | "RECORD WATCH"
  | "MILESTONE"
  | "MATCHUP WATCH"
  | "LEAGUE ACTIVITY"
  | "WEEKLY AWARDS"
  | "TRADE HUB"
  | "COMMISSIONER"
  | "LEAGUE HQ";

export type LeagueNewsItem = {
  id: string;
  category: LeagueNewsCategory;
  headline: string;
  priority: number;
};

export type LeagueNewsInput = {
  recordAlerts?: readonly RecordAlert[];

  careerMilestones?:
    readonly CareerMilestone[];

  approachingRecords?:
    readonly ApproachingPlayerRecord[];

  additionalNews?:
    readonly LeagueNewsItem[];
};

export const DEFAULT_LEAGUE_NEWS:
  readonly LeagueNewsItem[] = [
    {
      id: "default-hq",
      category: "LEAGUE HQ",
      headline:
        "Welcome to THE BOYS BottomLine — the league never sleeps.",
      priority: 10,
    },
    {
      id: "default-records",
      category: "RECORD WATCH",
      headline:
        "The Record Book is waiting for its next headline.",
      priority: 10,
    },
    {
      id: "default-trades",
      category: "TRADE HUB",
      headline:
        "Evaluate offers with The Good Faith Trade.",
      priority: 10,
    },
    {
      id: "default-history",
      category: "LEAGUE HQ",
      headline:
        "Every championship. Every rivalry. Every receipt. Est. 2020.",
      priority: 10,
    },
    {
      id: "default-commissioner",
      category: "COMMISSIONER",
      headline:
        "The official word comes straight from League HQ.",
      priority: 10,
    },
  ];

export function buildLeagueNewsFeed(
  input: LeagueNewsInput = {},
  limit = 20
): LeagueNewsItem[] {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 50
  ) {
    throw new Error(
      "Invalid league news feed limit."
    );
  }

  const items: LeagueNewsItem[] = [];

  for (
    const alert of input.recordAlerts ?? []
  ) {
    items.push({
      id: alert.id,

      category:
        alert.type === "new-record"
          ? "BREAKING NEWS"
          : "RECORD WATCH",

      headline: alert.headline,

      priority: alert.priority,
    });
  }

  for (
    const milestone of
      input.careerMilestones ?? []
  ) {
    items.push({
      id: milestone.id,

      category: "MILESTONE",

      headline: milestone.headline,

      priority:
        milestone.status === "achieved"
          ? 85
          : 50,
    });
  }

  for (
    const record of
      input.approachingRecords ?? []
  ) {
    items.push({
      id: JSON.stringify([
        "approaching",
        record.season,
        record.playerId,
        record.managerId,
        record.category,
        record.type,
      ]),

      category: "RECORD WATCH",

      headline: record.headline,

      priority:
        record.type === "first-place"
          ? 55
          : 35,
    });
  }

  items.push(
    ...(input.additionalNews ?? [])
  );

  const unique =
    new Map<string, LeagueNewsItem>();

  const headlines =
    new Set<string>();

  const sorted = items
    .filter(
      item =>
        item.id.trim() &&
        item.headline.trim() &&
        Number.isFinite(item.priority)
    )
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        a.id.localeCompare(b.id)
    );

  for (const item of sorted) {
    const normalized =
      item.headline
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();

    if (
      unique.has(item.id) ||
      headlines.has(normalized)
    ) {
      continue;
    }

    unique.set(item.id, {
      ...item,
      headline: item.headline.trim(),
    });

    headlines.add(normalized);
  }

  if (unique.size === 0) {
    return DEFAULT_LEAGUE_NEWS
      .slice(0, limit);
  }

  return [...unique.values()]
    .slice(0, limit);
}
