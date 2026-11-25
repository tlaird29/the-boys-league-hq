
export const LEAGUE_START_YEAR = 2020;

export const ACTIVE_MANAGERS = [
  {
    id: "tyler-laird",
    name: "Tyler Laird",
    displayName: "Laird",
    commissioner: true,
  },
  {
    id: "caleb-burnham",
    name: "Caleb Burnham",
    displayName: "Caleb",
    commissioner: false,
  },
  {
    id: "lane-lehman",
    name: "Lane Lehman",
    displayName: "Lane",
    commissioner: false,
  },
  {
    id: "braden-riley",
    name: "Braden Riley",
    displayName: "Braden",
    commissioner: false,
  },
  {
    id: "tyler-gay",
    name: "Tyler Gay",
    displayName: "TGay",
    commissioner: false,
  },
  {
    id: "hunter-crownover",
    name: "Hunter Crownover",
    displayName: "Hunter C.",
    commissioner: false,
  },
  {
    id: "hunter-kovick",
    name: "Hunter Kovick",
    displayName: "Hunter K.",
    commissioner: false,
  },
  {
    id: "kyler-landa",
    name: "Kyler Landa",
    displayName: "Kyler",
    commissioner: false,
  },
  {
    id: "cade-burnham",
    name: "Cade Burnham",
    displayName: "Cade",
    commissioner: false,
  },
  {
    id: "cody-carpenter",
    name: "Cody Carpenter",
    displayName: "Cody",
    commissioner: false,
  },
] as const;

export type LeagueManager =
  (typeof ACTIVE_MANAGERS)[number];

export type ManagerId =
  LeagueManager["id"];

export const EXPECTED_MANAGER_COUNT =
  ACTIVE_MANAGERS.length;

export function normalizeManagerName(
  value: string
): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function findManagerById(
  id: string
): LeagueManager | null {
  return (
    ACTIVE_MANAGERS.find(
      manager => manager.id === id
    ) ?? null
  );
}

export function findManagerByName(
  name: string
): LeagueManager | null {
  const normalized =
    normalizeManagerName(name);

  const matches = ACTIVE_MANAGERS.filter(
    manager =>
      normalizeManagerName(manager.name) ===
      normalized
  );

  return matches.length === 1
    ? matches[0]
    : null;
}

export function isActiveManager(
  id: string
): id is ManagerId {
  return findManagerById(id) !== null;
}

export function getCommissioner(): LeagueManager {
  return ACTIVE_MANAGERS[0];
}

export function validateManagerCoverage(
  managerIds: readonly string[]
) {
  const uniqueIds = new Set(managerIds);

  const missing = ACTIVE_MANAGERS
    .filter(
      manager => !uniqueIds.has(manager.id)
    )
    .map(manager => manager.name);

  const unknown = [...uniqueIds].filter(
    id => !isActiveManager(id)
  );

  const duplicates = [
    ...new Set(
      managerIds.filter(
        (id, index) =>
          managerIds.indexOf(id) !== index
      )
    ),
  ];

  return {
    valid:
      missing.length === 0 &&
      unknown.length === 0 &&
      duplicates.length === 0 &&
      managerIds.length ===
        EXPECTED_MANAGER_COUNT,

    expected: EXPECTED_MANAGER_COUNT,
    identified: uniqueIds.size,
    missing,
    unknown,
    duplicates,
  };
}

export function selectLeague<
  T extends {
    season: number;
    key: string;
    managerIds: readonly string[];
  }
>(
  candidates: readonly T[],
  season: number
): T {
  const matches = candidates.filter(
    league =>
      league.season === season &&
      league.key.trim().length > 0 &&
      validateManagerCoverage(
        league.managerIds
      ).valid
  );

  if (matches.length === 0) {
    throw new Error(
      "No verified league matches the " +
      "current season and active managers."
    );
  }

  if (matches.length > 1) {
    throw new Error(
      "Multiple leagues match. " +
      "Commissioner verification is required."
    );
  }

  return matches[0];
}
