
import {
  ACTIVE_MANAGERS,
  LEAGUE_START_YEAR,
  findManagerById,
} from "./league-managers";

import {
  type ChampionshipEntry,
} from "./team-name-history";

export type FinalStanding = {
  managerId: string;
  teamName: string;
  rank: number;
};

export type CompletedSeason = {
  season: number;
  finished: boolean;
  standingsVerified: boolean;
  standings: readonly FinalStanding[];
};

export type VerifiedChampionship =
  ChampionshipEntry & {
    managerName: string;
    activeManager: boolean;
  };

export function extractChampionships(
  seasons: readonly CompletedSeason[]
): VerifiedChampionship[] {
  const championships =
    new Map<number, VerifiedChampionship>();

  const seenSeasons = new Set<number>();

  for (const season of seasons) {
    if (
      !Number.isInteger(season.season) ||
      season.season < LEAGUE_START_YEAR
    ) {
      throw new Error(
        "Invalid championship season."
      );
    }

    if (seenSeasons.has(season.season)) {
      throw new Error(
        "Duplicate season supplied."
      );
    }

    seenSeasons.add(season.season);

    // Never award a championship
    // before a season is officially final.

    if (
      !season.finished ||
      !season.standingsVerified
    ) {
      continue;
    }

    const managers = new Set<string>();
    const ranks = new Set<number>();

    for (const team of season.standings) {
      if (
        !team.managerId.trim() ||
        !team.teamName.trim() ||
        !Number.isInteger(team.rank) ||
        team.rank < 1 ||
        team.rank > season.standings.length
      ) {
        throw new Error(
          "Invalid final standings."
        );
      }

      if (
        managers.has(team.managerId) ||
        ranks.has(team.rank)
      ) {
        throw new Error(
          "Duplicate manager or final rank."
        );
      }

      managers.add(team.managerId);
      ranks.add(team.rank);
    }

    const winners =
      season.standings.filter(
        team => team.rank === 1
      );

    if (winners.length !== 1) {
      throw new Error(
        "Season requires exactly one " +
        "verified champion."
      );
    }

    const winner = winners[0];

    const manager = findManagerById(
      winner.managerId
    );

    championships.set(season.season, {
      season: season.season,
      managerId: winner.managerId,
      teamName: winner.teamName.trim(),

      managerName:
        manager?.name ??
        "Historical manager",

      activeManager: manager !== null,
    });
  }

  return [...championships.values()]
    .sort(
      (a, b) => a.season - b.season
    );
}

export function calculateChampionshipHistory(
  seasons: readonly CompletedSeason[]
) {
  const championships =
    extractChampionships(seasons);

  const managerChampionships =
    ACTIVE_MANAGERS.map(manager => {
      const titles =
        championships.filter(
          champion =>
            champion.managerId ===
            manager.id
        );

      const runnerUpSeasons = seasons
        .filter(
          season =>
            season.finished &&
            season.standingsVerified &&
            season.standings.some(
              team =>
                team.managerId ===
                  manager.id &&
                team.rank === 2
            )
        )
        .map(season => season.season)
        .sort((a, b) => b - a);

      const championshipSeasons =
        titles
          .map(title => title.season)
          .sort((a, b) => b - a);

      let longestTitleStreak = 0;
      let currentStreak = 0;
      let previousYear: number | null =
        null;

      for (const year of [
        ...championshipSeasons,
      ].reverse()) {
        currentStreak =
          previousYear !== null &&
          year === previousYear + 1
            ? currentStreak + 1
            : 1;

        longestTitleStreak = Math.max(
          longestTitleStreak,
          currentStreak
        );

        previousYear = year;
      }

      return {
        managerId: manager.id,
        managerName: manager.name,

        championships: titles.length,

        championshipSeasons,

        runnerUpFinishes:
          runnerUpSeasons.length,

        runnerUpSeasons,

        championshipAppearances:
          titles.length +
          runnerUpSeasons.length,

        championshipWinPercentage:
          titles.length +
            runnerUpSeasons.length >
          0
            ? Math.round(
                (
                  titles.length /
                  (
                    titles.length +
                    runnerUpSeasons.length
                  )
                ) * 10000
              ) / 100
            : null,

        longestTitleStreak,

        firstChampionship:
          championshipSeasons.at(-1) ??
          null,

        latestChampionship:
          championshipSeasons[0] ??
          null,

        winningTeamNames: [
          ...new Set(
            titles.map(
              title => title.teamName
            )
          ),
        ],
      };
    }).sort(
      (a, b) =>
        b.championships -
          a.championships ||
        b.runnerUpFinishes -
          a.runnerUpFinishes ||
        a.managerName.localeCompare(
          b.managerName
        )
    );

  const rafters = championships.map(
    champion => ({
      year: champion.season,

      teamName: champion.teamName,

      managerName:
        champion.managerName,

      managerId:
        champion.managerId,

      activeManager:
        champion.activeManager,

      theme:
        champion.season % 2 === 0
          ? "dark"
          : "light",
    })
  );

  const teamNameChampionships:
    ChampionshipEntry[] =
    championships
      .filter(
        champion =>
          champion.activeManager
      )
      .map(champion => ({
        managerId:
          champion.managerId,

        teamName:
          champion.teamName,

        season:
          champion.season,
      }));

  const mostTitles =
    managerChampionships[0]
      ?.championships ?? 0;

  return {
    totalChampionships:
      championships.length,

    championships,

    managerChampionships,

    rafters,

    teamNameChampionships,

    records: {
      mostChampionships: mostTitles,

      championshipLeaders:
        mostTitles > 0
          ? managerChampionships.filter(
              manager =>
                manager.championships ===
                mostTitles
            )
          : [],

      longestChampionshipStreak:
        Math.max(
          0,
          ...managerChampionships.map(
            manager =>
              manager.longestTitleStreak
          )
        ),

      latestChampion:
        championships.at(-1) ?? null,
    },

    note:
      "Championship statistics reflect " +
      "verified completed seasons supplied " +
      "to this engine.",
  };
}
