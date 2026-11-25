import {
  detectSeasonStorylines,
  type SeasonStorylineInput,
} from "./season-storylines";

import {
  getDocumentaryManagerName,
  getMatchupRelationship,
} from "./documentary-league-lore";

import type {
  HistoricalGame,
} from "./lifetime-records";

export type HistoricalStoryType =
  | "first-championship"
  | "repeat-champion"
  | "return-to-glory"
  | "championship-rematch"
  | "championship-revenge"
  | "defending-champion-eliminated"
  | "historical-rivalry"
  | "rivalry-reversal"
  | "family-showdown";

export type HistoricalStory = {
  id: string;
  type: HistoricalStoryType;
  headline: string;
  evidence: string;
  managerIds: string[];
  seasons: number[];
  weeks: number[];
  importance: number;
};

type FinalResult = {
  season: number;
  championId: string;
  runnerUpId: string;
  game: HistoricalGame;
};

export type DocumentaryHistoryInput = {
  fictional: true;
  current: SeasonStorylineInput;
  previousSeasons:
    readonly SeasonStorylineInput[];
  approvedLoreIds?: readonly string[];
};

function matchupBetween(
  game: HistoricalGame,
  first: string,
  second: string
) {
  return (
    (
      game.a.managerId === first &&
      game.b.managerId === second
    ) ||
    (
      game.a.managerId === second &&
      game.b.managerId === first
    )
  );
}

function getFinal(
  season: SeasonStorylineInput
): FinalResult {
  const final = season.games.find(
    game =>
      game.season === season.season &&
      game.week ===
        season.regularSeasonEndWeek + 3 &&
      game.isPlayoffs
  );

  if (!final?.winnerManagerId) {
    throw new Error(
      `Missing championship for ${season.season}.`
    );
  }

  return {
    season: season.season,
    championId: final.winnerManagerId,
    runnerUpId:
      final.a.managerId ===
        final.winnerManagerId
        ? final.b.managerId
        : final.a.managerId,
    game: final,
  };
}

function seriesRecord(
  games: readonly HistoricalGame[],
  first: string,
  second: string
) {
  const matchups = games.filter(
    game =>
      matchupBetween(
        game,
        first,
        second
      )
  );

  return {
    games: matchups.length,

    firstWins: matchups.filter(
      game =>
        game.winnerManagerId === first
    ).length,

    secondWins: matchups.filter(
      game =>
        game.winnerManagerId === second
    ).length,

    ties: matchups.filter(
      game =>
        game.winnerManagerId === null
    ).length,

    matchups,
  };
}

export function buildDocumentaryHistory(
  input: DocumentaryHistoryInput
) {
  const stories: HistoricalStory[] = [];

  function failure(issues: string[]) {
    return {
      verified: false as const,
      issues,
      stories: [],
      historicalCoverageComplete: false,
      fictional: true,
      readyForPublication: false,
    };
  }

  if (
    input.fictional !== true ||
    input.current.fictional !== true
  ) {
    return failure([
      "Only fictional demonstrations are enabled.",
    ]);
  }

  const currentAnalysis =
    detectSeasonStorylines(
      input.current
    );

  if (!currentAnalysis.verified) {
    return failure(
      currentAnalysis.issues
    );
  }

  const currentYear =
    input.current.season;

  const previous = [
    ...input.previousSeasons,
  ].sort(
    (a, b) => a.season - b.season
  );

  const expectedYears =
    Array.from(
      {
        length: currentYear - 2020,
      },
      (_, index) => 2020 + index
    );

  if (
    previous.length !==
      expectedYears.length ||
    previous.some(
      (season, index) =>
        season.season !==
          expectedYears[index]
    )
  ) {
    return failure([
      "Complete preceding-season coverage from 2020 is required.",
    ]);
  }

  for (const season of previous) {
    if (season.fictional !== true) {
      return failure([
        "Historical demonstration inputs must be fictional.",
      ]);
    }

    const analysis =
      detectSeasonStorylines(season);

    if (!analysis.verified) {
      return failure(
        analysis.issues.map(
          issue =>
            `${season.season}: ${issue}`
        )
      );
    }
  }

  try {
    const final =
      getFinal(input.current);

    const historicalFinals =
      previous.map(getFinal);

    const previousFinal =
      historicalFinals.at(-1);

    const champion =
      getDocumentaryManagerName(
        final.championId
      );

    const runnerUp =
      getDocumentaryManagerName(
        final.runnerUpId
      );

    const earlierTitles =
      historicalFinals.filter(
        result =>
          result.championId ===
            final.championId
      );

    const latestTitle =
      earlierTitles.at(-1);

    if (earlierTitles.length === 0) {
      stories.push({
        id: "first-championship",
        type: "first-championship",
        headline: "The First Banner",
        evidence:
          `${champion} won their first ` +
          `league championship in ${currentYear}.`,
        managerIds: [
          final.championId,
        ],
        seasons: [currentYear],
        weeks: [final.game.week],
        importance: 94,
      });
    }

    if (
      previousFinal?.championId ===
        final.championId
    ) {
      let consecutiveTitles = 1;

      for (
        let index =
          historicalFinals.length - 1;
        index >= 0;
        index--
      ) {
        if (
          historicalFinals[index]
            .championId !==
              final.championId
        ) {
          break;
        }

        consecutiveTitles++;
      }

      stories.push({
        id: "repeat-champion",
        type: "repeat-champion",
        headline:
          consecutiveTitles === 2
            ? "Back to Back"
            : "The Dynasty",
        evidence:
          `${champion} won ` +
          `${consecutiveTitles} consecutive ` +
          `league championships.`,
        managerIds: [
          final.championId,
        ],
        seasons: Array.from(
          {
            length: consecutiveTitles,
          },
          (_, index) =>
            currentYear -
            consecutiveTitles +
            1 +
            index
        ),
        weeks: [final.game.week],
        importance: 99,
      });
    }

    if (
      latestTitle &&
      currentYear -
        latestTitle.season >= 3
    ) {
      stories.push({
        id: "return-to-glory",
        type: "return-to-glory",
        headline: "Return to Glory",
        evidence:
          `${champion} won their first ` +
          `championship since ` +
          `${latestTitle.season}, ending ` +
          `${currentYear -
            latestTitle.season - 1} ` +
          `consecutive seasons without a title.`,
        managerIds: [
          final.championId,
        ],
        seasons: [
          latestTitle.season,
          currentYear,
        ],
        weeks: [final.game.week],
        importance: 98,
      });
    }

    const earlierRematches =
      historicalFinals.filter(
        result =>
          matchupBetween(
            result.game,
            final.championId,
            final.runnerUpId
          )
      );

    const lastRematch =
      earlierRematches.at(-1);

    if (lastRematch) {
      const revenge =
        lastRematch.championId !==
          final.championId;

      stories.push({
        id: "championship-rematch",
        type: revenge
          ? "championship-revenge"
          : "championship-rematch",
        headline: revenge
          ? "Unfinished Business"
          : "History Repeats",
        evidence:
          `${champion} and ${runnerUp} ` +
          `met in the championship again. ` +
          `Their previous final was in ` +
          `${lastRematch.season}, won by ` +
          `${getDocumentaryManagerName(
            lastRematch.championId
          )}. ` +
          `${champion} won the ${currentYear} final.`,
        managerIds: [
          final.championId,
          final.runnerUpId,
        ],
        seasons: [
          lastRematch.season,
          currentYear,
        ],
        weeks: [final.game.week],
        importance: revenge ? 99 : 95,
      });
    }

    const currentGames =
      input.current.games.filter(
        game =>
          game.season === currentYear
      );

    const historicalGames =
      previous.flatMap(
        season =>
          season.games.filter(
            game =>
              game.season ===
                season.season
          )
      );

    if (
      previousFinal &&
      previousFinal.championId !==
        final.championId
    ) {
      const defendingChampion =
        previousFinal.championId;

      const elimination =
        currentGames.find(
          game =>
            game.isPlayoffs &&
            (
              game.a.managerId ===
                defendingChampion ||
              game.b.managerId ===
                defendingChampion
            ) &&
            game.winnerManagerId !==
              defendingChampion
        );

      if (elimination) {
        const eliminator =
          elimination.winnerManagerId!;

        stories.push({
          id: "defending-champion-eliminated",
          type:
            "defending-champion-eliminated",
          headline: "The Crown Falls",
          evidence:
            `${getDocumentaryManagerName(
              eliminator
            )} eliminated defending champion ` +
            `${getDocumentaryManagerName(
              defendingChampion
            )} in Week ${elimination.week}.`,
          managerIds: [
            defendingChampion,
            eliminator,
          ],
          seasons: [
            previousFinal.season,
            currentYear,
          ],
          weeks: [elimination.week],
          importance: 90,
        });
      }
    }

    const managers =
      input.current.managerIds;

    const approvedLore = new Set(
      input.approvedLoreIds ?? []
    );

    for (
      let firstIndex = 0;
      firstIndex < managers.length;
      firstIndex++
    ) {
      for (
        let secondIndex =
          firstIndex + 1;
        secondIndex < managers.length;
        secondIndex++
      ) {
        const first =
          managers[firstIndex];

        const second =
          managers[secondIndex];

        const earlier =
          seriesRecord(
            historicalGames,
            first,
            second
          );

        const current =
          seriesRecord(
            currentGames,
            first,
            second
          );

        if (current.games === 0) {
          continue;
        }

        const firstName =
          getDocumentaryManagerName(
            first
          );

        const secondName =
          getDocumentaryManagerName(
            second
          );

        const playoffMeeting =
          current.matchups.find(
            game => game.isPlayoffs
          );

        const relationship =
          getMatchupRelationship(
            first,
            second
          );

        if (
          relationship &&
          approvedLore.has(
            relationship.id
          ) &&
          playoffMeeting
        ) {
          stories.push({
            id:
              `relationship:${first}:${second}`,
            type: "family-showdown",
            headline: "Personal Business",
            evidence:
              `${relationship.context} ` +
              `They met in the championship ` +
              `bracket in Week ` +
              `${playoffMeeting.week}. ` +
              `${getDocumentaryManagerName(
                playoffMeeting.winnerManagerId!
              )} won the matchup.`,
            managerIds: [
              first,
              second,
            ],
            seasons: [currentYear],
            weeks: [
              playoffMeeting.week,
            ],
            importance:
              playoffMeeting.week ===
                final.game.week
                ? 98
                : 89,
          });
        }

        if (earlier.games < 4) {
          continue;
        }

        const previousDifference =
          earlier.firstWins -
          earlier.secondWins;

        const currentDifference =
          current.firstWins -
          current.secondWins;

        const reversal =
          Math.abs(
            previousDifference
          ) >= 2 &&
          previousDifference *
            currentDifference < 0;

        if (reversal) {
          stories.push({
            id:
              `reversal:${first}:${second}`,
            type: "rivalry-reversal",
            headline:
              "The Tables Have Turned",
            evidence:
              `Entering ${currentYear}, ` +
              `${firstName} and ${secondName} ` +
              `had a head-to-head record of ` +
              `${earlier.firstWins}-` +
              `${earlier.secondWins}-` +
              `${earlier.ties}, listed in ` +
              `that order. Their current-season ` +
              `series was ` +
              `${current.firstWins}-` +
              `${current.secondWins}-` +
              `${current.ties}, reversing ` +
              `the historical advantage.`,
            managerIds: [
              first,
              second,
            ],
            seasons: [
              ...new Set([
                ...earlier.matchups.map(
                  game => game.season
                ),
                currentYear,
              ]),
            ],
            weeks:
              current.matchups.map(
                game => game.week
              ),
            importance:
              playoffMeeting ? 94 : 83,
          });
        }

        if (
          earlier.games >= 6 &&
          Math.abs(
            previousDifference
          ) <= 2 &&
          playoffMeeting
        ) {
          stories.push({
            id:
              `rivalry:${first}:${second}`,
            type: "historical-rivalry",
            headline: "Another Chapter",
            evidence:
              `${firstName} and ${secondName} ` +
              `entered the season with ` +
              `${earlier.games} previous ` +
              `official meetings and a ` +
              `${earlier.firstWins}-` +
              `${earlier.secondWins}-` +
              `${earlier.ties} series record. ` +
              `They met again in the ` +
              `championship bracket.`,
            managerIds: [
              first,
              second,
            ],
            seasons: [
              ...new Set([
                ...earlier.matchups.map(
                  game => game.season
                ),
                currentYear,
              ]),
            ],
            weeks: [
              playoffMeeting.week,
            ],
            importance: 88,
          });
        }
      }
    }

    return {
      verified: true as const,
      issues: [],
      stories: stories.sort(
        (a, b) =>
          b.importance - a.importance ||
          a.id.localeCompare(b.id)
      ),
      historicalCoverageComplete: true,
      seasonsAnalyzed:
        previous.length + 1,
      fictional: true,
      readyForPublication: false,
    };
  } catch (error) {
    return failure([
      error instanceof Error
        ? error.message
        : "Historical analysis failed.",
    ]);
  }
}