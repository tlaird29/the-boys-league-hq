
import {
  calculateLifetimeRecords,
} from "./lifetime-records";

import {
  RECORD_POSITIONS,
  type RecordPosition,
  type PlayerRecordCategory,
  type PlayerSeasonRecord,
  type RankedPlayerSeason,
} from "./player-record-types";

import type {
  HistoricalGame,
} from "./lifetime-records";

export type CareerMilestone = {
  id: string;

  managerId: string;
  managerName: string;

  metric:
    | "career-wins"
    | "career-points"
    | "career-games"
    | "playoff-wins";

  current: number;
  target: number;
  remaining: number;

  status:
    | "approaching"
    | "achieved";

  headline: string;
};

export type ApproachingPlayerRecord = {
  playerId: string;
  playerName: string;

  managerId: string;
  managerName: string;

  season: number;

  position: RecordPosition;

  category: PlayerRecordCategory;

  type:
    | "first-place"
    | "top-25";

  currentPoints: number;
  targetPoints: number;

  pointsToTie: number;
  pointsToPass: number;

  headline: string;
};

function round(value: number) {
  return Math.round(
    value * 100
  ) / 100;
}

export function calculateCareerMilestones(
  previousGames:
    readonly HistoricalGame[],

  currentGames:
    readonly HistoricalGame[],

  historicalCoverageVerified: boolean
) {
  const milestones: CareerMilestone[] = [];

  if (!historicalCoverageVerified) {
    return {
      verified: false,

      issues: [
        "Historical coverage is unverified.",
      ],

      milestones,

      readyForPublication: false,
    };
  }

  const previous =
    calculateLifetimeRecords(
      previousGames
    );

  const current =
    calculateLifetimeRecords(
      currentGames
    );

  const previousManagers =
    new Map(
      previous.managers.map(
        manager => [
          manager.managerId,
          manager,
        ]
      )
    );

  for (const manager of current.managers) {
    if (manager.career.games === 0) {
      continue;
    }

    const old =
      previousManagers.get(
        manager.managerId
      );

    function evaluate(
      metric: CareerMilestone["metric"],

      label: string,

      value: number,

      oldValue: number,

      interval: number,

      approachDistance: number
    ) {
      const latestAchieved =
        Math.floor(value / interval) *
        interval;

      if (
        latestAchieved > 0 &&
        oldValue < latestAchieved &&
        value >= latestAchieved
      ) {
        milestones.push({
          id:
            `${manager.managerId}:` +
            `${metric}:${latestAchieved}:achieved`,

          managerId: manager.managerId,
          managerName: manager.name,

          metric,

          current: value,
          target: latestAchieved,
          remaining: 0,

          status: "achieved",

          headline:
            `MILESTONE: ${manager.name} ` +
            `reaches ${latestAchieved.toLocaleString("en-US")} ` +
            `${label}.`,
        });
      }

      const nextTarget =
        (
          Math.floor(value / interval) + 1
        ) * interval;

      const remaining =
        round(nextTarget - value);

      if (
        remaining > 0 &&
        remaining <= approachDistance
      ) {
        milestones.push({
          id:
            `${manager.managerId}:` +
            `${metric}:${nextTarget}:approaching`,

          managerId: manager.managerId,
          managerName: manager.name,

          metric,

          current: value,
          target: nextTarget,
          remaining,

          status: "approaching",

          headline:
            `${manager.name} is ` +
            `${remaining.toLocaleString("en-US")} away ` +
            `from ${nextTarget.toLocaleString("en-US")} ` +
            `${label}.`,
        });
      }
    }

    evaluate(
      "career-wins",
      "career wins",
      manager.career.wins,
      old?.career.wins ?? 0,
      25,
      3
    );

    evaluate(
      "career-points",
      "career fantasy points",
      manager.career.pointsFor,
      old?.career.pointsFor ?? 0,
      1000,
      200
    );

    evaluate(
      "career-games",
      "career games",
      manager.career.games,
      old?.career.games ?? 0,
      25,
      3
    );

    evaluate(
      "playoff-wins",
      "championship-playoff wins",
      manager.playoffs.wins,
      old?.playoffs.wins ?? 0,
      5,
      1
    );
  }

  milestones.sort(
    (a, b) =>
      Number(b.status === "achieved") -
      Number(a.status === "achieved") ||
      a.remaining - b.remaining ||
      a.id.localeCompare(b.id)
  );

  return {
    verified: true,

    issues: [] as string[],

    milestones,

    readyForPublication: false,

    yahooRequests: 0,
    aiRequests: 0,
    databaseWrites: 0,
  };
}

export type PlayerMilestoneInput = {
  season: number;

  category: PlayerRecordCategory;

  currentPlayers:
    readonly PlayerSeasonRecord[];

  historicalRankings:
    Record<
      RecordPosition,
      readonly RankedPlayerSeason[]
    >;

  eligibleManagerIds:
    readonly string[];

  historicalCoverageVerified: boolean;

  maximumPointsAway?: number;
};

export function calculateApproachingPlayerRecords(
  input: PlayerMilestoneInput
) {
  const alerts:
    ApproachingPlayerRecord[] = [];

  const maximumPointsAway =
    input.maximumPointsAway ?? 30;

  if (
    !input.historicalCoverageVerified ||
    !Number.isInteger(input.season) ||
    input.season < 2020 ||
    !Number.isFinite(maximumPointsAway) ||
    maximumPointsAway <= 0
  ) {
    return {
      verified: false,

      issues: [
        "Invalid or unverified player milestone evidence.",
      ],

      alerts,

      readyForPublication: false,
    };
  }

  const eligible =
    new Set(input.eligibleManagerIds);

  const seen =
    new Set<string>();

  for (const player of input.currentPlayers) {
    if (
      player.season !== input.season ||
      player.seasonComplete ||
      !eligible.has(player.managerId) ||
      !RECORD_POSITIONS.includes(
        player.position
      ) ||
      !Number.isFinite(player.points)
    ) {
      continue;
    }

    const key = JSON.stringify([
      player.playerId,
      player.managerId,
      player.season,
    ]);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    const rankings =
      input.historicalRankings[
        player.position
      ].filter(
        record =>
          record.season < input.season &&
          record.seasonComplete &&
          Number.isFinite(record.points)
      ).sort(
        (a, b) => b.points - a.points
      );

    if (rankings.length === 0) {
      continue;
    }

    function evaluate(
      type:
        ApproachingPlayerRecord["type"],

      targetPoints: number
    ) {
      const pointsToTie =
        round(
          targetPoints -
          player.points
        );

      const pointsToPass =
        round(pointsToTie + 0.01);

      if (
        pointsToTie < 0 ||
        pointsToPass > maximumPointsAway
      ) {
        return;
      }

      const label =
        type === "first-place"
          ? "historical scoring record"
          : "historical Top 25";

      alerts.push({
        playerId: player.playerId,
        playerName: player.playerName,

        managerId: player.managerId,
        managerName: player.managerName,

        season: player.season,

        position: player.position,

        category: input.category,

        type,

        currentPoints: player.points,
        targetPoints,

        pointsToTie,
        pointsToPass,

        headline:
          `${player.playerName} needs ` +
          `${pointsToPass.toFixed(2)} points ` +
          `to surpass the ${player.position} ` +
          `${label} threshold ` +
          `for ${player.managerName}.`,
      });
    }

    evaluate(
      "first-place",
      rankings[0].points
    );

    if (rankings.length >= 25) {
      evaluate(
        "top-25",
        rankings[24].points
      );
    }
  }

  alerts.sort(
    (a, b) =>
      Number(b.type === "first-place") -
      Number(a.type === "first-place") ||
      a.pointsToPass - b.pointsToPass
  );

  return {
    verified: true,

    issues: [] as string[],

    alerts,

    readyForPublication: false,

    yahooRequests: 0,
    aiRequests: 0,
    databaseWrites: 0,
  };
}
