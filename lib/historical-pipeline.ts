
import {
  LEAGUE_START_YEAR,
} from "./league-managers";

import {
  resolveHistoricalLeagueChain,
  type HistoricalLeague,
  type VerifiedLeagueIdentity,
} from "./historical-league-discovery";

import {
  resolveHistoricalManagers,
  type HistoricalTeamIdentity,
  type VerifiedManagerIdentity,
  type VerifiedTeamAssignment,
} from "./historical-manager-identity";

import {
  extractHistoricalWeek,
  assembleHistoricalSeason,
} from "./historical-matchups";

import {
  reconcileHistoricalSeason,
  type HistoricalSchedule,
  type HistoricalStandings,
} from "./historical-reconciliation";

import {
  verifyChampionshipBracket,
  type ChampionshipBracket,
  type OfficialFinalResults,
} from "./championship-bracket";

import {
  prepareHistoricalEvidence,
} from "./official-historical-evidence";

import {
  validateOfficialGameCounts,
} from "./official-schedule-validation";

import {
  calculateAllTimeRecords,
} from "./all-time-records";

import type {
  HistoricalGame,
} from "./lifetime-records";

import type {
  CompletedSeason,
} from "./championship-history";

export const HISTORICAL_PLAYOFF_RULES = {
  playoffTeams: 8,
  quarterfinalMatchups: 4,
  semifinalMatchups: 2,
  championshipMatchups: 1,
  totalMatchups: 7,
  championshipWinsRequired: 3,
  firstRoundByes: 0,
} as const;

export type HistoricalSeasonEvidence = {
  season: number;
  leagueKey: string;

  throughWeek: number;

  teams:
    readonly HistoricalTeamIdentity[];

  scoreboards: readonly {
    week: number;
    payload: unknown;
  }[];

  schedule: HistoricalSchedule;

  standings: HistoricalStandings;

  bracket?: ChampionshipBracket;

  finalResults?: OfficialFinalResults;
};

export type HistoricalPipelineInput = {
  throughSeason: number;

  leagueCandidates:
    readonly HistoricalLeague[];

  verifiedLeagueIdentities:
    readonly VerifiedLeagueIdentity[];

  verifiedManagerIdentities:
    readonly VerifiedManagerIdentity[];

  confirmedTeamAssignments:
    readonly VerifiedTeamAssignment[];

  seasons:
    readonly HistoricalSeasonEvidence[];
};

type SeasonReport = {
  season: number;

  status:
    | "verified"
    | "needs-review";

  stage: string;

  issues: string[];

  gamesVerified: number;

  excludedConsolationMatchups:
    number;

  championshipVerified: boolean;
};

export function validateEightTeamBracket(
  bracket: ChampionshipBracket,
  regularSeasonEndWeek: number,
  finalWeek: number
): string[] {
  const issues: string[] = [];

  if (
    bracket.playoffTeamKeys.length !== 8 ||
    new Set(
      bracket.playoffTeamKeys
    ).size !== 8
  ) {
    issues.push(
      "Championship bracket must contain eight unique playoff teams."
    );
  }

  const expectedRounds = [
    {
      round: "quarterfinal",
      matchups: 4,
      week: regularSeasonEndWeek + 1,
    },
    {
      round: "semifinal",
      matchups: 2,
      week: regularSeasonEndWeek + 2,
    },
    {
      round: "championship",
      matchups: 1,
      week: regularSeasonEndWeek + 3,
    },
  ] as const;

  if (
    bracket.rounds.length !== 3
  ) {
    issues.push(
      "Championship bracket must contain three rounds."
    );
  }

  for (
    const expected of
    expectedRounds
  ) {
    const matchingRounds =
      bracket.rounds.filter(
        round =>
          round.round ===
          expected.round
      );

    if (
      matchingRounds.length !== 1
    ) {
      issues.push(
        `Missing or duplicated ${expected.round} round.`
      );

      continue;
    }

    const round =
      matchingRounds[0];

    if (
      round.matchups.length !==
      expected.matchups
    ) {
      issues.push(
        `Incorrect matchup count for ${expected.round}.`
      );
    }

    if (
      round.byeTeamKeys.length !== 0
    ) {
      issues.push(
        "Eight-team championship bracket cannot contain byes."
      );
    }

    if (
      round.week !== expected.week
    ) {
      issues.push(
        `Unexpected week for ${expected.round}.`
      );
    }
  }

  const totalMatchups =
    bracket.rounds.reduce(
      (total, round) =>
        total + round.matchups.length,
      0
    );

  if (
    totalMatchups !== 7
  ) {
    issues.push(
      "Championship bracket must contain seven matchups."
    );
  }

  if (
    finalWeek !==
    regularSeasonEndWeek + 3
  ) {
    issues.push(
      "Championship week does not match the three-round playoff format."
    );
  }

  return issues;
}

export function runHistoricalPipeline(
  input: HistoricalPipelineInput
) {
  if (
    !Number.isInteger(
      input.throughSeason
    ) ||
    input.throughSeason <
      LEAGUE_START_YEAR
  ) {
    throw new Error(
      "Invalid historical pipeline range."
    );
  }

  const discovery =
    resolveHistoricalLeagueChain(
      input.leagueCandidates,
      input.verifiedLeagueIdentities,
      input.throughSeason
    );

  const globalIssues: string[] = [];

  const reports:
    SeasonReport[] = [];

  const verifiedGames:
    HistoricalGame[] = [];

  const completedSeasons:
    CompletedSeason[] = [];

  const evidenceBySeason =
    new Map<
      number,
      HistoricalSeasonEvidence
    >();

  for (
    const evidence of
    input.seasons
  ) {
    if (
      !Number.isInteger(
        evidence.season
      ) ||
      evidence.season <
        LEAGUE_START_YEAR ||
      evidence.season >
        input.throughSeason
    ) {
      globalIssues.push(
        "Unexpected historical season evidence."
      );

      continue;
    }

    if (
      evidenceBySeason.has(
        evidence.season
      )
    ) {
      globalIssues.push(
        `Duplicate evidence for ${evidence.season}.`
      );

      continue;
    }

    evidenceBySeason.set(
      evidence.season,
      evidence
    );
  }

  if (!discovery.verified) {
    globalIssues.push(
      "Historical league identity coverage is incomplete."
    );
  }

  for (
    let season = LEAGUE_START_YEAR;
    season <= input.throughSeason;
    season++
  ) {
    const report: SeasonReport = {
      season,

      status: "needs-review",

      stage: "league-discovery",

      issues: [],

      gamesVerified: 0,

      excludedConsolationMatchups: 0,

      championshipVerified: false,
    };

    reports.push(report);

    try {
      const selected =
        discovery.verifiedLeagues.find(
          entry =>
            entry.league.season ===
            season
        );

      if (!selected) {
        report.issues.push(
          "Historical league is not verified."
        );

        continue;
      }

      const league =
        selected.league;

      if (
        season < input.throughSeason &&
        !league.finished
      ) {
        report.issues.push(
          "Previous season is not marked complete."
        );

        continue;
      }

      const originalEvidence =
        evidenceBySeason.get(
          season
        );

      if (
        !originalEvidence ||
        originalEvidence.leagueKey !==
          league.key
      ) {
        report.issues.push(
          "Historical season evidence is missing or belongs to another league."
        );

        continue;
      }

      report.stage =
        "manager-identification";

      if (
        originalEvidence.teams.some(
          team =>
            team.leagueKey !==
              league.key ||
            team.season !== season
        )
      ) {
        report.issues.push(
          "Historical teams belong to an unexpected league or season."
        );

        continue;
      }

      const managers =
        resolveHistoricalManagers(
          originalEvidence.teams,
          input.verifiedManagerIdentities,
          input.confirmedTeamAssignments,
          season,
          league.teamCount
        );

      if (!managers.verified) {
        report.issues.push(
          ...managers.conflicts,

          `${managers.unresolved.length} unresolved manager identities.`
        );

        continue;
      }

      report.stage =
        "official-matchup-preparation";

      const prepared =
        prepareHistoricalEvidence(
          league,
          originalEvidence
        );

      report.excludedConsolationMatchups =
        prepared.excludedConsolationMatchups;

      if (
        !prepared.verified ||
        !prepared.evidence
      ) {
        report.issues.push(
          ...prepared.issues
        );

        continue;
      }

      const evidence =
        prepared.evidence;

      report.stage =
        "matchup-collection";

      const weeklyResults =
        evidence.scoreboards.map(
          scoreboard =>
            extractHistoricalWeek(
              scoreboard.payload,
              league,
              managers.resolved,
              scoreboard.week
            )
        );

      const collection =
        assembleHistoricalSeason(
          league,
          weeklyResults,
          evidence.throughWeek
        );

      if (
        !collection.collectionComplete
      ) {
        report.issues.push(
          ...collection.issues,

          ...collection.missingWeeks.map(
            week =>
              `Missing historical week ${week}.`
          )
        );

        for (
          const result of
          weeklyResults
        ) {
          if (!result.verified) {
            report.issues.push(
              ...result.issues.map(
                issue =>
                  `Week ${result.week}: ${issue}`
              )
            );
          }
        }

        continue;
      }

      report.stage =
        "official-game-count-validation";

      const gameCounts =
        validateOfficialGameCounts(
          collection.games,
          evidence.schedule.regularSeasonEndWeek,
          league.startWeek,
          evidence.throughWeek,
          league.teamCount
        );

      if (!gameCounts.verified) {
        report.issues.push(
          ...gameCounts.issues
        );

        continue;
      }

      report.stage =
        "schedule-reconciliation";

      const reconciliation =
        reconcileHistoricalSeason(
          league,
          managers.resolved,
          evidence.schedule,
          evidence.standings,
          collection.games
        );

      if (
        !reconciliation.verified
      ) {
        report.issues.push(
          ...reconciliation.issues,

          ...reconciliation.audit.issues.map(
            issue => issue.message
          )
        );

        continue;
      }

      let seasonChampionship:
        CompletedSeason | null =
          null;

      if (league.finished) {
        report.stage =
          "championship-verification";

        if (
          !evidence.bracket ||
          !evidence.finalResults
        ) {
          report.issues.push(
            "Completed season requires championship evidence."
          );

          continue;
        }

        const bracketIssues =
          validateEightTeamBracket(
            evidence.bracket,
            evidence.schedule.regularSeasonEndWeek,
            league.endWeek
          );

        if (
          bracketIssues.length > 0
        ) {
          report.issues.push(
            ...bracketIssues
          );

          continue;
        }

        const championship =
          verifyChampionshipBracket(
            league,
            managers.resolved,
            reconciliation.verifiedGames,
            evidence.bracket,
            evidence.finalResults
          );

        if (
          !championship.verified ||
          !championship.completedSeason
        ) {
          report.issues.push(
            ...championship.issues
          );

          continue;
        }

        if (
          championship
            .championshipMatchupsVerified !==
          HISTORICAL_PLAYOFF_RULES
            .totalMatchups
        ) {
          report.issues.push(
            "Not all seven championship matchups were verified."
          );

          continue;
        }

        const championRecord =
          championship.managerPlayoffRecords.find(
            manager =>
              manager.championshipWinner
          );

        if (
          !championRecord ||
          championRecord.wins !== 3 ||
          championRecord.losses !== 0 ||
          championRecord.byes !== 0
        ) {
          report.issues.push(
            "Champion does not have three verified playoff victories."
          );

          continue;
        }

        seasonChampionship =
          championship.completedSeason;

        report.championshipVerified =
          true;
      } else if (
        evidence.throughWeek >
        evidence.schedule.regularSeasonEndWeek
      ) {
        report.issues.push(
          "In-progress championship rounds require additional bracket verification."
        );

        continue;
      }

      verifiedGames.push(
        ...reconciliation.verifiedGames
      );

      if (seasonChampionship) {
        completedSeasons.push(
          seasonChampionship
        );
      }

      report.gamesVerified =
        reconciliation.verifiedGames.length;

      report.status =
        "verified";

      report.stage =
        "complete";

    } catch (error) {
      report.issues.push(
        error instanceof Error
          ? error.message
          : "Historical verification encountered an unexpected error."
      );
    }
  }

  const expectedSeasons =
    input.throughSeason -
    LEAGUE_START_YEAR + 1;

  const seasonsVerified =
    reports.filter(
      report =>
        report.status ===
        "verified"
    ).length;

  const verified =
    discovery.verified &&
    globalIssues.length === 0 &&
    seasonsVerified ===
      expectedSeasons;

  let records:
    ReturnType<
      typeof calculateAllTimeRecords
    > | null = null;

  if (verified) {
    try {
      records =
        calculateAllTimeRecords(
          verifiedGames,
          completedSeasons
        );

    } catch {
      globalIssues.push(
        "All-time record calculation failed."
      );
    }
  }

  const pipelineVerified =
    verified &&
    records !== null &&
    globalIssues.length === 0;

  return {
    verified:
      pipelineVerified,

    status:
      pipelineVerified
        ? "verified" as const
        : "needs-review" as const,

    expectedSeasons,

    seasonsVerified,

    completedChampionships:
      completedSeasons.length,

    matchupsVerified:
      verifiedGames.length,

    excludedConsolationMatchups:
      reports.reduce(
        (total, report) =>
          total +
          report.excludedConsolationMatchups,
        0
      ),

    coveragePercentage:
      Math.round(
        seasonsVerified /
        expectedSeasons * 10000
      ) / 100,

    totalDiscrepancies:
      globalIssues.length +
      reports.reduce(
        (total, report) =>
          total + report.issues.length,
        0
      ),

    reports,

    globalIssues,

    records:
      pipelineVerified
        ? records
        : null,

    readyForPublication: false,

    yahooRequests: 0,
    aiRequests: 0,
    databaseWrites: 0,
    emailsSent: 0,

    note:
      "Official regular-season and championship " +
      "matchups only. Explicit consolation games " +
      "are excluded. Live source verification " +
      "and publication authorization remain required.",
  };
}
