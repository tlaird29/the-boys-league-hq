import {
  type SeasonVideoStory,
} from "./season-video-types";

export type FictionalSeasonVideoInput = {
  fictional: true;
  season: number;
  title: string;

  champion: {
    managerName: string;
    teamName: string;
    points: number;
    opponentName: string;
    opponentPoints: number;
  };

  regularSeason: {
    leaderName: string;
    wins: number;
    losses: number;
    ties: number;
    points: number;
  };

  performance: {
    managerName: string;
    points: number;
    week: number;
  };

  blowout: {
    winnerName: string;
    loserName: string;
    winnerPoints: number;
    loserPoints: number;
    week: number;
  };

  rivalry: {
    firstName: string;
    secondName: string;
    firstWins: number;
    secondWins: number;
    ties: number;
  };

  playoffs: {
    storyline: string;
    championshipWins: number;
  };

  awards: {
    mvp: string;
    mvpManager: string;
    bum: string;
    worstScore: number;
    worstScoreManager: string;
  };
};

function points(value: number) {
  return value.toFixed(2);
}

function requireText(
  value: string,
  label: string
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `${label} is required.`
    );
  }
}

function requireNumber(
  value: number,
  label: string
) {
  if (!Number.isFinite(value)) {
    throw new Error(
      `${label} must be a finite number.`
    );
  }
}

function requireCount(
  value: number,
  label: string
) {
  if (
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new Error(
      `${label} must be a nonnegative integer.`
    );
  }
}

function requireWeek(value: number) {
  if (
    !Number.isInteger(value) ||
    value < 1 ||
    value > 18
  ) {
    throw new Error(
      "Invalid matchup week."
    );
  }
}

export function buildSeasonVideoStory(
  input: FictionalSeasonVideoInput
): SeasonVideoStory[] {
  if (input.fictional !== true) {
    throw new Error(
      "Only fictional demonstration material is enabled."
    );
  }

  if (
    !Number.isInteger(input.season) ||
    input.season < 2020
  ) {
    throw new Error(
      "Invalid demonstration season."
    );
  }

  const {
    season,
    title,
    champion,
    regularSeason,
    performance,
    blowout,
    rivalry,
    playoffs,
    awards,
  } = input;

  const requiredText = [
    title,
    champion.managerName,
    champion.teamName,
    champion.opponentName,
    regularSeason.leaderName,
    performance.managerName,
    blowout.winnerName,
    blowout.loserName,
    rivalry.firstName,
    rivalry.secondName,
    playoffs.storyline,
    awards.mvp,
    awards.mvpManager,
    awards.bum,
    awards.worstScoreManager,
  ];

  requiredText.forEach(
    (value, index) =>
      requireText(
        value,
        `Story field ${index + 1}`
      )
  );

  const scores = [
    champion.points,
    champion.opponentPoints,
    regularSeason.points,
    performance.points,
    blowout.winnerPoints,
    blowout.loserPoints,
    awards.worstScore,
  ];

  scores.forEach(
    (value, index) =>
      requireNumber(
        value,
        `Score ${index + 1}`
      )
  );

  [
    regularSeason.wins,
    regularSeason.losses,
    regularSeason.ties,
    rivalry.firstWins,
    rivalry.secondWins,
    rivalry.ties,
    playoffs.championshipWins,
  ].forEach(
    (value, index) =>
      requireCount(
        value,
        `Record value ${index + 1}`
      )
  );

  requireWeek(performance.week);
  requireWeek(blowout.week);

  if (
    champion.points <
    champion.opponentPoints
  ) {
    throw new Error(
      "Championship winner conflicts with the supplied score."
    );
  }

  if (
    blowout.winnerPoints <=
    blowout.loserPoints
  ) {
    throw new Error(
      "Blowout winner conflicts with the supplied score."
    );
  }

  if (
    playoffs.championshipWins !== 3
  ) {
    throw new Error(
      "The champion must win three championship-bracket games."
    );
  }

  if (
    awards.worstScore >
    performance.points
  ) {
    throw new Error(
      "Weekly scoring extremes conflict."
    );
  }

  const margin =
    blowout.winnerPoints -
    blowout.loserPoints;

  const regularRecord =
    `${regularSeason.wins}-` +
    `${regularSeason.losses}-` +
    `${regularSeason.ties}`;

  const rivalryRecord =
    `${rivalry.firstWins}-` +
    `${rivalry.secondWins}-` +
    `${rivalry.ties}`;

  return [
    {
      id: "opening",
      headline: title,
      narration:
        `Welcome to The Boys. ` +
        `${season} season finale. ` +
        `The trophies, the chaos, ` +
        `and the receipts. Here we go.`,
      statistics: [
        {
          label: "SEASON",
          value: String(season),
        },
        {
          label: "ESTABLISHED",
          value: "2020",
        },
      ],
    },

    {
      id: "regular-season",
      headline: "THE REGULAR SEASON",
      narration:
        `${regularSeason.leaderName} ` +
        `finished the regular season ` +
        `with a record of ` +
        `${regularSeason.wins} wins, ` +
        `${regularSeason.losses} losses ` +
        `and ${regularSeason.ties} ties. ` +
        `The scoring total reached ` +
        `${points(regularSeason.points)} points. ` +
        `But the regular season is only ` +
        `the opening act.`,
      statistics: [
        {
          label: "REGULAR-SEASON LEADER",
          value: regularSeason.leaderName,
        },
        {
          label: "RECORD",
          value: regularRecord,
        },
        {
          label: "POINTS",
          value: points(
            regularSeason.points
          ),
        },
      ],
    },

    {
      id: "performances",
      headline: "ABSOLUTE DESTRUCTION",
      narration:
        `${performance.managerName} ` +
        `dropped ${points(performance.points)} ` +
        `points in Week ${performance.week}. ` +
        `Meanwhile, ${blowout.winnerName} ` +
        `beat ${blowout.loserName} ` +
        `by ${points(margin)} points. ` +
        `Some matchups deserve a recap. ` +
        `Others deserve an apology.`,
      statistics: [
        {
          label: "WEEKLY PERFORMANCE",
          value: points(
            performance.points
          ),
          detail:
            `${performance.managerName} ` +
            `• Week ${performance.week}`,
        },
        {
          label: "BLOWOUT MARGIN",
          value: points(margin),
          detail:
            `${blowout.winnerName} ` +
            `vs. ${blowout.loserName}`,
        },
      ],
    },

    {
      id: "rivalries",
      headline: "THE RECEIPTS",
      narration:
        `${rivalry.firstName} against ` +
        `${rivalry.secondName}. ` +
        `The season series finished ` +
        `with ${rivalry.firstWins} wins ` +
        `for ${rivalry.firstName}, ` +
        `${rivalry.secondWins} for ` +
        `${rivalry.secondName}, ` +
        `and ${rivalry.ties} ties. ` +
        `Save the receipts.`,
      statistics: [
        {
          label: rivalry.firstName,
          value: String(
            rivalry.firstWins
          ),
        },
        {
          label: rivalry.secondName,
          value: String(
            rivalry.secondWins
          ),
        },
        {
          label: "SEASON SERIES",
          value: rivalryRecord,
        },
      ],
    },

    {
      id: "playoffs",
      headline: "WIN OR GO HOME",
      narration:
        `Eight teams. Three rounds. ` +
        `One championship. ` +
        `${playoffs.storyline} ` +
        `When the bracket was finished, ` +
        `only one team remained.`,
      statistics: [
        {
          label: "PLAYOFF TEAMS",
          value: "8",
        },
        {
          label: "CHAMPIONSHIP ROUNDS",
          value: "3",
        },
        {
          label: "CHAMPION'S PLAYOFF WINS",
          value: String(
            playoffs.championshipWins
          ),
        },
      ],
    },

    {
      id: "championship",
      headline: "RAISE THE BANNER",
      narration:
        `${champion.managerName} ` +
        `and ${champion.teamName} ` +
        `finished the job. ` +
        `${points(champion.points)} ` +
        `to ${points(champion.opponentPoints)} ` +
        `against ${champion.opponentName}. ` +
        `The ${season} championship ` +
        `belongs to them. Raise the banner.`,
      statistics: [
        {
          label: "CHAMPION",
          value: champion.teamName,
          detail: champion.managerName,
        },
        {
          label: "FINAL SCORE",
          value:
            `${points(champion.points)} – ` +
            points(champion.opponentPoints),
        },
      ],
    },

    {
      id: "awards",
      headline: "LEGENDS AND DISASTERS",
      narration:
        `League MVP goes to ` +
        `${awards.mvp}, managed by ` +
        `${awards.mvpManager}. ` +
        `BUM of the Year goes to ` +
        `${awards.bum}. ` +
        `And ${awards.worstScoreManager} ` +
        `posted ${points(awards.worstScore)} ` +
        `points. The Hall of Shame ` +
        `has another exhibit.`,
      statistics: [
        {
          label: "LEAGUE MVP",
          value: awards.mvp,
          detail: awards.mvpManager,
        },
        {
          label: "BUM OF THE YEAR",
          value: awards.bum,
        },
        {
          label: "WORST WEEKLY SCORE",
          value: points(
            awards.worstScore
          ),
          detail:
            awards.worstScoreManager,
        },
      ],
    },

    {
      id: "closing",
      headline: "ICE TF UP!",
      narration:
        `That's a wrap on ${season}. ` +
        `See you next season, boys. ` +
        `ICE TF UP!`,
      statistics: [
        {
          label: "THE BOYS",
          value: "EST. 2020",
        },
      ],
    },
  ];
}