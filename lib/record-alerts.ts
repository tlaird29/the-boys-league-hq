
import {
  RECORD_POSITIONS,
  type RecordPosition,
  type PlayerRecordCategory,
} from "./player-record-types";

import type {
  buildPlayerRecordBook,
} from "./player-record-book";

type RecordBookResult =
  ReturnType<typeof buildPlayerRecordBook>;

type AlertEntry = {
  rank: number;
  season: number;
  week?: number;

  playerId: string;
  playerName: string;

  managerId: string;
  managerName: string;

  points: number;
};

export type RecordAlert = {
  id: string;

  type:
    | "new-record"
    | "tied-record"
    | "top-25-entry"
    | "ranking-improved";

  period:
    | "season"
    | "weekly";

  category: PlayerRecordCategory;

  position: RecordPosition;

  playerName: string;
  managerName: string;

  season: number;
  week: number;

  points: number;

  previousRecord: number | null;

  previousRank: number | null;

  currentRank: number;

  priority: number;

  headline: string;
};

const CATEGORIES:
  PlayerRecordCategory[] = [
    "regularSeason",
    "playoffs",
    "combined",
  ];

const CATEGORY_LABELS = {
  regularSeason: "regular-season",
  playoffs: "playoff",
  combined: "all-time",
};

function entryKey(
  entry: AlertEntry
) {
  return JSON.stringify([
    entry.season,
    entry.week ?? null,
    entry.playerId,
    entry.managerId,
  ]);
}

export function detectRecordAlerts(
  previous: RecordBookResult,
  current: RecordBookResult,

  season: number,
  week: number
) {
  const issues: string[] = [];

  const alerts: RecordAlert[] = [];

  if (
    !previous.verified ||
    !current.verified ||
    !previous.seasonRecords ||
    !previous.weeklyRecords ||
    !current.seasonRecords ||
    !current.weeklyRecords
  ) {
    issues.push(
      "Both Record Book snapshots must be verified."
    );
  }

  if (
    !Number.isInteger(season) ||
    season < 2020 ||
    !Number.isInteger(week) ||
    week < 1 ||
    week > 18
  ) {
    issues.push(
      "Invalid record alert reporting period."
    );
  }

  if (issues.length > 0) {
    return {
      verified: false,
      issues,
      alerts,
      readyForPublication: false,
    };
  }

  function compare(
    before: readonly AlertEntry[],
    after: readonly AlertEntry[],

    period: "season" | "weekly",

    category: PlayerRecordCategory,

    position: RecordPosition
  ) {
    // An empty historical leaderboard
    // cannot establish a broken record.
    if (before.length === 0) {
      return;
    }

    const previousRecord =
      before[0].points;

    const previousEntries =
      new Map(
        before.map(entry => [
          entryKey(entry),
          entry,
        ])
      );

    for (const entry of after) {
      if (
        entry.season !== season ||
        (
          period === "weekly" &&
          entry.week !== week
        )
      ) {
        continue;
      }

      const old =
        previousEntries.get(
          entryKey(entry)
        );

      if (
        old &&
        old.points === entry.points &&
        old.rank === entry.rank
      ) {
        continue;
      }

      const label =
        `${CATEGORY_LABELS[category]} ` +
        `${position} ${period}`;

      let type:
        RecordAlert["type"];

      let priority: number;

      let headline: string;

      if (
        entry.rank === 1 &&
        entry.points > previousRecord
      ) {
        type = "new-record";
        priority = 100;

        headline =
          `NEW RECORD: ${entry.playerName} ` +
          `sets the ${label} scoring record ` +
          `with ${entry.points.toFixed(2)} points ` +
          `for ${entry.managerName}.`;

      } else if (
        entry.rank === 1 &&
        entry.points === previousRecord &&
        (!old || old.points < previousRecord)
      ) {
        type = "tied-record";
        priority = 90;

        headline =
          `RECORD TIED: ${entry.playerName} ` +
          `matches the ${label} record ` +
          `at ${entry.points.toFixed(2)} points.`;

      } else if (!old) {
        type = "top-25-entry";
        priority = 60;

        headline =
          `RECORD BOOK: ${entry.playerName} ` +
          `enters the ${label} Top 25 ` +
          `at No. ${entry.rank} ` +
          `for ${entry.managerName}.`;

      } else if (
        entry.rank < old.rank &&
        entry.points > old.points
      ) {
        type = "ranking-improved";
        priority = 40;

        headline =
          `${entry.playerName} moves from ` +
          `No. ${old.rank} to No. ${entry.rank} ` +
          `in the ${label} rankings.`;

      } else {
        continue;
      }

      alerts.push({
        id: JSON.stringify([
          season,
          week,
          period,
          category,
          position,
          entryKey(entry),
          type,
        ]),

        type,
        period,
        category,
        position,

        playerName: entry.playerName,

        managerName: entry.managerName,

        season,
        week,

        points: entry.points,

        previousRecord,

        previousRank:
          old?.rank ?? null,

        currentRank: entry.rank,

        priority,
        headline,
      });
    }
  }

  for (const category of CATEGORIES) {
    for (
      const position of RECORD_POSITIONS
    ) {
      compare(
        previous.seasonRecords![category][position],
        current.seasonRecords![category][position],

        "season",
        category,
        position
      );

      compare(
        previous.weeklyRecords![category][position],
        current.weeklyRecords![category][position],

        "weekly",
        category,
        position
      );
    }
  }

  alerts.sort(
    (a, b) =>
      b.priority - a.priority ||
      a.currentRank - b.currentRank ||
      a.id.localeCompare(b.id)
  );

  return {
    verified: true,

    issues,

    alerts,

    summary: {
      recordsBroken:
        alerts.filter(
          alert => alert.type === "new-record"
        ).length,

      recordsTied:
        alerts.filter(
          alert => alert.type === "tied-record"
        ).length,

      newTop25Entries:
        alerts.filter(
          alert => alert.type === "top-25-entry"
        ).length,

      improvedRankings:
        alerts.filter(
          alert => alert.type === "ranking-improved"
        ).length,
    },

    readyForPublication: false,

    yahooRequests: 0,
    aiRequests: 0,
    databaseWrites: 0,
    emailsSent: 0,
  };
}
