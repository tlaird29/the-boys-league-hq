'use client';
import Link from 'next/link';
import {useState} from 'react';

type Result={year?:number;error?:string;leagueKeys?:string[];partial?:boolean;unavailableWeeks?:number[];analysis?:{
  gamesAnalyzed:number;weeksAnalyzed:number;highest:{week:number;team:string;points:number}|null;lowest:{week:number;team:string;points:number}|null;
  weekly:{week:number;goat:{team:string;points:number}|null;bum:{team:string;points:number}|null}[];
  closest:{week:number;teams:string[];scores:number[];margin:number}[];blowouts:{week:number;teams:string[];scores:number[];margin:number}[];
  standings:{key:string;name:string;wins:number;losses:number;ties:number;pointsFor:number}[];note:string;
}};
export default function SeasonAnalysisPage(){
 const [year,setYear]=useState('2025');const [loading,setLoading]=useState(false);const [result,setResult]=useState<Result|null>(null);
 async function analyze(){setLoading(true);setResult(null);try{const r=await fetch(`/api/season-analysis?year=${year}`,{cache:'no-store'});const data=await r.json();setResult(data);}catch{setResult({error:'Network request failed. Please retry.'});}finally{setLoading(false);}}
 const a=result?.analysis;
 return <main className="shell">
  <div className="kicker">THE BOYS • COMMISSIONER HQ</div><h1>SEASON ANALYSIS ENGINE</h1>
  <p className="muted">Pull real Yahoo matchup scores and generate the receipts for the season finale. This does not produce a video or save a published recap yet.</p>
  <section className="card" style={{marginTop:24}}><div className="label">YAHOO FANTASY • LIVE READ-ONLY ANALYSIS</div>
   <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',marginTop:16}}>
    <label htmlFor="season-year" style={{fontWeight:800}}>SEASON</label>
    <select id="season-year" value={year} onChange={e=>setYear(e.target.value)} style={{padding:12,borderRadius:8,fontSize:16}}>{Array.from({length:7},(_,i)=>2026-i).map(y=><option key={y} value={y}>{y}</option>)}</select>
    <button className="button" onClick={analyze} disabled={loading}>{loading?'ANALYZING YAHOO DATA…':'🎙️ ANALYZE SEASON'}</button>
   </div>
   {result?.error&&<p role="alert" style={{color:'#a12b2b',fontWeight:800,marginTop:16}}>{result.error}{result.leagueKeys&&<span> Matching leagues: {result.leagueKeys.join(', ')}</span>}</p>}
  </section>
  {a&&<><section className="card" style={{marginTop:22}}><div className="label">{result?.year} • VERIFIED MATCHUP ANALYSIS</div>
   <h2>THE SEASON'S RECEIPTS</h2><p className="muted">{a.gamesAnalyzed} completed matchups across {a.weeksAnalyzed} weeks analyzed.</p>
   {result?.partial&&<p style={{fontWeight:800,color:'#9b5910'}}>Partial results: missing or unavailable weeks {result.unavailableWeeks?.join(', ')}. Rankings may change when data is complete.</p>}
   <div className="grid"><div className="card span6"><div className="label">🔥 HIGHEST WEEKLY SCORE</div><h3>{a.highest?.team??'Unavailable'}</h3><p>{a.highest?`${a.highest.points.toFixed(2)} points • Week ${a.highest.week}`:'No completed scores'}</p></div>
   <div className="card span6"><div className="label">🧊 LOWEST WEEKLY SCORE</div><h3>{a.lowest?.team??'Unavailable'}</h3><p>{a.lowest?`${a.lowest.points.toFixed(2)} points • Week ${a.lowest.week}`:'No completed scores'}</p></div></div>
  </section>
  <div className="grid"><section className="card span6"><div className="label">WEEKLY AWARDS</div><h2>GOAT & BUM</h2>{a.weekly.map(w=><div key={w.week} style={{padding:'12px 0',borderBottom:'1px solid #d9e2db'}}><strong>WEEK {w.week}</strong><p style={{margin:'5px 0'}}>🏆 GOAT: {w.goat?.team} ({w.goat?.points.toFixed(2)})</p><p style={{margin:'5px 0'}}>💀 BUM: {w.bum?.team} ({w.bum?.points.toFixed(2)})</p></div>)}</section>
  <section className="card span6"><div className="label">DRAMA REPORT</div><h2>NAIL-BITERS</h2>{a.closest.map((g,i)=><p key={i}>Week {g.week}: {g.teams[0]} {g.scores[0].toFixed(2)} vs {g.teams[1]} {g.scores[1].toFixed(2)} — margin {g.margin.toFixed(2)}</p>)}<h2>BIGGEST BLOWOUTS</h2>{a.blowouts.map((g,i)=><p key={i}>Week {g.week}: {g.teams[0]} vs {g.teams[1]} — {g.margin.toFixed(2)} points</p>)}</section></div>
  <section className="card" style={{marginTop:22}}><div className="label">CALCULATED MATCHUP RECORDS</div><h2>TEAM PERFORMANCE</h2>
   <div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse'}}><thead><tr><th style={{textAlign:'left'}}>TEAM</th><th>W</th><th>L</th><th>T</th><th>POINTS</th></tr></thead><tbody>{a.standings.map(t=><tr key={t.key}><td style={{padding:'8px 0'}}>{t.name}</td><td style={{textAlign:'center'}}>{t.wins}</td><td style={{textAlign:'center'}}>{t.losses}</td><td style={{textAlign:'center'}}>{t.ties}</td><td style={{textAlign:'center'}}>{t.pointsFor.toFixed(2)}</td></tr>)}</tbody></table></div>
   <p className="muted">{a.note}</p></section></>}
  <div style={{marginTop:24}}><Link href="/commissioner" className="button">← COMMISSIONER HQ</Link></div>
 </main>;
}
