import Link from 'next/link';
import {commissioner} from '../../../lib/server-auth';
import {db} from '../../../lib/yahoo';
export const dynamic='force-dynamic';
export default async function SeasonFinalesPage(){
 const user=await commissioner();
 if(!user)return <main className="shell"><h1>COMMISSIONER SIGN IN REQUIRED</h1><Link href="/login" className="button">Sign in</Link></main>;
 const {data,error}=await db().from('season_finale_drafts').select('year,status,prepared_at,analysis,commissioner_notes').order('year',{ascending:false});
 return <main className="shell"><div className="kicker">THE BOYS • COMMISSIONER HQ</div><h1>SEASON FINALE QUEUE</h1>
 <p className="muted">After Yahoo confirms every championship-week matchup is final, the scheduled job prepares a data-only draft. Nothing is published automatically.</p>
 {error?<section className="card"><p>Draft storage is not ready. Run the included Supabase SQL migration first.</p></section>:!data?.length?<section className="card"><h2>NO DRAFTS YET</h2><p className="muted">The automation is waiting for a verified completed championship and working Yahoo API access.</p></section>:data.map(d=>{
 const a=d.analysis as {gamesAnalyzed?:number;weeksAnalyzed?:number;highest?:{team:string;points:number;week:number};lowest?:{team:string;points:number;week:number}}|null;
 return <section className="card" key={d.year} style={{marginTop:18}}><div className="label">{d.year} • {d.status?.replaceAll('_',' ').toUpperCase()}</div><h2>{d.year} SEASON RECEIPTS</h2><p className="muted">Prepared {d.prepared_at?new Date(d.prepared_at).toLocaleDateString():'—'}. {a?.gamesAnalyzed??0} matchups across {a?.weeksAnalyzed??0} weeks.</p><p>🔥 Top score: {a?.highest?`${a.highest.team} — ${a.highest.points} (Week ${a.highest.week})`:'Pending'}</p><p>💀 Low score: {a?.lowest?`${a.lowest.team} — ${a.lowest.points} (Week ${a.lowest.week})`:'Pending'}</p><p className="muted">This is an analysis draft, not a completed announcer script or video. Commissioner approval and video production are future stages.</p></section>;
 })}
 <div style={{marginTop:24}}><Link href="/commissioner" className="button">← Commissioner HQ</Link></div></main>;
}
