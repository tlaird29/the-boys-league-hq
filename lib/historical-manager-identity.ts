
import {
  ACTIVE_MANAGERS,
  LEAGUE_START_YEAR,
  normalizeManagerName,
  isActiveManager,
} from "./league-managers";

import {
  nodes,
  field,
} from "./season-analysis";

export type VerifiedManagerIdentity = {
  managerId: string;
  managerName: string;
  yahooGuids: readonly string[];
};

export type HistoricalTeamIdentity = {
  season: number;
  leagueKey: string;
  teamKey: string;
  teamName: string;
  yahooGuid: string | null;
  yahooNickname: string | null;
  managerCount: number;
};

export type VerifiedTeamAssignment = {
  season: number;
  teamKey: string;
  managerId: string;
};

export type ResolvedHistoricalTeam =
  HistoricalTeamIdentity & {
    managerId: string;
    managerName: string;
    activeManager: boolean;
    verifiedBy:
      | "yahoo-guid"
      | "confirmed-team";
  };

export const FORMER_MANAGERS = [
  {
    id: "brad-mccain",
    name: "Brad McCain",
  },
  {
    id: "john-villareal",
    name: "John Villareal",
  },
  {
    id: "dillon-lowder",
    name: "Dillon Lowder",
  },
] as const;

const KNOWN_MANAGERS = [
  ...ACTIVE_MANAGERS,
  ...FORMER_MANAGERS,
];

function getKnownManager(
  managerId: string
) {
  return (
    KNOWN_MANAGERS.find(
      manager => manager.id === managerId
    ) ?? null
  );
}

export function extractHistoricalTeamIdentities(
  payload: unknown,
  season: number,
  leagueKey: string
): HistoricalTeamIdentity[] {
  if (
    !Number.isInteger(season) ||
    season < LEAGUE_START_YEAR ||
    !/^\d+\.l\.\d+$/.test(leagueKey)
  ) {
    throw new Error(
      "Invalid historical league identity."
    );
  }

  const teams =
    new Map<string, HistoricalTeamIdentity>();

  const entries = nodes(payload)
    .filter(
      item =>
        item.team &&
        typeof item.team === "object"
    )
    .map(item => item.team);

  for (const entry of entries) {
    const teamKey = field(
      entry,
      "team_key"
    );

    const teamName = field(
      entry,
      "name"
    );

    if (
      !teamKey ||
      !teamKey.startsWith(
        `${leagueKey}.t.`
      ) ||
      !teamName?.trim()
    ) {
      continue;
    }

    const managers = nodes(entry)
      .filter(
        item =>
          item.manager &&
          typeof item.manager === "object"
      )
      .map(item => item.manager);

    const manager =
      managers.length === 1
        ? managers[0]
        : null;

    const yahooGuid = manager
      ? field(manager, "guid")?.trim() ||
        null
      : null;

    const yahooNickname = manager
      ? field(manager, "nickname")?.trim() ||
        field(manager, "name")?.trim() ||
        null
      : null;

    const team: HistoricalTeamIdentity = {
      season,
      leagueKey,
      teamKey,
      teamName: teamName.trim(),
      yahooGuid,
      yahooNickname,
      managerCount: managers.length,
    };

    const previous = teams.get(teamKey);

    if (
      previous &&
      (
        previous.yahooGuid !== yahooGuid ||
        previous.yahooNickname !== yahooNickname ||
        previous.managerCount !== managers.length ||
        previous.teamName !== team.teamName
      )
    ) {
      throw new Error(
        "Conflicting historical team identities."
      );
    }

    teams.set(teamKey, team);
  }

  return [...teams.values()];
}

export function resolveHistoricalManagers(
  teams: readonly HistoricalTeamIdentity[],
  identities:
    readonly VerifiedManagerIdentity[],
  confirmedAssignments:
    readonly VerifiedTeamAssignment[],
  season: number,
  expectedTeamCount: number
) {
  if (
    !Number.isInteger(season) ||
    season < LEAGUE_START_YEAR ||
    !Number.isInteger(expectedTeamCount) ||
    expectedTeamCount < 2
  ) {
    throw new Error(
      "Invalid historical manager audit."
    );
  }

  const conflicts: string[] = [];

  const guidMap =
    new Map<string, string>();

  const assignmentMap =
    new Map<string, string>();

  for (const identity of identities) {
    const known = getKnownManager(
      identity.managerId
    );

    if (
      !known ||
      normalizeManagerName(known.name) !==
        normalizeManagerName(
          identity.managerName
        )
    ) {
      conflicts.push(
        "Invalid verified manager identity."
      );

      continue;
    }

    for (const rawGuid of identity.yahooGuids) {
      const guid = rawGuid.trim();

      if (!guid) {
        conflicts.push(
          "Empty Yahoo manager identifier."
        );

        continue;
      }

      const existing = guidMap.get(guid);

      if (
        existing &&
        existing !== identity.managerId
      ) {
        conflicts.push(
          "Yahoo identifier assigned to multiple managers."
        );

        continue;
      }

      guidMap.set(
        guid,
        identity.managerId
      );
    }
  }

  for (
    const assignment of confirmedAssignments
  ) {
    if (assignment.season !== season) {
      continue;
    }

    if (
      !getKnownManager(
        assignment.managerId
      ) ||
      !teams.some(
        team =>
          team.season === season &&
          team.teamKey === assignment.teamKey
      )
    ) {
      conflicts.push(
        "Invalid confirmed team assignment."
      );

      continue;
    }

    const existing = assignmentMap.get(
      assignment.teamKey
    );

    if (
      existing &&
      existing !== assignment.managerId
    ) {
      conflicts.push(
        "Conflicting confirmed team assignments."
      );

      continue;
    }

    assignmentMap.set(
      assignment.teamKey,
      assignment.managerId
    );
  }

  const resolved:
    ResolvedHistoricalTeam[] = [];

  const unresolved: {
    team: HistoricalTeamIdentity;
    reason: string;
    suggestedManagerId: string | null;
  }[] = [];

  const seenTeams = new Set<string>();
  const seenManagers = new Set<string>();

  const leagueKeys = new Set(
    teams.map(team => team.leagueKey)
  );

  if (leagueKeys.size !== 1) {
    conflicts.push(
      "Teams must belong to one historical league."
    );
  }

  for (const team of teams) {
    if (
      team.season !== season ||
      !team.teamKey.startsWith(
        `${team.leagueKey}.t.`
      ) ||
      seenTeams.has(team.teamKey)
    ) {
      conflicts.push(
        "Invalid or duplicated historical team."
      );

      continue;
    }

    seenTeams.add(team.teamKey);

    const confirmed = assignmentMap.get(
      team.teamKey
    );

    const guidMatch = team.yahooGuid
      ? guidMap.get(team.yahooGuid)
      : undefined;

    const nickname = team.yahooNickname
      ? normalizeManagerName(
          team.yahooNickname
        )
      : "";

    const nameMatches = nickname
      ? KNOWN_MANAGERS.filter(
          manager =>
            normalizeManagerName(
              manager.name
            ) === nickname
        )
      : [];

    const suggestedManagerId =
      nameMatches.length === 1
        ? nameMatches[0].id
        : null;

    if (
      confirmed &&
      guidMatch &&
      confirmed !== guidMatch
    ) {
      conflicts.push(
        "Confirmed assignment conflicts with Yahoo identity."
      );

      continue;
    }

    if (
      team.managerCount !== 1 &&
      !confirmed
    ) {
      unresolved.push({
        team,
        reason:
          "Missing or multiple team managers.",
        suggestedManagerId,
      });

      continue;
    }

    const managerId =
      confirmed ?? guidMatch;

    if (!managerId) {
      unresolved.push({
        team,
        reason:
          "Manager identity requires verification.",
        suggestedManagerId,
      });

      continue;
    }

    const manager = getKnownManager(
      managerId
    );

    if (!manager) {
      conflicts.push(
        "Unknown historical manager."
      );

      continue;
    }

    if (seenManagers.has(managerId)) {
      conflicts.push(
        "Manager assigned to multiple teams in one season."
      );

      continue;
    }

    seenManagers.add(managerId);

    resolved.push({
      ...team,

      managerId,
      managerName: manager.name,

      activeManager:
        isActiveManager(managerId),

      verifiedBy: confirmed
        ? "confirmed-team"
        : "yahoo-guid",
    });
  }

  if (teams.length !== expectedTeamCount) {
    conflicts.push(
      `Expected ${expectedTeamCount} teams; received ${teams.length}.`
    );
  }

  const verified =
    conflicts.length === 0 &&
    unresolved.length === 0 &&
    resolved.length === expectedTeamCount;

  return {
    season,

    verified,

    status: verified
      ? "verified" as const
      : "needs-review" as const,

    expectedTeamCount,

    teamsResolved: resolved.length,

    activeManagersIdentified:
      resolved.filter(
        team => team.activeManager
      ).length,

    formerManagersIdentified:
      resolved.filter(
        team => !team.activeManager
      ).length,

    resolved,
    unresolved,
    conflicts,

    teamManagerMap:
      Object.fromEntries(
        resolved.map(team => [
          team.teamKey,
          team.managerId,
        ])
      ),

    note:
      "Team names and display names are " +
      "not sufficient proof of manager identity. " +
      "Historical ownership changes require " +
      "additional verification.",
  };
}
