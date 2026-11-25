import type {
  PlayerWeekPerformance,
} from "./player-record-types";

import type {
  DocumentaryEvidence,
} from "./documentary-production-brief";

import type {
  SeasonStorylineInput,
} from "./season-storylines";

export type DocumentaryPlayerInput = {
  fictional: true;
  season: SeasonStorylineInput;
  performances:
    readonly PlayerWeekPerformance[];
  lineupCoverageVerified: boolean;
};

export type PlayerContribution = {
  playerId: string;
  playerName: string;
  managerId: string;
  position: string;
  points: number;
  starts: number;
  playoffPoints: number;
  playoffStarts: number;
  championshipPoints: number;
  highestScore: number;
  highestWeek: number;
  weeks: number[];
};

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function score(value: number) {
  return value.toFixed(2);
}

export function analyzeDocumentaryPlayers(
  input: DocumentaryPlayerInput
) {
  const evidence: DocumentaryEvidence[] = [];

  function failure(issues: string[]) {
    return {
      verified: false as const,
      issues,
      evidence: [],
      contributions: [],
      officialPerformances: [],
    };
  }

  if (
    input.fictional !== true ||
    input.season.fictional !== true
  ) {
    return failure([
      "Only fictional demonstrations are enabled.",
    ]);
  }

  if (!input.lineupCoverageVerified) {
    return failure([
      "Complete lineup coverage is required.",
    ]);
  }

  const season = input.season.season;

  const championshipWeek =
    input.season.regularSeasonEndWeek + 3;

  const games = input.season.games.filter(
    game => game.season === season
  );

  const championship = games.find(
    game =>
      game.week === championshipWeek &&
      game.isPlayoffs
  );

  if (!championship?.winnerManagerId) {
    return failure([
      "Championship result is missing.",
    ]);
  }

  const championId =
    championship.winnerManagerId;

  const officialPerformances =
    input.performances.filter(
      row =>
        row.season === season &&
        row.started &&
        !row.isConsolation
    );

  const issues: string[] = [];

  const expectedLineups = new Map<
    string,
    {
      points: number;
      teamName: string;
      isPlayoffs: boolean;
    }
  >();

  for (const game of games) {
    for (const team of [game.a, game.b]) {
      const key = JSON.stringify([
        game.week,
        team.managerId,
      ]);

      if (expectedLineups.has(key)) {
        issues.push(
          `Duplicate official lineup: ${key}`
        );
      }

      expectedLineups.set(key, {
        points: team.points,
        teamName: team.teamName,
        isPlayoffs: game.isPlayoffs,
      });
    }
  }

  const seen = new Set<string>();

  const lineupTotals =
    new Map<string, number>();

  const players =
    new Map<string, PlayerContribution>();

  for (const row of officialPerformances) {
    const lineupKey = JSON.stringify([
      row.week,
      row.managerId,
    ]);

    const expected =
      expectedLineups.get(lineupKey);

    const playerWeekKey = JSON.stringify([
      row.week,
      row.playerId,
    ]);

    const slot =
      row.lineupSlot.trim().toUpperCase();

    if (
      !expected ||
      !row.scoringFinal ||
      !row.playerId.trim() ||
      !row.playerName.trim() ||
      !Number.isFinite(row.points) ||
      row.isPlayoffs !==
        expected.isPlayoffs ||
      row.fantasyTeamName !==
        expected.teamName ||
      !slot ||
      [
        "BN",
        "BENCH",
        "IR",
        "IR+",
        "NA",
      ].includes(slot) ||
      seen.has(playerWeekKey)
    ) {
      issues.push(
        `Invalid player performance: ${row.playerName}, Week ${row.week}.`
      );

      continue;
    }

    seen.add(playerWeekKey);

    lineupTotals.set(
      lineupKey,
      (lineupTotals.get(lineupKey) ?? 0) +
        row.points
    );

    const key = JSON.stringify([
      row.managerId,
      row.playerId,
    ]);

    const previous = players.get(key);

    if (
      previous &&
      previous.position !== row.position
    ) {
      issues.push(
        `Conflicting player position: ${row.playerName}.`
      );

      continue;
    }

    const contribution: PlayerContribution =
      previous ?? {
        playerId: row.playerId,
        playerName: row.playerName,
        managerId: row.managerId,
        position: row.position,
        points: 0,
        starts: 0,
        playoffPoints: 0,
        playoffStarts: 0,
        championshipPoints: 0,
        highestScore: row.points,
        highestWeek: row.week,
        weeks: [],
      };

    contribution.points += row.points;
    contribution.starts++;
    contribution.weeks.push(row.week);

    if (row.isPlayoffs) {
      contribution.playoffPoints +=
        row.points;

      contribution.playoffStarts++;
    }

    if (row.week === championshipWeek) {
      contribution.championshipPoints +=
        row.points;
    }

    if (
      row.points > contribution.highestScore ||
      (
        row.points === contribution.highestScore &&
        row.week < contribution.highestWeek
      )
    ) {
      contribution.highestScore =
        row.points;

      contribution.highestWeek =
        row.week;
    }

    players.set(key, contribution);
  }

  for (const [key, expected] of expectedLineups) {
    const actual = lineupTotals.get(key);

    if (
      actual === undefined ||
      Math.abs(
        round(actual) - expected.points
      ) > 0.020001
    ) {
      issues.push(
        `Lineup scoring mismatch: ${key}`
      );
    }
  }

  if (issues.length > 0) {
    return failure(issues);
  }

  const contributions = [
    ...players.values(),
  ].map(player => ({
    ...player,
    points: round(player.points),
    playoffPoints:
      round(player.playoffPoints),
    championshipPoints:
      round(player.championshipPoints),
    weeks: [...player.weeks].sort(
      (a, b) => a - b
    ),
  }));

  function add(
    player: PlayerContribution,
    type: string,
    headline: string,
    fact: string,
    weeks: number[],
    importance: number
  ) {
    evidence.push({
      id: JSON.stringify([
        "player",
        type,
        player.managerId,
        player.playerId,
      ]),
      type,
      headline,
      fact,
      managerIds: [player.managerId],
      seasons: [season],
      weeks,
      importance,
    });
  }

  const highestTotal = Math.max(
    ...contributions.map(
      player => player.points
    )
  );

  for (const player of contributions.filter(
    item => item.points === highestTotal
  )) {
    add(
      player,
      "player-scoring-leader",
      "The Engine",
      `${player.playerName} contributed ` +
        `${score(player.points)} starting-lineup ` +
        `points to manager ${player.managerId} ` +
        `across ${player.starts} official starts. ` +
        `This was a league-leading total for ` +
        `a single player-manager combination.`,
      player.weeks,
      91
    );
  }

  const championPlayers =
    contributions.filter(
      player =>
        player.managerId === championId
    );

  const highestChampionTotal = Math.max(
    ...championPlayers.map(
      player => player.points
    )
  );

  for (const player of championPlayers.filter(
    item =>
      item.points === highestChampionTotal
  )) {
    add(
      player,
      "champion-leading-contributor",
      "Built for Glory",
      `${player.playerName} led the champion's ` +
        `starting-lineup player contributions ` +
        `with ${score(player.points)} points ` +
        `across ${player.starts} official starts.`,
      player.weeks,
      94
    );
  }

  const finalPlayers =
    championPlayers.filter(
      player =>
        player.weeks.includes(
          championshipWeek
        )
    );

  const highestFinalScore = Math.max(
    ...finalPlayers.map(
      player => player.championshipPoints
    )
  );

  for (const player of finalPlayers.filter(
    item =>
      item.championshipPoints ===
        highestFinalScore
  )) {
    add(
      player,
      "championship-hero",
      "Championship Hero",
      `${player.playerName} scored ` +
        `${score(player.championshipPoints)} ` +
        `points for the champion in the final, ` +
        `the highest individual contribution ` +
        `on the winning starting lineup.`,
      [championshipWeek],
      96
    );
  }

  const playoffPlayers =
    championPlayers.filter(
      player => player.playoffStarts > 0
    );

  const highestPlayoffTotal = Math.max(
    ...playoffPlayers.map(
      player => player.playoffPoints
    )
  );

  for (const player of playoffPlayers.filter(
    item =>
      item.playoffPoints ===
        highestPlayoffTotal
  )) {
    add(
      player,
      "playoff-contributor",
      "Built for the Playoffs",
      `${player.playerName} contributed ` +
        `${score(player.playoffPoints)} points ` +
        `in ${player.playoffStarts} ` +
        `championship-bracket starts for the ` +
        `eventual champion.`,
      player.weeks.filter(
        week =>
          week >
            input.season.regularSeasonEndWeek
      ),
      93
    );
  }

  const highestWeeklyScore = Math.max(
    ...contributions.map(
      player => player.highestScore
    )
  );

  for (const player of contributions.filter(
    item =>
      item.highestScore === highestWeeklyScore
  )) {
    add(
      player,
      "individual-scoring-explosion",
      "One-Man Wrecking Crew",
      `${player.playerName} scored ` +
        `${score(player.highestScore)} points ` +
        `in Week ${player.highestWeek}, ` +
        `a season-leading individual ` +
        `starting-lineup performance.`,
      [player.highestWeek],
      87
    );
  }

  return {
    verified: true as const,
    issues: [],
    evidence,
    contributions,
    officialPerformances,
    fictional: true,
    readyForPublication: false,
  };
}