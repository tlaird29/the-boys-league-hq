import { NextRequest,NextResponse } from 'next/server';
import { commissioner } from '../../../lib/server-auth';
import { yahooAccessToken } from '../../../lib/yahoo';
import { analyzeSeason,extractGames,extractLeagueKeys,Game } from '../../../lib/season-analysis';

export const dynamic='force-dynamic';
export const maxDuration=60;

async function yahooJson(path:string,token:string) {
  const response=await fetch(`https://fantasysports.yahooapis.com/fantasy/v2/${path}${path.includes('?')?'&':'?'}format=json`,{
    headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(12000)});
  if(!response.ok)throw new Error(`Yahoo returned HTTP ${response.status}. ${response.status===403?'Developer API approval or permissions may still be pending.':''}`);
  return response.json();
}
export async function GET(request:NextRequest) {
  const user=await commissioner();
  if(!user)return NextResponse.json({error:'Commissioner sign-in required.'},{status:403});
  const year=Number(request.nextUrl.searchParams.get('year'));
  if(!Number.isInteger(year)||year<2020||year>new Date().getFullYear())return NextResponse.json({error:'Select a valid season year.'},{status:400});
  try {
    const token=await yahooAccessToken(user.id);
    const leagues=await yahooJson('users;use_login=1/games;game_codes=nfl/leagues',token);
    const keys=extractLeagueKeys(leagues,year);
    if(keys.length===0)return NextResponse.json({error:`No accessible Yahoo NFL league found for ${year}. Check the Yahoo account and historical league access.`,year},{status:404});
    if(keys.length>1)return NextResponse.json({error:`Multiple leagues found for ${year}; cannot safely choose The Boys automatically.`,leagueKeys:keys,year},{status:409});
    const leagueKey=keys[0];
    const leagueInfo=await yahooJson(`league/${encodeURIComponent(leagueKey)}`,token);
    const endWeek=Math.min(20,Math.max(1,Number((function lookup(x:unknown):string|undefined{if(!x||typeof x!=='object')return; if(Array.isArray(x)){for(const v of x){const s=lookup(v);if(s)return s;}return;}const o=x as Record<string,unknown>;if(o.end_week!==undefined)return String(o.end_week);for(const v of Object.values(o)){const s=lookup(v);if(s)return s;}})(leagueInfo))||18));
    const games:Game[]=[];const unavailableWeeks:number[]=[];
    // Small batches avoid overwhelming Yahoo and stay inside serverless time limits.
    for(let start=1;start<=endWeek;start+=4){
      const batch=await Promise.all(Array.from({length:Math.min(4,endWeek-start+1)},(_,i)=>start+i).map(async week=>{
        try {const data=await yahooJson(`league/${encodeURIComponent(leagueKey)}/scoreboard;week=${week}`,token);return {week,games:extractGames(data,week)};}
        catch{return {week,games:[] as Game[]};}
      }));
      for(const result of batch){if(!result.games.length)unavailableWeeks.push(result.week);games.push(...result.games);}
    }
    if(!games.length)return NextResponse.json({error:'Yahoo responded, but no completed matchup scores could be extracted. No results were invented.',year,leagueKey,unavailableWeeks},{status:422});
    return NextResponse.json({year,leagueKey,analysis:analyzeSeason(games),unavailableWeeks,partial:unavailableWeeks.length>0,generatedAt:new Date().toISOString()}, {headers:{'Cache-Control':'private, no-store'}});
  }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unable to retrieve Yahoo season data.'},{status:502});}
}
