import {db,yahooAccessToken} from './yahoo';
import {analyzeSeason,extractGames,extractLeagueKeys,Game,nodes,field} from './season-analysis';

const base='https://fantasysports.yahooapis.com/fantasy/v2/';
async function yahoo(path:string,token:string){
 const r=await fetch(base+path+(path.includes('?')?'&':'?')+'format=json',{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(12000)});
 if(!r.ok)throw new Error(`Yahoo HTTP ${r.status}`);
 return r.json();
}
function leagueMeta(data:unknown){
 const league=nodes(data).find(n=>typeof n.league_key==='string'&&typeof n.end_week!=='undefined');
 if(!league)throw new Error('League metadata unavailable');
 const endWeek=Number(field(league,'end_week'));
 const endDate=field(league,'end_date');
 if(!Number.isInteger(endWeek)||endWeek<1||endWeek>20||!endDate||!/^\d{4}-\d{2}-\d{2}$/.test(endDate))throw new Error('Yahoo championship week/end date unavailable');
 return {endWeek,endDate};
}
// Yahoo's date-only end_date has no kickoff/final-score time. Wait until two
// calendar days after that date in UTC; then require completed matchup flags.
export async function prepareSeasonFinale(userId:string,year:number){
 const database=db();
 const {data:existing,error:existingError}=await database.from('season_finale_drafts').select('status').eq('year',year).maybeSingle();
 if(existingError)throw existingError;
 if(existing)return {year,status:existing.status,action:'already_prepared'};
 const token=await yahooAccessToken(userId);
 const leagues=await yahoo('users;use_login=1/games;game_codes=nfl/leagues',token);
 const keys=extractLeagueKeys(leagues,year);
 if(keys.length!==1)return {year,action:'waiting',reason:keys.length===0?'No matching Yahoo league':'Multiple matching leagues; manual selection needed'};
 const leagueKey=keys[0];
 const info=await yahoo(`league/${encodeURIComponent(leagueKey)}`,token);
 const {endWeek,endDate}=leagueMeta(info);
 const safeAfter=Date.parse(endDate+'T00:00:00Z')+72*60*60*1000;
 if(Date.now()<safeAfter)return {year,action:'waiting',reason:'Championship end date plus safety delay not reached'};
 const games:Game[]=[];
 for(let start=1;start<=endWeek;start+=4){
  const weeks=Array.from({length:Math.min(4,endWeek-start+1)},(_,i)=>start+i);
  const batch=await Promise.all(weeks.map(async week=>{
   const data=await yahoo(`league/${encodeURIComponent(leagueKey)}/scoreboard;week=${week}`,token);
   const extracted=extractGames(data,week);
   // Require Yahoo to explicitly mark every matchup completed, rather than
   // assuming a score or calendar date means final.
   const matchups=nodes(data).filter(n=>n.matchup&&typeof n.matchup==='object');
   const unique=new Map<string,unknown>();
   for(const item of matchups){const m=item.matchup;const id=field(m,'matchup_id')||field(m,'week')+':'+field(m,'winner_team_key');if(id)unique.set(id,m);}
   const allComplete=unique.size>0&&[...unique.values()].every(m=>field(m,'status')==='postevent'||field(m,'is_completed')==='1');
   return {week,extracted,allComplete};
  }));
  for(const w of batch){if(!w.extracted.length||!w.allComplete)return {year,action:'waiting',reason:`Week ${w.week} is incomplete or Yahoo did not confirm final matchup status`};games.push(...w.extracted);}
 }
 const analysis=analyzeSeason(games);
 const {error}=await database.from('season_finale_drafts').insert({year,league_key:leagueKey,status:'pending_review',analysis,prepared_at:new Date().toISOString(),commissioner_notes:''});
 if(error){if(error.code==='23505')return {year,action:'already_prepared'};throw error;}
 return {year,action:'draft_created',status:'pending_review'};
}
