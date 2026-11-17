
export type Manager = {
  slug: string;
  name: string;
  status: "active" | "former";
};

export const managers: Manager[] = [
  { slug: "tyler-laird", name: "Tyler Laird", status: "active" },
  { slug: "caleb-burnham", name: "Caleb Burnham", status: "active" },
  { slug: "lane-lehman", name: "Lane Lehman", status: "active" },
  { slug: "braden-riley", name: "Braden Riley", status: "active" },
  { slug: "tyler-gay", name: "Tyler Gay", status: "active" },
  { slug: "hunter-crownover", name: "Hunter Crownover", status: "active" },
  { slug: "hunter-kovick", name: "Hunter Kovick", status: "active" },
  { slug: "kyler-landa", name: "Kyler Landa", status: "active" },
  { slug: "cade-burnham", name: "Cade Burnham", status: "active" },
  { slug: "cody-carpenter", name: "Cody Carpenter", status: "active" },
  { slug: "brad-mccain", name: "Brad McCain", status: "former" },
  { slug: "john-villareal", name: "John Villareal", status: "former" },
  { slug: "dillon-lowder", name: "Dillon Lowder", status: "former" },
];

export const activeManagers = managers.filter(
  (manager) => manager.status === "active"
);
