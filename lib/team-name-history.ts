
import {
  ACTIVE_MANAGERS,
  LEAGUE_START_YEAR,
  isActiveManager,
} from "./league-managers";

export type TeamNameObservation = {
  managerId: string;
  teamName: string;
  season: number;
  week?: number;
};

export type ChampionshipEntry = {
  managerId: string;
  teamName: string;
  season: number;
};

function cleanName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function nameKey(name: string): string {
  return cleanName(name)
    .normalize("NFC")
    .toLowerCase();
}

type NameRecord = {
  teamName: string;
  seasons: Set<number>;
  championships: Set<number>;
};

export function calculateTeamNameHistory(
  observations: readonly TeamNameObservation[],
  championships: readonly ChampionshipEntry[] = []
) {
  const history = new Map<
    string,
    Map<string, NameRecord>
  >();

  const seasonHistory = new Map<
    string,
    Map<number, Set<string>>
  >();

  for (const manager of ACTIVE_MANAGERS) {
    history.set(manager.id, new Map());
    seasonHistory.set(manager.id, new Map());
  }

  function addName(
    entry: TeamNameObservation,
    champion = false
  ) {
    if (!isActiveManager(entry.managerId)) {
      return;
    }

    if (
      !Number.isInteger(entry.season) ||
      entry.season < LEAGUE_START_YEAR ||
      !entry.teamName.trim()
    ) {
      throw new Error(
        "Invalid team name history entry."
      );
    }

    if (
      entry.week !== undefined &&
      (
        !Number.isInteger(entry.week) ||
        entry.week < 1 ||
        entry.week > 18
      )
    ) {
      throw new Error(
        "Invalid team name observation week."
      );
    }

    const teamName = cleanName(
      entry.teamName
    );

    const key = nameKey(teamName);

    const names = history.get(
      entry.managerId
    )!;

    const record = names.get(key) ?? {
      teamName,
      seasons: new Set<number>(),
      championships: new Set<number>(),
    };

    record.seasons.add(entry.season);

    if (champion) {
      record.championships.add(
        entry.season
      );
    }

    names.set(key, record);

    const seasons = seasonHistory.get(
      entry.managerId
    )!;

    const seasonNames =
      seasons.get(entry.season) ??
      new Set<string>();

    seasonNames.add(key);

    seasons.set(
      entry.season,
      seasonNames
    );
  }

  const ordered = [...observations].sort(
    (a, b) =>
      a.season - b.season ||
      (a.week ?? 0) - (b.week ?? 0)
  );

  for (const entry of ordered) {
    addName(entry);
  }

  const verifiedChampions = new Map<
    number,
    string
  >();

  for (const champion of championships) {
    const identity =
      `${champion.managerId}:` +
      nameKey(champion.teamName);

    const previous =
      verifiedChampions.get(
        champion.season
      );

    if (
      previous &&
      previous !== identity
    ) {
      throw new Error(
        "Conflicting championship records."
      );
    }

    verifiedChampions.set(
      champion.season,
      identity
    );

    addName(champion, true);
  }

  return ACTIVE_MANAGERS.map(manager => {
    const names = history.get(
      manager.id
    )!;

    const seasons = seasonHistory.get(
      manager.id
    )!;

    const uniqueNames = [...names.values()]
      .map(record => ({
        teamName: record.teamName,

        seasons: [...record.seasons]
          .sort((a, b) => b - a),

        firstSeason: Math.min(
          ...record.seasons
        ),

        lastSeason: Math.max(
          ...record.seasons
        ),

        seasonsUsed: record.seasons.size,

        championships:
          record.championships.size,

        championshipSeasons: [
          ...record.championships,
        ].sort((a, b) => b - a),
      }))
      .sort(
        (a, b) =>
          b.lastSeason - a.lastSeason ||
          a.teamName.localeCompare(
            b.teamName
          )
      );

    const bySeason = [...seasons.entries()]
      .sort(([a], [b]) => b - a)
      .map(([season, keys]) => ({
        season,

        teamNames: [...keys].map(key => {
          const record = names.get(key)!;

          return {
            teamName: record.teamName,

            championship:
              record.championships.has(
                season
              ),
          };
        }),
      }));

    return {
      managerId: manager.id,
      managerName: manager.name,

      totalUniqueNames: uniqueNames.length,
      seasonsRecorded: bySeason.length,

      uniqueNames,
      bySeason,
    };
  });
}
