
export type SeasonRecap = {
  year: number;
  title: string;
  tagline: string;
  theme: string;
  videoUrl: string | null;
  downloadUrl: string | null;
  champion: string | null;
  story: string | null;
};

export const FIRST_SEASON = 2020;

export function getCurrentArchiveSeason(
  date = new Date()
): number {
  const parts = new Intl.DateTimeFormat(
    "en-US",
    {
      timeZone: "America/Boise",
      year: "numeric",
      month: "numeric",
    }
  ).formatToParts(date);

  const year = Number(
    parts.find(
      part => part.type === "year"
    )?.value
  );

  const month = Number(
    parts.find(
      part => part.type === "month"
    )?.value
  );

  return Math.max(
    FIRST_SEASON,
    month >= 9 ? year : year - 1
  );
}

const seasonOverrides:
  Record<number, Partial<SeasonRecap>> = {
    2020: {
      title: "WHERE IT ALL BEGAN",
      tagline:
        "The inaugural season of The Boys.",
      theme: "The Beginning",
    },

    2021: {
      tagline: "The second chapter.",
    },

    2022: {
      tagline: "History never forgets.",
    },

    2023: {
      tagline: "A year worth revisiting.",
    },

    2024: {
      tagline: "The tape tells the story.",
    },

    2025: {
      tagline: "Every season leaves receipts.",
    },

    2026: {
      title: "THE NEXT CHAPTER",
      tagline:
        "Every chapter leaves its mark.",
      theme: "The Next Chapter",
    },
  };

export function getSeasonRecaps(
  date = new Date()
): SeasonRecap[] {
  const latestSeason =
    getCurrentArchiveSeason(date);

  const recaps: SeasonRecap[] = [];

  for (
    let year = latestSeason;
    year >= FIRST_SEASON;
    year--
  ) {
    const isLatest =
      year === latestSeason;

    recaps.push({
      title: `THE ${year} FILES`,

      tagline: isLatest
        ? "Another chapter in league history."
        : "Every season leaves receipts.",

      theme:
        "Season identity awaiting review",

      videoUrl: null,
      downloadUrl: null,
      champion: null,
      story: null,

      ...seasonOverrides[year],

      year,
    });
  }

  return recaps;
}

// Compatibility with existing pages.
// Dynamic pages should call getSeasonRecaps()
// directly for the latest archive range.

export const seasonRecaps =
  getSeasonRecaps();

export const awardCategories = [
  {
    icon: "🏆",
    name: "League Champion",
    description:
      "The manager who finished the job.",
  },
  {
    icon: "👑",
    name: "Manager of the Year",
    description:
      "The season's defining manager.",
  },
  {
    icon: "⭐",
    name: "League MVP",
    description:
      "The most impactful fantasy performer.",
  },
  {
    icon: "🔥",
    name: "Highest Scoring Team",
    description:
      "Most actual points across the season.",
  },
  {
    icon: "💎",
    name: "Draft Steal",
    description:
      "The pick that returned outrageous value.",
  },
  {
    icon: "🤝",
    name: "Trade of the Year",
    description:
      "The deal that changed the season.",
  },
  {
    icon: "⚡",
    name: "Performance of the Year",
    description:
      "The week's most explosive score.",
  },
];

export const shameCategories = [
  {
    icon: "💀",
    name: "BUM of the Year",
    description:
      "A season-long masterclass in disappointment.",
  },
  {
    icon: "📉",
    name: "The Collapse",
    description:
      "A contender's spectacular downfall.",
  },
  {
    icon: "🤡",
    name: "Draft Disaster",
    description:
      "The selection nobody wants to remember.",
  },
  {
    icon: "🚨",
    name: "Trade Robbery",
    description:
      "The deal that deserves an investigation.",
  },
  {
    icon: "🧊",
    name: "Worst Weekly Score",
    description:
      "The season's lowest verified weekly total.",
  },
  {
    icon: "🥀",
    name: "Last Place Finisher",
    description:
      "The bottom of the final standings.",
  },
];
