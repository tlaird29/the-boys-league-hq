export type TeamScore = { key: string; name: string; points: number };
export type Game = { week: number; a: TeamScore; b: TeamScore; isPlayoffs: boolean };
export type Highlight = { week: number; team: string; points: number };

export function analyzeSeason(games: Game[]) {
  const weeks = [...new Set(games.map(g => g.week))].sort((a,b)=>a-b);
  const weekly = weeks.map(week => {
    const matches = games.filter(g => g.week === week);
    const teams = matches.flatMap(g => [g.a,g.b]);
    const sorted = [...teams].sort((a,b)=>b.points-a.points);
    return { week, goat: sorted[0] ? {week,team:sorted[0].name,points:sorted[0].points}:null,
      bum: sorted.at(-1) ? {week,team:sorted.at(-1)!.name,points:sorted.at(-1)!.points}:null,
      games:matches.length };
  });
  const all = weekly.flatMap(w => [w.goat,w.bum]).filter((x):x is Highlight => x!==null);
  const highest = [...all].sort((a,b)=>b.points-a.points)[0] ?? null;
  const lowest = [...all].sort((a,b)=>a.points-b.points)[0] ?? null;
  const standings = new Map<string,{key:string;name:string;wins:number;losses:number;ties:number;pointsFor:number;pointsAgainst:number}>();
  const headToHead = new Map<string,{names:string[];games:number;wins:Record<string,number>}>();
  for (const game of games) {
    for (const [team,opp] of [[game.a,game.b],[game.b,game.a]]) {
      const record=standings.get(team.key)??{key:team.key,name:team.name,wins:0,losses:0,ties:0,pointsFor:0,pointsAgainst:0};
      record.name=team.name; record.pointsFor+=team.points;record.pointsAgainst+=opp.points;
      if(team.points>opp.points)record.wins++;else if(team.points<opp.points)record.losses++;else record.ties++;
      standings.set(team.key,record);
    }
    const pair=[game.a.key,game.b.key].sort();const id=pair.join('::');
    const rivalry=headToHead.get(id)??{names:[game.a.name,game.b.name],games:0,wins:{}};
    rivalry.games++; if(game.a.points!==game.b.points){const winner=game.a.points>game.b.points?game.a:game.b;rivalry.wins[winner.key]=(rivalry.wins[winner.key]??0)+1;}
    headToHead.set(id,rivalry);
  }
  const closest=[...games].sort((a,b)=>Math.abs(a.a.points-a.b.points)-Math.abs(b.a.points-b.b.points)).slice(0,5)
    .map(g=>({week:g.week,teams:[g.a.name,g.b.name],scores:[g.a.points,g.b.points],margin:Math.abs(g.a.points-g.b.points)}));
  const blowouts=[...games].sort((a,b)=>Math.abs(b.a.points-b.b.points)-Math.abs(a.a.points-a.b.points)).slice(0,5)
    .map(g=>({week:g.week,teams:[g.a.name,g.b.name],scores:[g.a.points,g.b.points],margin:Math.abs(g.a.points-g.b.points)}));
  return {gamesAnalyzed:games.length,weeksAnalyzed:weeks.length,weekly,highest,lowest,
    standings:[...standings.values()].sort((a,b)=>b.wins-a.wins||b.pointsFor-a.pointsFor),closest,blowouts,
    rivalries:[...headToHead.values()].sort((a,b)=>b.games-a.games).slice(0,5),
    note:'Standings shown are calculated from the matchups retrieved, including playoffs if returned. They are not Yahoo official final standings or proof of a champion.'};
}

// Yahoo's fantasy JSON uses numbered-object arrays. These helpers normalize its shape
// without treating incomplete or missing results as real scores.
export function nodes(value:unknown):Record<string,unknown>[] {
  const output:Record<string,unknown>[]=[];
  const walk=(v:unknown)=>{if(!v||typeof v!=='object')return;
    if(Array.isArray(v)){v.forEach(walk);return;}
    const obj=v as Record<string,unknown>;output.push(obj);Object.values(obj).forEach(walk);
  };walk(value);return output;
}
export function field(value:unknown,key:string):string|undefined {
  const hit=nodes(value).find(n=>typeof n[key]==='string'||typeof n[key]==='number');
  return hit?String(hit[key]):undefined;
}
export function extractLeagueKeys(payload:unknown,year:number):string[] {
  const found=new Set<string>();
  for(const obj of nodes(payload)) {
    if(typeof obj.league_key==='string') {
      const season=field(obj,'season');
      if(season===String(year))found.add(obj.league_key);
    }
  }return [...found];
}
export function extractGames(payload:unknown,week:number):Game[] {
  const results:Game[]=[];
  for(const obj of nodes(payload)) {
    if(!obj.matchup||typeof obj.matchup!=='object')continue;
    const matchup=obj.matchup;
    const teamNodes=nodes(matchup).filter(n=>n.team && typeof n.team==='object');
    const unique=new Map<string,TeamScore>();
    for(const entry of teamNodes){
      const team=entry.team;
      const key=field(team,'team_key');const name=field(team,'name');
      // Yahoo scores are nested inside team_points.total; do not use projected_points.
      const pointObject=nodes(team).find(n=>n.team_points&&typeof n.team_points==='object');
      const raw=pointObject?field(pointObject.team_points,'total'):undefined;
      const points=raw===undefined?NaN:Number(raw);
      if(key&&name&&raw!==undefined&&Number.isFinite(points))unique.set(key,{key,name,points});
    }
    const teams=[...unique.values()];
    if(teams.length===2 && !results.some(g=>[g.a.key,g.b.key].sort().join('|')===[teams[0].key,teams[1].key].sort().join('|'))) {
      results.push({week,a:teams[0],b:teams[1],isPlayoffs:field(matchup,'is_playoffs')==='1'});
    }
  }return results;
}
