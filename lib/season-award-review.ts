import {
  type SeasonAward,
  type SeasonAwardId,
  type AwardRecipient,
} from "./season-award-types";

import {
  type CompletedSeason,
} from "./championship-history";

import {
  findManagerById,
} from "./league-managers";

export const AWARD_EVIDENCE_REQUIREMENTS = {
  "manager-of-year": [
    "Regular-season record",
    "Playoff performance",
    "Roster management",
    "Supporting season accomplishments",
  ],

  "league-mvp": [
    "Verified player scoring",
    "Starting lineup contributions",
    "Consistency",
    "Impact on matchup results",
  ],

  "draft-steal": [
    "Original draft position",
    "Verified player production",
    "Positional scoring comparison",
    "Value returned relative to draft cost",
  ],

  "trade-of-year": [
    "Verified completed trade",
    "Players exchanged",
    "Post-trade production",
    "Impact on the receiving teams",
  ],

  "bum-of-year": [
    "Verified season results",
    "Scoring performance",
    "Roster decisions",
    "Supporting season context",
  ],

  collapse: [
    "Earlier season record",
    "Earlier standings position",
    "Late-season results",
    "Final standings position",
  ],

  "draft-disaster": [
    "Original draft position",
    "Verified player production",
    "Availability and injury context",
    "Return relative to draft cost",
  ],

  "trade-robbery": [
    "Verified completed trade",
    "Players exchanged",
    "Post-trade production for both sides",
    "Context of the original transaction",
  ],
} as const;

export type ReviewableAwardId =
  keyof typeof AWARD_EVIDENCE_REQUIREMENTS;

export type AwardReviewSelection = {
  managerId: string;
  playerName?: string;
  explanation: string;
  evidenceReferences: readonly string[];
};

export type SeasonAwardReviewInput = {
  season: number;
  awardId: SeasonAwardId;
  awards: readonly SeasonAward[];
  finalSeason: CompletedSeason;
  selections: readonly AwardReviewSelection[];
  evidenceVerified: boolean;
  commissionerApproved: boolean;
  managerNames?: Readonly<Record<string, string>>;
};

export function getAwardEvidenceRequirements(
  awardId: SeasonAwardId
): readonly string[] {
  if (
    Object.prototype.hasOwnProperty.call(
      AWARD_EVIDENCE_REQUIREMENTS,
      awardId
    )
  ) {
    return AWARD_EVIDENCE_REQUIREMENTS[
      awardId as ReviewableAwardId
    ];
  }

  return [];
}

export function reviewSeasonAward(
  input: SeasonAwardReviewInput
) {
  const {
    season,
    awardId,
    awards,
    finalSeason,
    selections,
    evidenceVerified,
    commissionerApproved,
    managerNames = {},
  } = input;

  const issues: string[] = [];

  const matchingAwards =
    awards.filter(
      award =>
        award.id === awardId &&
        award.season === season
    );

  const target = matchingAwards[0];

  if (
    matchingAwards.length !== 1 ||
    !target ||
    target.method !== "review"
  ) {
    issues.push(
      "A unique reviewable award is required."
    );
  }

  if (
    target &&
    target.status !== "awaiting-review" &&
    target.status !== "approved"
  ) {
    issues.push(
      "This award is not ready for review."
    );
  }

  if (
    !finalSeason.finished ||
    !finalSeason.standingsVerified ||
    finalSeason.season !== season
  ) {
    issues.push(
      "Verified completed-season standings are required."
    );
  }

  if (!evidenceVerified) {
    issues.push(
      "Supporting award evidence has not been verified."
    );
  }

  if (!commissionerApproved) {
    issues.push(
      "Commissioner approval is required."
    );
  }

  if (selections.length === 0) {
    issues.push(
      "Select at least one award recipient."
    );
  }

  const participants = new Map(
    finalSeason.standings.map(team => [
      team.managerId,
      team,
    ])
  );

  const seen = new Set<string>();

  const recipients: AwardRecipient[] = [];

  const playerAwards: SeasonAwardId[] = [
    "league-mvp",
    "draft-steal",
    "draft-disaster",
  ];

  for (const selection of selections) {
    const participant =
      participants.get(selection.managerId);

    if (!participant) {
      issues.push(
        "Selected manager did not participate in this season."
      );

      continue;
    }

    const playerName =
      selection.playerName?.trim();

    if (
      playerAwards.includes(awardId) &&
      !playerName
    ) {
      issues.push(
        "A player must be identified for this award."
      );
    }

    const key =
      selection.managerId +
      ":" +
      (playerName ?? "").toLowerCase();

    if (seen.has(key)) {
      issues.push(
        "Duplicate award recipient."
      );
    }

    seen.add(key);

    const explanation =
      selection.explanation.trim();

    if (explanation.length < 20) {
      issues.push(
        "Provide a meaningful explanation for the selection."
      );
    }

    const references = [
      ...new Set(
        selection.evidenceReferences
          .map(reference => reference.trim())
          .filter(Boolean)
      ),
    ];

    if (references.length === 0) {
      issues.push(
        "Supporting evidence references are required."
      );
    }

    recipients.push({
      managerId: selection.managerId,

      managerName:
        findManagerById(
          selection.managerId
        )?.name ??
        managerNames[
          selection.managerId
        ]?.trim() ??
        selection.managerId,

      teamName: participant.teamName,

      ...(playerName
        ? { playerName }
        : {}),

      evidence: explanation,
    });
  }

  if (issues.length > 0 || !target) {
    return {
      approved: false,
      season,
      awardId,
      issues,
      awards: [...awards],
      readyForPublication: false,
      databaseWrites: 0,
      emailsSent: 0,
    };
  }

  const updatedAwards =
    awards.map(
      (award): SeasonAward =>
        award.id === awardId &&
        award.season === season
          ? {
              ...award,
              status: "approved",
              recipients,
              explanation:
                "Commissioner-approved selection based on supplied verified season evidence.",
            }
          : award
    );

  return {
    approved: true,
    season,
    awardId,
    issues: [],
    awards: updatedAwards,
    readyForPublication: false,
    databaseWrites: 0,
    emailsSent: 0,
  };
}