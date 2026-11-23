import Link from "next/link";
import SeasonRecapPlayer from "../season-recap-player";
import {awardCategories,seasonRecaps,shameCategories} from "../season-recaps";

export default function AwardsPage() {
  return (
    <main className="shell">
      <div className="kicker">THE BOYS • EST. 2020 • ANNUAL SEASON FINALES</div>
      <h1>THE BOYS: YEAR IN REVIEW</h1>
      <p className="muted" style={{maxWidth:760,lineHeight:1.7}}>Every season has its own story. Two-minute, sports-radio-style finales, championship celebrations, unforgettable highlights and a permanent Hall of Shame. Actual results and video premieres will be published when verified.</p>
      <section style={{background:"#f4f0e4",color:"#211f19",padding:"clamp(18px,4vw,30px)",border:"1px solid #c6beac",borderRadius:12,marginTop:24}}>
        <div style={{fontSize:12,letterSpacing:2,fontWeight:900}}>THE OFFICIAL SEASON FINALE COLLECTION</div>
        <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(28px,5vw,48px)",margin:"12px 0"}}>SEVEN SEASONS. SEVEN STORIES.</h2>
        <p style={{fontFamily:"Georgia,serif",lineHeight:1.75}}>No recycled scripts. Each finale will draw from that year's real upsets, rivalries, champions, bad decisions and league lore. The same finished video will appear here and in its individual season archive.</p>
      </section>
      {seasonRecaps.map(recap=><section key={recap.year} id={`season-${recap.year}`}>
        <SeasonRecapPlayer recap={recap}/>
      </section>)}
      <div className="grid" style={{marginTop:26}}>
        <section className="card span6">
          <div className="label">THE ANNUAL HONORS</div>
          <h2>🏆 THE AWARDS</h2>
          {awardCategories.map(item=><div key={item.name} style={{borderTop:"1px solid #d9e2db",padding:"14px 0"}}><strong>{item.icon} {item.name}</strong><p className="muted" style={{margin:"5px 0"}}>{item.description}</p><span className="pill">WINNER PENDING</span></div>)}
        </section>
        <section className="card span6">
          <div className="label">THE PERMANENT RECEIPTS</div>
          <h2>💀 HALL OF SHAME</h2>
          {shameCategories.map(item=><div key={item.name} style={{borderTop:"1px solid #d9e2db",padding:"14px 0"}}><strong>{item.icon} {item.name}</strong><p className="muted" style={{margin:"5px 0"}}>{item.description}</p><span className="pill">RECIPIENT PENDING</span></div>)}
        </section>
      </div>
      <p className="muted" style={{marginTop:20}}>Awards and shame entries above are category previews, not invented historical results. Year-specific recipients will be added as verified records and commissioner selections become available.</p>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:24}}><Link href="/seasons" className="button">Browse Season Archives</Link><Link href="/" className="button">Back to Dashboard</Link></div>
    </main>
  );
}
