import Link from "next/link";
import type { SeasonRecap } from "./season-recaps";

export default function SeasonRecapPlayer({recap}:{recap:SeasonRecap}) {
  return (
    <section style={{background:"#14251f",color:"#f4f0e4",padding:"clamp(18px,4vw,34px)",border:"1px solid #c9a64b",borderRadius:12,margin:"22px 0"}}>
      <div style={{fontSize:11,fontWeight:900,letterSpacing:2,color:"#48d6a8"}}>THE BOYS ORIGINAL • {recap.year} SEASON FINALE</div>
      <h2 style={{fontFamily:"Georgia,serif",fontSize:"clamp(28px,5vw,50px)",lineHeight:1.05,margin:"12px 0"}}>{recap.title}</h2>
      <p style={{fontFamily:"Georgia,serif",fontStyle:"italic",color:"#d9d0b7"}}>{recap.tagline}</p>
      <div style={{aspectRatio:"16 / 9",background:"radial-gradient(ellipse at center,#2d5445,#091711)",border:"1px solid #647e6b",display:"grid",placeItems:"center",textAlign:"center",padding:20,borderRadius:8,overflow:"hidden"}}>
        {recap.videoUrl ? (
          <video controls playsInline preload="metadata" poster={undefined} src={recap.videoUrl} style={{width:"100%",height:"100%",objectFit:"contain"}} aria-label={`${recap.year} season recap video`} />
        ) : (
          <div>
            <div style={{fontSize:45,marginBottom:12}}>🎙️ 🏈</div>
            <div style={{fontSize:"clamp(18px,3vw,28px)",fontWeight:900,letterSpacing:1}}>SEASON RECAP IN PRODUCTION</div>
            <p style={{fontSize:13,color:"#c8d6ce",maxWidth:430,margin:"12px auto 0",lineHeight:1.6}}>Approximately two minutes • Original high-energy sports commentary • A storyline unique to this season</p>
          </div>
        )}
      </div>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"center",marginTop:16}}>
        {recap.downloadUrl ? <a className="button" href={recap.downloadUrl} download>⬇ Download recap MP4</a> : <span style={{fontSize:12,color:"#d9d0b7"}}>Download available when the finished video is published.</span>}
        <Link href={`/seasons/${recap.year}`} style={{color:"#48d6a8",fontWeight:800}}>Open {recap.year} archive →</Link>
      </div>
    </section>
  );
}
