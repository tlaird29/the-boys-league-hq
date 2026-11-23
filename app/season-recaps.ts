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

// Story themes are editorial starting points, NOT claims about historical results.
// Set each title, tagline, theme and story after reviewing the actual season.
// Video URLs should point to your own licensed, finished MP4 files in /public/recaps/.
export const seasonRecaps: SeasonRecap[] = [
  {year:2026,title:"THE NEXT CHAPTER",tagline:"The final word has not been written.",theme:"The Unwritten Season",videoUrl:null,downloadUrl:null,champion:null,story:null},
  {year:2025,title:"THE 2025 FILES",tagline:"Every season leaves receipts.",theme:"Season identity awaiting review",videoUrl:null,downloadUrl:null,champion:null,story:null},
  {year:2024,title:"THE 2024 FILES",tagline:"The tape tells the story.",theme:"Season identity awaiting review",videoUrl:null,downloadUrl:null,champion:null,story:null},
  {year:2023,title:"THE 2023 FILES",tagline:"A year worth revisiting.",theme:"Season identity awaiting review",videoUrl:null,downloadUrl:null,champion:null,story:null},
  {year:2022,title:"THE 2022 FILES",tagline:"History never forgets.",theme:"Season identity awaiting review",videoUrl:null,downloadUrl:null,champion:null,story:null},
  {year:2021,title:"THE 2021 FILES",tagline:"The second chapter.",theme:"Season identity awaiting review",videoUrl:null,downloadUrl:null,champion:null,story:null},
  {year:2020,title:"WHERE IT ALL BEGAN",tagline:"The inaugural season of The Boys.",theme:"The Beginning",videoUrl:null,downloadUrl:null,champion:null,story:null},
];

export const awardCategories = [
  {icon:"🏆",name:"League Champion",description:"The manager who finished the job."},
  {icon:"👑",name:"Manager of the Year",description:"The season's defining manager."},
  {icon:"⭐",name:"League MVP",description:"The most impactful fantasy performer."},
  {icon:"🔥",name:"Highest Scoring Team",description:"Most actual points across the season."},
  {icon:"💎",name:"Draft Steal",description:"The pick that returned outrageous value."},
  {icon:"🤝",name:"Trade of the Year",description:"The deal that changed the season."},
  {icon:"⚡",name:"Performance of the Year",description:"The week's most explosive score."},
];
export const shameCategories = [
  {icon:"💀",name:"BUM of the Year",description:"A season-long masterclass in disappointment."},
  {icon:"📉",name:"The Collapse",description:"A contender's spectacular downfall."},
  {icon:"🤡",name:"Draft Disaster",description:"The selection nobody wants to remember."},
  {icon:"🚨",name:"Trade Robbery",description:"The deal that deserves an investigation."},
  {icon:"🧊",name:"Worst Weekly Score",description:"The season's lowest verified weekly total."},
  {icon:"🥀",name:"Last Place Finisher",description:"The bottom of the final standings."},
];
