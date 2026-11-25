import {
  buildDocumentaryProductionBrief,
  type DocumentaryProductionInput,
  type DocumentaryEvidence,
} from "./documentary-production-brief";

import {
  analyzeDocumentaryPlayers,
} from "./documentary-player-impact";

import {
  analyzeRosterDecisions,
  type DocumentaryDraftPick,
  type DocumentaryAcquisition,
} from "./documentary-roster-decisions";

import {
  getRelevantLeagueLore,
} from "./documentary-league-lore";

import type {
  PlayerWeekPerformance,
} from "./player-record-types";

export type CompleteDocumentaryInput =
  DocumentaryProductionInput & {
    playerData?: {
      lineupCoverageVerified: boolean;
      performances:
        readonly PlayerWeekPerformance[];
    };

    rosterData?: {
      draftVerified: boolean;
      transactionsVerified: boolean;
      draftPicks:
        readonly DocumentaryDraftPick[];
      acquisitions:
        readonly DocumentaryAcquisition[];
    };
  };

export function buildCompleteDocumentaryBrief(
  input: CompleteDocumentaryInput
) {
  const warnings: string[] = [];

  function failure(issues: string[]) {
    return {
      verified: false as const,
      issues,
      warnings,
      brief: null,
      aiRequests: 0,
      yahooRequests: 0,
      databaseWrites: 0,
      readyForRendering: false,
      readyForPublication: false,
    };
  }

  if (input.fictional !== true) {
    return failure([
      "Live documentary production is disabled.",
    ]);
  }

  const base =
    buildDocumentaryProductionBrief(
      input
    );

  if (
    !base.verified ||
    !base.brief
  ) {
    return failure(base.issues);
  }

  const playerEvidence:
    DocumentaryEvidence[] = [];

  const rosterEvidence:
    DocumentaryEvidence[] = [];

  let playerCoverageVerified = false;
  let draftCoverageVerified = false;
  let transactionCoverageVerified = false;

  if (input.playerData) {
    const players =
      analyzeDocumentaryPlayers({
        fictional: true,
        season: input.current,
        performances:
          input.playerData.performances,
        lineupCoverageVerified:
          input.playerData
            .lineupCoverageVerified,
      });

    if (!players.verified) {
      return failure(players.issues);
    }

    playerCoverageVerified = true;

    playerEvidence.push(
      ...players.evidence
    );

    if (input.rosterData) {
      const roster =
        analyzeRosterDecisions({
          fictional: true,

          season:
            input.current.season,

          teamCount:
            input.current.managerIds.length,

          regularSeasonEndWeek:
            input.current
              .regularSeasonEndWeek,

          draftVerified:
            input.rosterData
              .draftVerified,

          transactionsVerified:
            input.rosterData
              .transactionsVerified,

          draftPicks:
            input.rosterData
              .draftPicks,

          acquisitions:
            input.rosterData
              .acquisitions,

          performances:
            players
              .officialPerformances,
        });

      if (!roster.verified) {
        return failure(roster.issues);
      }

      warnings.push(
        ...roster.warnings
      );

      rosterEvidence.push(
        ...roster.evidence
      );

      draftCoverageVerified =
        input.rosterData.draftVerified;

      transactionCoverageVerified =
        input.rosterData
          .transactionsVerified;
    } else {
      warnings.push(
        "Draft and transaction evidence was not supplied."
      );
    }
  } else {
    warnings.push(
      "Individual player evidence was not supplied."
    );

    if (input.rosterData) {
      warnings.push(
        "Roster decisions cannot be evaluated without verified player contributions."
      );
    }
  }

  const allEvidence = [
    ...base.brief.selectedEvidence,
    ...base.brief.additionalEvidence,
    ...playerEvidence,
    ...rosterEvidence,
  ].sort(
    (a, b) =>
      b.importance - a.importance ||
      a.id.localeCompare(b.id)
  );

  const uniqueIds =
    new Set<string>();

  for (const item of allEvidence) {
    if (uniqueIds.has(item.id)) {
      return failure([
        `Duplicate documentary evidence: ${item.id}`,
      ]);
    }

    uniqueIds.add(item.id);
  }

  const championship =
    base.brief.championship;

  const centralStory =
    allEvidence.find(
      item =>
        item.type !== "championship"
    ) ?? championship;

  const selected:
    DocumentaryEvidence[] = [
      centralStory,
    ];

  const selectedIds = new Set([
    centralStory.id,
    championship.id,
  ]);

  const selectedTypes = new Set([
    centralStory.type,
  ]);

  function include(
    item: DocumentaryEvidence
  ) {
    if (
      selectedIds.has(item.id) ||
      selectedTypes.has(item.type) ||
      selected.length >= 8
    ) {
      return;
    }

    selected.push(item);
    selectedIds.add(item.id);
    selectedTypes.add(item.type);
  }

  const championId =
    championship.managerIds[0];

  const championContribution =
    playerEvidence
      .filter(
        item =>
          item.managerIds.includes(
            championId
          )
      )
      .sort(
        (a, b) =>
          b.importance - a.importance
      )[0];

  if (championContribution) {
    include(championContribution);
  }

  const strongestRosterStory =
    rosterEvidence[0];

  if (
    strongestRosterStory &&
    strongestRosterStory.importance >= 85
  ) {
    include(strongestRosterStory);
  }

  for (const item of allEvidence) {
    include(item);
  }

  if (
    centralStory.id !== championship.id
  ) {
    selected.push(championship);
  }

  const featuredManagerIds = [
    ...new Set(
      selected.flatMap(
        item => item.managerIds
      )
    ),
  ];

  const leagueLore =
    getRelevantLeagueLore(
      featuredManagerIds,
      input.approvedLoreIds ?? []
    );

  const proposedTitle =
    centralStory.headline.toUpperCase();

  const titleAlreadyUsed =
    (
      input.previousTitles ?? []
    ).some(
      title =>
        title.trim().toLowerCase() ===
          proposedTitle.toLowerCase()
    );

  return {
    verified: true as const,
    issues: [],
    warnings,

    brief: {
      ...base.brief,

      proposedTitle:
        titleAlreadyUsed
          ? null
          : proposedTitle,

      centralStory,

      championship,

      selectedEvidence: selected,

      additionalEvidence:
        allEvidence.filter(
          item =>
            !selected.some(
              chosen =>
                chosen.id === item.id
            )
        ),

      featuredManagerIds,

      leagueLore,

      coverage: {
        historical:
          base.brief
            .historicalCoverageComplete,

        players:
          playerCoverageVerified,

        draft:
          draftCoverageVerified,

        transactions:
          transactionCoverageVerified,
      },

      editorialInstructions: [
        ...base.brief
          .editorialInstructions,

        "Explain the player contributions that shaped the season when supported by evidence.",

        "Connect individual performances to the manager's broader season journey.",

        "Do not describe the highest-scoring player as the official league MVP unless an approved award result supports that title.",

        "Distinguish starting-lineup contributions from total NFL player production.",

        "Do not include bench or consolation points in official statistical claims.",

        "Do not declare a trade winner without evaluating both sides and the complete transaction.",

        "Do not claim a transaction caused a championship, winning streak or comeback.",

        "A low draft return is not proof of a bad draft decision.",

        "Do not invent injuries, player projections, draft expectations or transaction details.",

        "When a source category is unavailable, omit those claims instead of filling gaps with assumptions.",

        "Use player names naturally rather than reading a statistical leaderboard.",

        "Prioritize a compelling continuous narrative over mentioning every available statistic.",
      ],

      production: {
        ...base.brief.production,

        availableGraphics: [
          ...base.brief.production
            .availableGraphics,

          "player-performance-card",
          "draft-pick-reveal",
          "transaction-scoreboard",
          "player-contribution-chart",
          "championship-hero-reveal",
        ],
      },

      status:
        "awaiting-original-script",

      fictional: true,

      commissionerApproved: false,

      readyForRendering: false,

      readyForPublication: false,
    },

    aiRequests: 0,
    yahooRequests: 0,
    databaseWrites: 0,
    renderingRequests: 0,
    readyForRendering: false,
    readyForPublication: false,
  };
}