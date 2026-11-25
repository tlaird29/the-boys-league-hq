import {
  ACTIVE_MANAGERS,
  type ManagerId,
} from "./league-managers";

import type {
  HistoricalGame,
} from "./lifetime-records";

import type {
  SeasonStorylineInput,
} from "./season-storylines";

import type {
  CompleteDocumentaryInput,
} from "./documentary-complete-brief";

import type {
  DocumentaryScript,
} from "./documentary-script-types";

export type FictionalSeasonStyle =
  | "dominant"
  | "comeback";

export function createFictionalSeason(
  season = 2020,
  style: FictionalSeasonStyle = "dominant",
  championIndex = 0
): SeasonStorylineInput {
  const managerIds: ManagerId[] =
    ACTIVE_MANAGERS.map(
      manager => manager.id
    );

  const champion =
    managerIds[championIndex];

  if (!champion) {
    throw new Error(
      "Invalid fictional champion."
    );
  }

  const games: HistoricalGame[] = [];

  function addGame(
    week: number,
    first: ManagerId,
    second: ManagerId,
    winner: ManagerId,
    isPlayoffs = false
  ) {
    const winningPoints =
      130 + week;

    const losingPoints =
      90 + week;

    games.push({
      season,
      week,
      isPlayoffs,

      a: {
        managerId: first,
        teamName: `Demo ${first}`,
        points:
          winner === first
            ? winningPoints
            : losingPoints,
      },

      b: {
        managerId: second,
        teamName: `Demo ${second}`,
        points:
          winner === second
            ? winningPoints
            : losingPoints,
      },

      winnerManagerId: winner,
    });
  }

  let rotation: ManagerId[] = [
    ...managerIds,
  ];

  for (
    let week = 1;
    week <= 14;
    week++
  ) {
    for (
      let index = 0;
      index < rotation.length / 2;
      index++
    ) {
      const first =
        rotation[index];

      const second =
        rotation[
          rotation.length - 1 - index
        ];

      let winner: ManagerId =
        (week + index) % 2 === 0
          ? first
          : second;

      if (
        first === champion ||
        second === champion
      ) {
        const opponent =
          first === champion
            ? second
            : first;

        winner =
          style === "comeback" &&
          week >= 2 &&
          week <= 6
            ? opponent
            : champion;
      }

      addGame(
        week,
        first,
        second,
        winner
      );
    }

    rotation = [
      rotation[0],
      rotation[rotation.length - 1],
      ...rotation.slice(1, -1),
    ];
  }

  const standings = managerIds.map(
    managerId => {
      const appearances = games.filter(
        game =>
          game.a.managerId === managerId ||
          game.b.managerId === managerId
      );

      return {
        managerId,

        wins: appearances.filter(
          game =>
            game.winnerManagerId ===
              managerId
        ).length,

        points: appearances.reduce(
          (sum, game) =>
            sum +
            (
              game.a.managerId === managerId
                ? game.a.points
                : game.b.points
            ),
          0
        ),
      };
    }
  ).sort(
    (a, b) =>
      b.wins - a.wins ||
      b.points - a.points ||
      a.managerId.localeCompare(
        b.managerId
      )
  );

  const playoffTeams: ManagerId[] =
    standings
      .slice(0, 8)
      .map(row => row.managerId);

  if (!playoffTeams.includes(champion)) {
    throw new Error(
      "Fictional champion failed to qualify."
    );
  }

  let remaining: ManagerId[] = [
    champion,
    ...playoffTeams.filter(
      id => id !== champion
    ),
  ];

  for (
    let round = 1;
    round <= 3;
    round++
  ) {
    const winners: ManagerId[] = [];

    for (
      let index = 0;
      index < remaining.length;
      index += 2
    ) {
      const first =
        remaining[index];

      const second =
        remaining[index + 1];

      const winner = first;

      addGame(
        14 + round,
        first,
        second,
        winner,
        true
      );

      winners.push(winner);
    }

    remaining = winners;
  }

  return {
    fictional: true,
    season,
    startWeek: 1,
    regularSeasonEndWeek: 14,
    managerIds,
    games,
  };
}

export function createDocumentaryTestInput(
  style: FictionalSeasonStyle = "dominant"
): CompleteDocumentaryInput {
  return {
    fictional: true,

    current:
      createFictionalSeason(
        2020,
        style
      ),

    previousSeasons: [],

    approvedLoreIds: [],

    previousTitles: [],

    previousOpeningLines: [],

    previousPunchlines: [],
  };
}

export function createFictionalScript(
  season: number,
  centralStoryId: string,
  championshipId: string
): DocumentaryScript {
  const narrations = [
    "Every season begins with a clean scoreboard and a collection of ambitious predictions. This fictional campaign is a demonstration of how a documentary can follow one central storyline without relying on a fixed annual script or inventing events outside the available evidence. The opening establishes the direction of the story.",

    "The regular season provides the foundation for everything that follows. Weekly results establish the competitive landscape, while the standings reveal how each manager progresses through the schedule. These developments can be presented through changing graphics, measured scoring contributions and carefully selected evidence that supports the broader narrative of the documentary.",

    "As the schedule advances, the story moves toward the championship bracket. The presentation should emphasize meaningful developments rather than simply reading every score. Each transition connects the previous section to the next, creating a continuous narration that can be reviewed alongside its supporting evidence before any production work begins.",

    "The championship provides the conclusion to this fictional season. The final result must agree with the supplied matchup evidence, and the winning manager must be identified correctly. The visual presentation can celebrate the accomplishment without inventing player performances, conversations, injuries or other details that have not been established by the underlying records.",

    "This demonstration closes with the identity of the league and a reminder that every season deserves its own story. The finished production will eventually combine original narration, carefully timed graphics and an approved editorial direction. Until that process is verified, this remains a fictional test of the documentary framework. ICE TF UP!",
  ];

  return {
    season,

    title:
      "THE FICTIONAL TEST SEASON",

    subtitle:
      "A documentary validation demonstration",

    centralStoryId,

    scenes: narrations.map(
      (narration, index) => ({
        id: `scene-${index + 1}`,

        headline:
          `Test scene ${index + 1}`,

        narration,

        durationSeconds: 24,

        graphic:
          index === 4
            ? "closing-logo"
            : index === 3
              ? "championship-banner"
              : index === 0
                ? "cinematic-title"
                : "weekly-standings-progression",

        visualDirection:
          "Display fictional test graphics.",

        transition: "fade",

        evidenceIds: [
          index >= 3
            ? championshipId
            : centralStoryId,
        ],

        loreIds: [],
      })
    ),
  };
}