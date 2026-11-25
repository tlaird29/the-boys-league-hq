
import {
  isActiveManager,
  LEAGUE_START_YEAR,
} from "./league-managers";

import {
  RECORD_POSITIONS,
  type PlayerWeekPerformance,
} from "./player-record-types";

import type {
  HistoricalGame,
} from "./lifetime-records";

type ExpectedLineup = {
  season: number;
  week: number;
  managerId: string;
  fantasyTeamName: string;
  points: number;
  isPlayoffs: boolean;
};

function lineupKey(
  season: number,
  week: number,
  managerId: string
) {
  return JSON.stringify([
    season,
    week,
    managerId,
  ]);
}

export function reconcilePlayerScoring(
  games: readonly HistoricalGame[],

  performances:
    readonly PlayerWeekPerformance[],

  tolerance = 0.02
) {
  if (
    !Number.isFinite(tolerance) ||
    tolerance < 0 ||
    tolerance > 0.02
  ) {
    throw new Error(
      "Invalid player scoring tolerance."
    );
  }

  const issues: string[] = [];

  const expected =
    new Map<string, ExpectedLineup>();

  const lineups =
    new Map<
      string,
      PlayerWeekPerformance[]
    >();

  const seenPlayers =
    new Set<string>();

  const seenOfficialLineups =
    new Set<string>();

  let excludedBench = 0;
  let excludedConsolation = 0;
  let excludedFormerManagers = 0;

  if (games.length === 0) {
    issues.push(
      "No official matchup history supplied."
    );
  }

  for (const game of games) {
    if (
      !Number.isInteger(game.season) ||
      game.season < LEAGUE_START_YEAR ||
      !Number.isInteger(game.week) ||
      game.week < 1 ||
      game.week > 18 ||
      typeof game.isPlayoffs !== "boolean" ||
      game.a.managerId === game.b.managerId
    ) {
      issues.push(
        "Invalid official historical matchup."
      );

      continue;
    }

    for (const team of [game.a, game.b]) {
      const key = lineupKey(
        game.season,
        game.week,
        team.managerId
      );

      if (
        !team.managerId.trim() ||
        !team.teamName.trim() ||
        !Number.isFinite(team.points) ||
        seenOfficialLineups.has(key)
      ) {
        issues.push(
          "Invalid or duplicated official lineup."
        );

        continue;
      }

      seenOfficialLineups.add(key);

      if (!isActiveManager(team.managerId)) {
        continue;
      }

      expected.set(key, {
        season: game.season,
        week: game.week,

        managerId: team.managerId,

        fantasyTeamName: team.teamName,

        points: team.points,

        isPlayoffs: game.isPlayoffs,
      });
    }
  }

  if (expected.size === 0) {
    issues.push(
      "No eligible official lineups supplied."
    );
  }

  for (const player of performances) {
    if (player.isConsolation === true) {
      excludedConsolation++;
      continue;
    }

    if (player.started === false) {
      excludedBench++;
      continue;
    }

    if (!isActiveManager(player.managerId)) {
      excludedFormerManagers++;
      continue;
    }

    const key = lineupKey(
      player.season,
      player.week,
      player.managerId
    );

    const official = expected.get(key);

    if (!official) {
      issues.push(
        "Player belongs to an unexpected official lineup."
      );

      continue;
    }

    if (
      player.scoringFinal !== true ||
      player.started !== true ||
      player.isConsolation !== false ||
      player.isPlayoffs !== official.isPlayoffs ||
      player.fantasyTeamName.trim() !==
        official.fantasyTeamName.trim() ||
      !player.playerId.trim() ||
      !player.playerName.trim() ||
      !RECORD_POSITIONS.includes(
        player.position
      ) ||
      !Number.isFinite(player.points)
    ) {
      issues.push(
        "Invalid or unverified starting player."
      );

      continue;
    }

    const slot =
      player.lineupSlot
        .trim()
        .toUpperCase();

    if (
      !slot ||
      [
        "BN",
        "BENCH",
        "IR",
        "IR+",
        "NA",
      ].includes(slot)
    ) {
      issues.push(
        "Invalid starting lineup position."
      );

      continue;
    }

    const playerKey = JSON.stringify([
      player.season,
      player.week,
      player.playerId,
    ]);

    if (seenPlayers.has(playerKey)) {
      issues.push(
        "Duplicate player in official weekly lineups."
      );

      continue;
    }

    seenPlayers.add(playerKey);

    const lineup =
      lineups.get(key) ?? [];

    lineup.push(player);

    lineups.set(key, lineup);
  }

  const reports: {
    season: number;
    week: number;
    managerId: string;
    expectedPoints: number;
    calculatedPoints: number | null;
    difference: number | null;
    starters: number;
    verified: boolean;
  }[] = [];

  const verifiedPerformances:
    PlayerWeekPerformance[] = [];

  for (const [key, official] of expected) {
    const lineup =
      lineups.get(key) ?? [];

    if (lineup.length === 0) {
      issues.push(
        `Missing lineup: ${official.season}, ` +
        `week ${official.week}, ` +
        `${official.managerId}.`
      );

      reports.push({
        season: official.season,
        week: official.week,
        managerId: official.managerId,

        expectedPoints: official.points,

        calculatedPoints: null,
        difference: null,

        starters: 0,
        verified: false,
      });

      continue;
    }

    const calculatedPoints =
      lineup.reduce(
        (total, player) =>
          total + player.points,
        0
      );

    const difference =
      Math.abs(
        calculatedPoints -
        official.points
      );

    const verified =
      difference <= tolerance + 1e-9;

    if (!verified) {
      issues.push(
        `Scoring discrepancy: ${official.season}, ` +
        `week ${official.week}, ` +
        `${official.managerId}.`
      );
    } else {
      verifiedPerformances.push(
        ...lineup
      );
    }

    reports.push({
      season: official.season,
      week: official.week,
      managerId: official.managerId,

      expectedPoints: official.points,

      calculatedPoints:
        Math.round(
          calculatedPoints * 100
        ) / 100,

      difference:
        Math.round(
          difference * 10000
        ) / 10000,

      starters: lineup.length,

      verified,
    });
  }

  const lineupsVerified =
    reports.filter(
      report => report.verified
    ).length;

  const verified =
    issues.length === 0 &&
    expected.size > 0 &&
    lineupsVerified === expected.size;

  return {
    verified,

    issues,

    expectedLineups: expected.size,

    lineupsVerified,

    coveragePercentage:
      expected.size > 0
        ? Math.round(
            lineupsVerified /
            expected.size *
            10000
          ) / 100
        : 0,

    excludedBench,
    excludedConsolation,
    excludedFormerManagers,

    reports,

    verifiedPerformances:
      verified
        ? verifiedPerformances
        : [],

    readyForPublication: false,

    yahooRequests: 0,
    aiRequests: 0,
    databaseWrites: 0,
  };
}
