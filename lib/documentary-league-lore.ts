import {
  findManagerById,
} from "./league-managers";

export type LeagueLoreEntry = {
  id: string;
  managerIds: readonly string[];
  context: string;
  editorialDirection: string;
};

export const LEAGUE_LORE:
  readonly LeagueLoreEntry[] = [
  {
    id: "burnham-brothers",
    managerIds: [
      "cade-burnham",
      "caleb-burnham",
    ],
    context:
      "Cade and Caleb are brothers.",
    editorialDirection:
      "Use sibling rivalry when their actual results intersect. Do not invent family conversations.",
  },
  {
    id: "roommate-rivalry",
    managerIds: [
      "lane-lehman",
      "cody-carpenter",
      "caleb-burnham",
    ],
    context:
      "Lane, Cody and Caleb are roommates.",
    editorialDirection:
      "Use roommate rivalry when relevant. Do not assume this living arrangement existed in every historical season.",
  },
  {
    id: "cousin-rivalry",
    managerIds: [
      "tyler-laird",
      "hunter-crownover",
    ],
    context:
      "Tyler Laird and Hunter Crownover are cousins.",
    editorialDirection:
      "Use family bragging rights when their actual matchup history supports it.",
  },
  {
    id: "commissioner",
    managerIds: [
      "tyler-laird",
    ],
    context:
      "Tyler Laird is the league commissioner.",
    editorialDirection:
      "Commissioner jokes are encouraged, but never invent rule violations or misconduct.",
  },
  {
    id: "braden-trades",
    managerIds: [
      "braden-riley",
    ],
    context:
      "Braden has a reputation among the group for questionable trade offers and flaking on plans.",
    editorialDirection:
      "Use fresh jokes when appropriate. Do not invent specific trades or missed events.",
  },
  {
    id: "kyler-personality",
    managerIds: [
      "kyler-landa",
    ],
    context:
      "Kyler is known as the group's goofball.",
    editorialDirection:
      "Use playful humor without inventing actions or conversations.",
  },
  {
    id: "tgay-family",
    managerIds: [
      "tyler-gay",
    ],
    context:
      "Tyler Gay is a husband and father.",
    editorialDirection:
      "Family-man jokes may be used sparingly when appropriate to the season. Do not assume current family circumstances applied historically.",
  },
];

export function getDocumentaryManagerName(
  managerId: string
) {
  return (
    findManagerById(managerId)?.displayName ??
    managerId
  );
}

export function getRelevantLeagueLore(
  featuredManagerIds: readonly string[],
  approvedLoreIds: readonly string[] = []
) {
  const featured =
    new Set(featuredManagerIds);

  const approved =
    new Set(approvedLoreIds);

  return LEAGUE_LORE.filter(
    entry =>
      approved.has(entry.id) &&
      entry.managerIds.every(
        managerId =>
          featured.has(managerId)
      )
  );
}

export function getMatchupRelationship(
  firstManagerId: string,
  secondManagerId: string
): LeagueLoreEntry | null {
  if (
    firstManagerId === secondManagerId
  ) {
    return null;
  }

  return (
    LEAGUE_LORE.find(
      entry =>
        entry.managerIds.length >= 2 &&
        entry.managerIds.includes(
          firstManagerId
        ) &&
        entry.managerIds.includes(
          secondManagerId
        )
    ) ?? null
  );
}

export const DOCUMENTARY_HUMOR_RULES = [
  "Roast fantasy football performances and decisions.",
  "Use original jokes and creative comparisons.",
  "Avoid recycling previous documentary punchlines.",
  "Do not invent quotes, conversations or personal reactions.",
  "Do not use race or other sensitive personal characteristics as punchlines.",
  "Use personal relationships only when approved for the relevant season.",
  "Balance trash talk with recognition of genuine accomplishments.",
  "Keep the tone appropriate for a private friend-group sports documentary.",
] as const;