
import {
  FantasyTeam,
  Player,
  Position,
  WeekData,
} from "./matchup-analysis";

function player(
  id: string,
  name: string,
  position: Position,
  slot: string,
  points: number,
  projected: number | null,
  starter = true
): Player {
  return {
    id,
    name,
    position,
    slot,
    points,
    projected,
    starter,
  };
}

function team(
  id: string,
  manager: string,
  players: Player[]
): FantasyTeam {
  return {
    id,
    manager,
    name: `${manager}'s Test Team`,
    players,
  };
}

export const testWeekData: WeekData = {
  season: 2026,
  week: 12,
  source: "test",
  scoringFinal: true,
  matchups: [
    {
      id: "test-1",
      home: team("cade", "Cade", [
        player("c1", "Josh Allen", "QB", "QB", 34.6, 23),
        player("c2", "CeeDee Lamb", "WR", "WR", 28.4, 17),
        player("c3", "Test RB A", "RB", "RB", 19, 15),
        player("c4", "Test RB B", "RB", "RB", 15, 14),
        player("c5", "Test WR A", "WR", "WR", 17, 14),
        player("c6", "Test TE A", "TE", "TE", 12, 10),
        player("c7", "Test Flex A", "WR", "FLEX", 8, 11),
        player("c8", "Test K A", "K", "K", 5, 8),
        player("c9", "Test DEF A", "DEF", "DEF", 7, 8),
      ]),
      away: team("caleb", "Caleb", [
        player("b1", "Test QB B", "QB", "QB", 20, 22),
        player("b2", "Test RB C", "RB", "RB", 4.2, 16),
        player("b3", "Test RB D", "RB", "RB", 13, 13),
        player("b4", "Test WR B", "WR", "WR", 18, 16),
        player("b5", "Test WR C", "WR", "WR", 16, 15),
        player("b6", "Test TE B", "TE", "TE", 9, 10),
        player("b7", "Test Flex B", "RB", "FLEX", 12, 12),
        player("b8", "Test K B", "K", "K", 8, 8),
        player("b9", "Test DEF B", "DEF", "DEF", 6, 8),
        player("b10", "Test Bench RB", "RB", "BN", 24, 10, false),
      ]),
    },
    {
      id: "test-2",
      home: team("tyler", "Tyler", [
        player("t1", "Test QB T", "QB", "QB", 29, 22),
        player("t2", "Test RB T", "RB", "RB", 20, 15),
        player("t3", "Test WR T", "WR", "WR", 23, 17),
      ]),
      away: team("hunterc", "Hunter C.", [
        player("h1", "Test QB H", "QB", "QB", 26, 24),
        player("h2", "Test RB H", "RB", "RB", 18, 17),
        player("h3", "Test WR H", "WR", "WR", 25, 18),
      ]),
    },
    {
      id: "test-3",
      home: team("lane", "Lane", [
        player("l1", "Test QB L", "QB", "QB", 25, 22),
        player("l2", "Test RB L", "RB", "RB", 17, 16),
        player("l3", "Test WR L", "WR", "WR", 22, 18),
      ]),
      away: team("cody", "Cody", [
        player("d1", "Test QB D", "QB", "QB", 23, 22),
        player("d2", "Test RB D", "RB", "RB", 19, 16),
        player("d3", "Test WR D", "WR", "WR", 21.5, 18),
      ]),
    },
    {
      id: "test-4",
      home: team("kyler", "Kyler", [
        player("k1", "Test QB K", "QB", "QB", 42, 22),
        player("k2", "Test RB K", "RB", "RB", 37, 17),
        player("k3", "Test WR K", "WR", "WR", 35, 18),
      ]),
      away: team("braden", "Braden", [
        player("r1", "Test QB R", "QB", "QB", 13, 21),
        player("r2", "Test RB R", "RB", "RB", 10, 16),
        player("r3", "Test WR R", "WR", "WR", 12, 17),
      ]),
    },
    {
      id: "test-5",
      home: team("hunterk", "Hunter K.", [
        player("hk1", "Test QB HK", "QB", "QB", 27, 22),
        player("hk2", "Test RB HK", "RB", "RB", 22, 17),
        player("hk3", "Test WR HK", "WR", "WR", 26, 18),
      ]),
      away: team("tylerg", "Tyler G.", [
        player("tg1", "Test QB TG", "QB", "QB", 25, 23),
        player("tg2", "Test RB TG", "RB", "RB", 23, 18),
        player("tg3", "Test WR TG", "WR", "WR", 24, 19),
      ]),
    },
  ],
};
