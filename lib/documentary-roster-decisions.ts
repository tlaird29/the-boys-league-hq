import type {
  PlayerWeekPerformance,
} from "./player-record-types";

import type {
  DocumentaryEvidence,
} from "./documentary-production-brief";

export type DocumentaryDraftPick = {
  season: number;
  managerId: string;
  playerId: string;
  playerName: string;
  round: number;
  overallPick: number;
};

export type DocumentaryAcquisition = {
  id: string;
  season: number;
  type: "trade" | "waiver" | "free-agent";
  managerId: string;
  playerId: string;
  playerName: string;
  effectiveWeek: number;
  previousManagerId?: string;
};

export type RosterDecisionInput = {
  fictional: true;
  season: number;
  teamCount: number;
  regularSeasonEndWeek: number;
  draftVerified: boolean;
  transactionsVerified: boolean;
  draftPicks:
    readonly DocumentaryDraftPick[];
  acquisitions:
    readonly DocumentaryAcquisition[];
  performances:
    readonly PlayerWeekPerformance[];
};

function score(value: number) {
  return value.toFixed(2);
}

function total(
  rows: readonly PlayerWeekPerformance[]
) {
  return Math.round(
    rows.reduce(
      (sum, row) => sum + row.points,
      0
    ) * 100
  ) / 100;
}

export function analyzeRosterDecisions(
  input: RosterDecisionInput
) {
  const evidence: DocumentaryEvidence[] = [];
  const warnings: string[] = [];
  const issues: string[] = [];

  if (input.fictional !== true) {
    return {
      verified: false,
      issues: [
        "Only fictional demonstrations are enabled.",
      ],
      warnings,
      evidence: [],
    };
  }

  if (
    !Number.isInteger(input.season) ||
    input.season < 2020 ||
    !Number.isInteger(input.teamCount) ||
    input.teamCount < 8 ||
    !Number.isInteger(
      input.regularSeasonEndWeek
    ) ||
    input.regularSeasonEndWeek < 1 ||
    input.regularSeasonEndWeek > 15
  ) {
    return {
      verified: false,
      issues: [
        "Invalid season configuration.",
      ],
      warnings,
      evidence: [],
    };
  }

  const performances =
    input.performances.filter(
      row =>
        row.season === input.season &&
        row.started &&
        row.scoringFinal &&
        !row.isConsolation
    );

  if (input.draftVerified) {
    const picks = input.draftPicks.filter(
      pick =>
        pick.season === input.season
    );

    const pickNumbers = new Set<number>();
    const draftedPlayers = new Set<string>();

    for (const pick of picks) {
      if (
        !pick.managerId.trim() ||
        !pick.playerId.trim() ||
        !pick.playerName.trim() ||
        !Number.isInteger(pick.round) ||
        pick.round < 1 ||
        !Number.isInteger(
          pick.overallPick
        ) ||
        pick.overallPick < 1 ||
        pickNumbers.has(
          pick.overallPick
        ) ||
        draftedPlayers.has(
          pick.playerId
        )
      ) {
        issues.push(
          `Invalid or duplicate draft pick: ${pick.playerName}.`
        );

        continue;
      }

      pickNumbers.add(
        pick.overallPick
      );

      draftedPlayers.add(
        pick.playerId
      );
    }

    if (picks.length === 0) {
      issues.push(
        "Verified draft contains no picks."
      );
    }

    const draftResults = picks.map(
      pick => {
        const rows = performances.filter(
          row =>
            row.playerId === pick.playerId &&
            row.managerId === pick.managerId &&
            !row.isPlayoffs
        );

        return {
          ...pick,
          points: total(rows),
          starts: rows.length,
          weeks: rows.map(
            row => row.week
          ),
        };
      }
    );

    const lateRoundPicks =
      draftResults.filter(
        pick =>
          pick.round >= 8 &&
          pick.starts >= 6
      );

    if (lateRoundPicks.length > 0) {
      const bestPoints = Math.max(
        ...lateRoundPicks.map(
          pick => pick.points
        )
      );

      for (const pick of lateRoundPicks.filter(
        item =>
          item.points === bestPoints
      )) {
        evidence.push({
          id:
            `draft:late-value:${pick.playerId}`,
          type: "late-round-value",
          headline: "Draft Day Heist",
          fact:
            `${pick.playerName}, selected ` +
            `in Round ${pick.round} at ` +
            `overall pick ${pick.overallPick}, ` +
            `contributed ${score(pick.points)} ` +
            `regular-season starting points ` +
            `to the drafting manager across ` +
            `${pick.starts} starts. This was ` +
            `a leading total among Round 8 ` +
            `or later picks with at least ` +
            `six starts.`,
          managerIds: [
            pick.managerId,
          ],
          seasons: [
            input.season,
          ],
          weeks: pick.weeks,
          importance: 88,
        });
      }
    }

    const earlyPicks =
      draftResults.filter(
        pick =>
          pick.round <= 2
      );

    if (earlyPicks.length > 0) {
      const lowestPoints = Math.min(
        ...earlyPicks.map(
          pick => pick.points
        )
      );

      for (const pick of earlyPicks.filter(
        item =>
          item.points === lowestPoints
      )) {
        evidence.push({
          id:
            `draft:low-return:${pick.playerId}`,
          type: "early-pick-low-return",
          headline: "Expensive Disappointment",
          fact:
            `${pick.playerName}, selected ` +
            `in Round ${pick.round} at ` +
            `overall pick ${pick.overallPick}, ` +
            `contributed ${score(pick.points)} ` +
            `regular-season starting points ` +
            `to the drafting manager across ` +
            `${pick.starts} starts. This was ` +
            `a lowest direct starting-point ` +
            `return among first- and ` +
            `second-round selections. ` +
            `This does not establish injury ` +
            `status, trade return or the ` +
            `overall value of the draft pick.`,
          managerIds: [
            pick.managerId,
          ],
          seasons: [
            input.season,
          ],
          weeks: pick.weeks,
          importance: 79,
        });
      }
    }
  } else {
    warnings.push(
      "Draft evidence unavailable. Draft claims must be omitted."
    );
  }

  if (input.transactionsVerified) {
    const acquisitions =
      input.acquisitions.filter(
        item =>
          item.season === input.season
      );

    const seenIds = new Set<string>();

    for (const acquisition of acquisitions) {
      if (
        !acquisition.id.trim() ||
        !acquisition.managerId.trim() ||
        !acquisition.playerId.trim() ||
        !acquisition.playerName.trim() ||
        ![
          "trade",
          "waiver",
          "free-agent",
        ].includes(acquisition.type) ||
        !Number.isInteger(
          acquisition.effectiveWeek
        ) ||
        acquisition.effectiveWeek < 1 ||
        acquisition.effectiveWeek >
          input.regularSeasonEndWeek + 3 ||
        seenIds.has(acquisition.id) ||
        (
          acquisition.type === "trade" &&
          (
            !acquisition.previousManagerId ||
            acquisition.previousManagerId ===
              acquisition.managerId
          )
        )
      ) {
        issues.push(
          `Invalid acquisition: ${acquisition.id}`
        );

        continue;
      }

      seenIds.add(acquisition.id);
    }

    for (const acquisition of acquisitions) {
      const nextAcquisition =
        acquisitions
          .filter(
            item =>
              item.playerId ===
                acquisition.playerId &&
              item.effectiveWeek >
                acquisition.effectiveWeek
          )
          .sort(
            (a, b) =>
              a.effectiveWeek -
              b.effectiveWeek
          )[0];

      const ambiguousWeek =
        acquisitions.some(
          item =>
            item.id !== acquisition.id &&
            item.playerId ===
              acquisition.playerId &&
            item.effectiveWeek ===
              acquisition.effectiveWeek
        );

      if (ambiguousWeek) {
        warnings.push(
          `Ambiguous acquisition timing for ${acquisition.playerName}.`
        );

        continue;
      }

      const rows = performances.filter(
        row =>
          row.playerId ===
            acquisition.playerId &&
          row.managerId ===
            acquisition.managerId &&
          row.week >=
            acquisition.effectiveWeek &&
          (
            !nextAcquisition ||
            row.week <
              nextAcquisition.effectiveWeek
          )
      );

      const points = total(rows);

      const playoffPoints = total(
        rows.filter(
          row => row.isPlayoffs
        )
      );

      if (
        rows.length < 2 ||
        points < 40
      ) {
        continue;
      }

      const type =
        acquisition.type === "trade"
          ? "trade-contribution"
          : "waiver-contribution";

      const acquisitionLabel =
        acquisition.type === "trade"
          ? "trade"
          : acquisition.type === "waiver"
            ? "waiver claim"
            : "free-agent acquisition";

      evidence.push({
        id:
          `transaction:${acquisition.id}`,
        type,
        headline:
          acquisition.type === "trade"
            ? "The Midseason Move"
            : "Found Money",
        fact:
          `${acquisition.playerName} joined ` +
          `manager ${acquisition.managerId} ` +
          `through a ${acquisitionLabel} ` +
          `effective Week ` +
          `${acquisition.effectiveWeek}. ` +
          `During the measured acquisition ` +
          `period, the player contributed ` +
          `${score(points)} starting points ` +
          `across ${rows.length} starts, ` +
          `including ${score(playoffPoints)} ` +
          `championship-bracket points. ` +
          `This measures contribution, not ` +
          `net transaction value or causation.`,
        managerIds: [
          acquisition.managerId,
          ...(
            acquisition.previousManagerId
              ? [
                  acquisition.previousManagerId,
                ]
              : []
          ),
        ],
        seasons: [
          input.season,
        ],
        weeks: rows.map(
          row => row.week
        ),
        importance: Math.min(
          94,
          70 +
            Math.floor(points / 20) +
            (
              playoffPoints >= 30
                ? 5
                : 0
            )
        ),
      });
    }
  } else {
    warnings.push(
      "Transaction evidence unavailable. Trade and waiver claims must be omitted."
    );
  }

  return {
    verified: issues.length === 0,
    issues,
    warnings,
    evidence:
      issues.length === 0
        ? evidence.sort(
            (a, b) =>
              b.importance - a.importance ||
              a.id.localeCompare(b.id)
          )
        : [],
    fictional: true,
    readyForPublication: false,
  };
}