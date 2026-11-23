import Link from "next/link";
import {seasonRecaps} from "../season-recaps";

export default function SeasonsPage() {
  return (
    <main className="shell">
      <div className="kicker">THE BOYS • FANTASY FOOTBALL • EST. 2020</div>
      <h1>SEASON ARCHIVES</h1>
      <p className="muted" style={{maxWidth:740,lineHeight:1.7}}>Every season gets its own permanent archive, championship record, awards, Hall of Shame and original two-minute season-finale video.</p>
      <section style={{background:"#14251f",color:"white",borderRadius:16,padding:26,marginTop:25}}>
        <div style={{color:"#48d6a8",fontSize:12,fontWeight:800,letterSpacing:2}}>THE BOYS • HISTORICAL ARCHIVE</div>
        <h2 style={{fontSize:44,marginTop:12}}>SEVEN SEASONS.<br/>ONE LEGACY.</h2>
        <p style={{color:"#c5d4cd",lineHeight:1.7,maxWidth:680}}>From the inaugural 2020 season through 2026, the entire league story lives here. Each year's finale will be produced around its actual story, not a generic template.</p>
        <Link href="/awards" className="button">Watch the Annual Finales</Link>
      </section>
      <div style={{marginTop:35}}><div className="label">CHOOSE YOUR SEASON</div><h2 style={{marginTop:8}}>THE HISTORY BOOKS</h2></div>
      <div className="grid">
        {seasonRecaps.map(recap=><section className="card span4" key={recap.year} style={{display:"flex",flexDirection:"column",gap:12}}>
          <div className="row"><div className="label">LEAGUE HISTORY</div><span className="pill">{recap.videoUrl?"VIDEO AVAILABLE":"RECAP PENDING"}</span></div>
          <div style={{fontFamily:"'Barlow Condensed',Impact,sans-serif",fontSize:66,fontWeight:900,color:"#14251f",lineHeight:1}}>{recap.year}</div>
          <h3>{recap.title}</h3>
          <p className="muted" style={{flexGrow:1}}>{recap.tagline} Explore the season recap, final standings, playoffs, awards and lasting league history.</p>
          <Link href={`/seasons/${recap.year}`} className="button" style={{display:"block",textAlign:"center"}}>VIEW {recap.year} ARCHIVE</Link>
        </section>)}
      </div>
      <section className="card" style={{marginTop:22}}><div className="label">THE OFFICIAL RECORD</div><h2>BUILT FOR THE LONG HAUL</h2><p className="muted">Original team names, former managers, verified standings, playoff results and champions will remain preserved. Historical Yahoo data import and finished recap videos are pending.</p></section>
      <div style={{marginTop:28}}><Link href="/" className="button">🏠 Home / League HQ</Link></div>
    </main>
  );
}
