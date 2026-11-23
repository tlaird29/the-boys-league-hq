import Link from "next/link";
import {notFound} from "next/navigation";
import SeasonRecapPlayer from "../../season-recap-player";
import {awardCategories,seasonRecaps,shameCategories} from "../../season-recaps";

export function generateStaticParams() {return seasonRecaps.map(s=>({year:String(s.year)}));}
export default async function SeasonYearPage({params}:{params:Promise<{year:string}>}) {
  const {year}=await params;
  const recap=seasonRecaps.find(s=>String(s.year)===year);
  if(!recap) notFound();
  return <main className="shell">
    <div className="kicker">THE BOYS • SEASON ARCHIVES • EST. 2020</div>
    <h1>{recap.year} SEASON ARCHIVE</h1>
    <p className="muted" style={{fontSize:18}}>{recap.tagline}</p>
    <SeasonRecapPlayer recap={recap}/>
    <div className="grid">
      <section className="card span6"><div className="label">THE SEASON'S STORY</div><h2>🎙️ THE YEAR THAT WAS</h2><p className="muted">{recap.story??"The original season storyline, key rivalries, turning points and commissioner-approved inside jokes will appear here after historical review."}</p><p className="muted">Editorial direction: {recap.theme}. Not a verified account of the season.</p></section>
      <section className="card span6"><div className="label">THE FINAL WORD</div><h2>🏆 THE CHAMPION</h2><p style={{fontSize:24,fontWeight:900}}>{recap.champion??"CHAMPION PENDING VERIFICATION"}</p><p className="muted">Championship matchup, playoff path and final score will appear when confirmed.</p></section>
      <section className="card span6"><div className="label">THE OFFICIAL RECORD</div><h2>📊 FINAL STANDINGS</h2><p className="muted">Historical standings and season-long points are awaiting Yahoo import. No fabricated records.</p></section>
      <section className="card span6"><div className="label">THE ROAD TO THE TITLE</div><h2>🏈 PLAYOFF BRACKET</h2><p className="muted">Verified playoff seeds, scores and championship results will appear here after import.</p></section>
      <section className="card span6"><div className="label">SEASON HONORS</div><h2>🏆 THE AWARDS</h2>{awardCategories.map(a=><div key={a.name} style={{padding:"10px 0",borderTop:"1px solid #d9e2db"}}><strong>{a.icon} {a.name}</strong><p className="muted" style={{margin:"4px 0"}}>Winner pending</p></div>)}</section>
      <section className="card span6"><div className="label">THE RECEIPTS</div><h2>💀 HALL OF SHAME</h2>{shameCategories.map(a=><div key={a.name} style={{padding:"10px 0",borderTop:"1px solid #d9e2db"}}><strong>{a.icon} {a.name}</strong><p className="muted" style={{margin:"4px 0"}}>Recipient pending</p></div>)}</section>
    </div>
    <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:26}}><Link href="/seasons" className="button">All Season Archives</Link><Link href="/awards" className="button">Annual Season Finales</Link><Link href="/" className="button">League HQ</Link></div>
  </main>;
}
