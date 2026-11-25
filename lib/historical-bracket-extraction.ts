
import type {
  HistoricalLeague,
} from "./historical-league-discovery";

import type {
  HistoricalSchedule,
} from "./historical-reconciliation";

import type {
  ChampionshipBracket,
  ChampionshipRound,
} from "./championship-bracket";

export function extractHistoricalBracket(
  league: HistoricalLeague,
  schedule: HistoricalSchedule
) {
  const issues: string[] = [];

  const rounds: ChampionshipRound[] = [];

  if (!league.finished) {
    issues.push(
      "Season championship is not complete."
    );
  }

  if (
    !schedule.sourceVerified ||
    schedule.season !== league.season ||
    schedule.leagueKey !== league.key ||
    schedule.throughWeek !== league.endWeek
  ) {
    issues.push(
      "Championship schedule is incomplete or unverified."
    );
  }

  const expectedRounds = [
    {
      round: "quarterfinal",
      week: schedule.regularSeasonEndWeek + 1,
      count: 4,
    },
    {
      round: "semifinal",
      week: schedule.regularSeasonEndWeek + 2,
      count: 2,
    },
    {
      round: "championship",
      week: schedule.regularSeasonEndWeek + 3,
      count: 1,
    },
  ] as const;

  let previousParticipants =
    new Set<string>();

  let playoffTeamKeys: string[] = [];

  for (const expected of expectedRounds) {
    const games = schedule.matchups.filter(
      game =>
        game.isPlayoffs &&
        game.week === expected.week
    );

    if (games.length !== expected.count) {
      issues.push(
        `Incorrect matchup count for ${expected.round}.`
      );
    }

    const participants = new Set<string>();

    for (const game of games) {
      if (
        game.teamAKey === game.teamBKey ||
        participants.has(game.teamAKey) ||
        participants.has(game.teamBKey)
      ) {
        issues.push(
          `Duplicate participant in ${expected.round}.`
        );
      }

      for (const teamKey of [
        game.teamAKey,
        game.teamBKey,
      ]) {
        if (
          !teamKey.startsWith(
            `${league.key}.t.`
          )
        ) {
          issues.push(
            "Championship team belongs to another league."
          );
        }

        if (
          expected.round !== "quarterfinal" &&
          !previousParticipants.has(teamKey)
        ) {
          issues.push(
            "Unexpected team entered a later championship round."
          );
        }

        participants.add(teamKey);
      }
    }

    if (expected.round === "quarterfinal") {
      playoffTeamKeys = [
        ...participants,
      ];
    }

    rounds.push({
      week: expected.week,

      round: expected.round,

      matchups: games.map(game => ({
        teamAKey: game.teamAKey,
        teamBKey: game.teamBKey,
      })),

      byeTeamKeys: [],
    });

    previousParticipants =
      participants;
  }

  if (playoffTeamKeys.length !== 8) {
    issues.push(
      "Expected eight championship participants."
    );
  }

  const playoffGames =
    schedule.matchups.filter(
      game => game.isPlayoffs
    );

  if (playoffGames.length !== 7) {
    issues.push(
      "Expected seven official championship matchups."
    );
  }

  if (
    schedule.regularSeasonEndWeek + 3 !==
    league.endWeek
  ) {
    issues.push(
      "Championship calendar does not match league settings."
    );
  }

  const verified =
    issues.length === 0;

  const bracket: ChampionshipBracket | null =
    verified
      ? {
          season: league.season,
          leagueKey: league.key,
          sourceVerified: true,
          playoffTeamKeys,
          rounds,
        }
      : null;

  return {
    verified,
    issues,
    bracket,
  };
}
