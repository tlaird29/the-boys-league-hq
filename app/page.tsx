import Link from 'next/link';
import type {CSSProperties} from 'react';
import {latestPublishedNewsletter} from '../lib/published-newsletters';

export const dynamic = 'force-dynamic';
const nav = [['Dashboard','/'],['Record Book','/records'],['Rafters','/rafters'],['Season Awards','/awards'],['Rivalries','/rivalries'],['Season Archives','/seasons'],['Trade Hub','/trade-hub'],['Commissioner','/commissioner']];
const fallback = {
  week:'NEXT EDITION COMING SOON',headline:'THE BOYS ARE AT IT AGAIN',
  subtitle:'Ten managers. Five matchups. One weekly reminder that confidence and competence are not the same thing.',
  byline:'THE BOYS LEAGUE NEWS DESK',
  paragraphs:[
    "The Boys Fantasy Football League is preparing another edition of its most respected, least professionally supervised publication. Ten managers enter every week convinced they've built a championship roster. By Tuesday morning, half of them are investigating whether Yahoo accidentally forgot to count somebody's touchdowns. The other half are updating the group chat like they personally invented football.",
    "The opening monologue will kick off each edition with the biggest storyline in the league. Maybe an undefeated team finally gets humbled. Maybe a manager fumbles an easy win. Maybe a trade proposal arrives that's so offensive it deserves its own congressional hearing.",
    "From there, we'll move directly into the week's five matchups. No separate pages, no clickable recaps, and no cookie-cutter summaries. Every game gets its own paragraph, its own analysis, and its own reason for somebody to reconsider ever opening the group chat again.",
    "We'll cover the players who carried their teams, the bench decisions that should trigger an internal investigation, and the managers whose confidence somehow survived another deeply embarrassing Sunday.",
    "The final stretch of the article will cover standings movement, playoff pressure, streaks, rivalries, and whatever fresh nonsense the league has contributed to the historical record. All of it will read like one continuous sports column, with natural transitions and fresh trash talk every week."
  ],closing:'ICE TF UP! 🏈'
};
type WeeklyHonor = {name:string|null;team:string|null;points:number|null;commentary:string};
const goat:WeeklyHonor={name:null,team:null,points:null,commentary:'Awarded strictly to the fantasy team with the highest actual weekly points scored, regardless of matchup result. Awaiting confirmed Yahoo scores.'};
const bum:WeeklyHonor={name:null,team:null,points:null,commentary:'Awarded strictly to the fantasy team with the lowest actual weekly points scored, regardless of matchup result. Awaiting confirmed Yahoo scores.'};
type PerfectSlot={position:string;player:string|null;fantasyTeam:string|null;points:number|null};
const perfectTeam:PerfectSlot[]=['QB','RB1','RB2','WR1','WR2','TE','FLEX','K','DEF'].map(position=>({position,player:null,fantasyTeam:null,points:null}));
const perfectTeamReady=perfectTeam.every(s=>s.player!==null&&s.points!==null);
const perfectTeamTotal=perfectTeamReady?perfectTeam.reduce((sum,s)=>sum+(s.points??0),0):null;
const ink='#211f19',faded='#625e53',paper='#f4f0e4',rule='#38352d';
const smallPrint:CSSProperties={fontFamily:'Arial, Helvetica, sans-serif',fontSize:10,fontWeight:800,letterSpacing:1.2,textTransform:'uppercase'};
const paragraphStyle:CSSProperties={fontFamily:"Georgia, 'Times New Roman', serif",fontSize:17,lineHeight:1.82,color:ink,textAlign:'left',margin:'0 0 21px',overflowWrap:'break-word'};
function PerfectTeamColumn(){return <aside className="boys-perfect-team">
  <div style={smallPrint}>THE ULTIMATE WEEKLY LINEUP</div>
  <h3 style={{fontFamily:'Georgia, serif',fontSize:25,lineHeight:1.1,margin:'10px 0'}}>THE PERFECT TEAM</h3>
  <p style={{fontFamily:'Georgia, serif',fontSize:13,fontStyle:'italic',color:faded,lineHeight:1.55,marginBottom:17}}>The highest-scoring possible starting lineup from the week&apos;s eligible players.</p>
  <div style={{...smallPrint,display:'flex',justifyContent:'space-between',borderTop:`3px double ${rule}`,borderBottom:`1px solid ${rule}`,padding:'9px 0'}}><span>PLAYER</span><span>PTS</span></div>
  {perfectTeam.map(s=><div key={s.position} style={{display:'grid',gridTemplateColumns:'40px minmax(0, 1fr) auto',gap:6,padding:'11px 0',borderBottom:'1px solid #c5bdab',alignItems:'start'}}><strong style={{...smallPrint,fontSize:10,paddingTop:3}}>{s.position}</strong><div style={{minWidth:0}}><div style={{fontFamily:'Georgia, serif',fontSize:13,fontWeight:700}}>{s.player??'Awaiting results'}</div>{s.fantasyTeam&&<div style={{fontSize:10,color:faded,marginTop:4}}>{s.fantasyTeam}</div>}</div><strong style={{fontFamily:'Georgia, serif',fontSize:13}}>{s.points===null?'—':s.points.toFixed(2)}</strong></div>)}
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,padding:'15px 0',borderBottom:`3px double ${rule}`}}><span style={smallPrint}>TOTAL</span><strong style={{fontFamily:'Georgia, serif',fontSize:24}}>{perfectTeamTotal===null?'—':perfectTeamTotal.toFixed(2)}</strong></div>
  <p style={{fontFamily:'Georgia, serif',fontSize:12,fontStyle:'italic',lineHeight:1.6,color:faded,marginTop:13}}>Official starting slots and FLEX eligibility will follow Yahoo league settings. No player can appear twice.</p>
</aside>}
function HonorFeature({title,eyebrow,honor}:{title:string;eyebrow:string;honor:WeeklyHonor}){return <section style={{paddingBottom:23,marginBottom:25,borderBottom:`3px double ${rule}`}}><div style={smallPrint}>{eyebrow}</div><h3 style={{fontFamily:'Georgia, serif',fontSize:25,lineHeight:1.15,margin:'10px 0 13px'}}>{title}</h3><div style={{borderTop:`1px solid ${rule}`,paddingTop:12}}><div style={{fontFamily:'Georgia, serif',fontSize:21,fontWeight:800}}>{honor.name??'TO BE ANNOUNCED'}</div>{honor.team&&<div style={{...smallPrint,color:faded,marginTop:8}}>{honor.team}</div>}{honor.points!==null&&<div style={{fontFamily:'Georgia, serif',fontSize:23,fontWeight:800,marginTop:8}}>{honor.points.toFixed(2)} PTS</div>}<p style={{...paragraphStyle,fontSize:14.5,lineHeight:1.7,marginTop:13,marginBottom:0}}>{honor.commentary}</p></div></section>}
function AroundTheLeague(){return <section aria-label="Around the League" style={{marginTop:30,borderTop:`5px double ${rule}`,paddingTop:24}}><div style={{...smallPrint,textAlign:'center',color:faded}}>THE BOYS • LEAGUE DISPATCH</div><h2 style={{fontFamily:'Georgia, serif',fontSize:'clamp(30px,5vw,48px)',textAlign:'center',margin:'12px 0 22px'}}>AROUND THE LEAGUE</h2><div className="boys-front-extras">
  <section><div style={smallPrint}>THE FEATURED MATCHUP</div><h3 style={{fontFamily:'Georgia, serif',fontSize:24,margin:'12px 0'}}>MATCHUP OF THE WEEK</h3><p style={{...paragraphStyle,fontSize:15}}>Awaiting confirmed Yahoo league data. The featured matchup, both teams, their records, projected scores and head-to-head history will appear here once connected.</p><p style={{fontFamily:'Georgia, serif',fontStyle:'italic',color:faded}}>The rivalry is real. The matchup details are pending.</p></section>
  <section><div style={smallPrint}>HISTORY IN THE MAKING</div><h3 style={{fontFamily:'Georgia, serif',fontSize:24,margin:'12px 0'}}>RECORD WATCH</h3><p style={{...paragraphStyle,fontSize:15}}>Awaiting confirmed historical league data. This column will spotlight managers nearing all-time wins, scoring milestones, winning streaks and other verified records.</p><p style={{fontFamily:'Georgia, serif',fontStyle:'italic',color:faded}}>The record book keeps receipts.</p></section>
  <section><div style={smallPrint}>THE TRANSACTION WIRE</div><h3 style={{fontFamily:'Georgia, serif',fontSize:24,margin:'12px 0'}}>LEAGUE ACTIVITY</h3><p style={{...paragraphStyle,fontSize:15}}>Awaiting confirmed Yahoo transactions. Recent completed trades, waiver activity, weekly honors and commissioner announcements will appear here directly.</p><p style={{fontFamily:'Georgia, serif',fontStyle:'italic',color:faded}}>No rumors presented as completed trades.</p></section>
</div></section>}
export default async function Home(){
 const published=await latestPublishedNewsletter();
 const intro=published?.sections.find(s=>s.id==='intro');
 const closing=published?.sections.find(s=>s.id==='closing');
 const edition=published?{
   week:`SEASON ${published.year} • WEEK ${published.week}`,
   headline:intro?.title||'THE WEDNESDAY REPORT',
   subtitle:`The Boys • Season ${published.year} • Week ${published.week}`,
   byline:'THE BOYS LEAGUE NEWS DESK',
   paragraphs:published.sections.filter(s=>s.id!=='closing').flatMap(s=>s.body.split(/\n\s*\n/).filter(Boolean).map((p,i)=>s.id==='intro'||i>0?p:`${s.title.toUpperCase()} — ${p}`)),
   closing:closing?.body||'ICE TF UP! 🏈'
 }:fallback;
 return <><style>{`
 .boys-newspaper-layout {display:grid;grid-template-columns:minmax(0,215px) minmax(0,1fr) minmax(0,215px);gap:25px}
 .boys-perfect-team {min-width:0;border-right:1px solid #aaa18e;padding-right:22px}
 .boys-main-article {min-width:0}
 .boys-honors {min-width:0;border-left:1px solid #aaa18e;padding-left:22px}
 .boys-front-extras {display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}
 .boys-front-extras > section {border-top:4px double #38352d;padding-top:16px;min-width:0}
 @media (max-width:950px){.boys-newspaper-layout {grid-template-columns:minmax(0,190px) minmax(0,1fr)}.boys-honors {grid-column:1/-1;border-left:0;border-top:4px double #38352d;padding-left:0;padding-top:25px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:25px}}
 @media (max-width:800px){.boys-front-extras {grid-template-columns:1fr}}
 @media (max-width:650px){.boys-newspaper-layout {grid-template-columns:1fr}.boys-main-article {grid-row:1}.boys-perfect-team {grid-row:2;border-right:0;border-top:4px double #38352d;padding-right:0;padding-top:25px}.boys-honors {grid-row:3;grid-column:1;grid-template-columns:1fr}}
 `}</style>
 <header className="top"><div className="kicker">THE BOYS • FANTASY FOOTBALL • EST. 2020</div><h1>THE BOYS<br/><span style={{color:'var(--mint)'}}>LEAGUE HQ</span></h1><div className="sub">SEVEN SEASONS OF GLORY, DISASTER &amp; RECEIPTS.</div><nav className="nav">{nav.map(([name,url])=><Link key={url} href={url} className={url==='/'?'active':''}>{name}</Link>)}</nav></header>
 <main style={{maxWidth:1320,margin:'28px auto',padding:'0 12px'}}><article style={{background:paper,color:ink,padding:'clamp(16px, 3vw, 42px)',border:'1px solid #c6beac',boxShadow:'0 10px 28px #14251f20',backgroundImage:'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(55,45,25,0.012) 4px)'}}>
 <div style={{...smallPrint,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:8,paddingBottom:10,borderBottom:`1px solid ${rule}`}}><span>EST. MMXX</span><span>THE BOYS FANTASY FOOTBALL LEAGUE</span><span>WEDNESDAY EDITION</span></div>
 <div style={{textAlign:'center',padding:'18px 0 16px',borderBottom:`5px double ${rule}`}}><div style={{fontFamily:"'UnifrakturCook', 'Old English Text MT', Georgia, serif",fontSize:'clamp(58px, 10vw, 118px)',fontWeight:700,lineHeight:1.1,letterSpacing:'-0.035em'}}>The Boys</div><div style={{...smallPrint,fontSize:11,marginTop:10}}>ALL THE NEWS THAT&apos;S FIT TO ROAST</div></div>
 <div style={{...smallPrint,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:10,padding:'12px 0',borderBottom:`2px solid ${rule}`}}><span>THE WEDNESDAY REPORT</span><span>{edition.week}</span><span>PRICE: YOUR DIGNITY</span></div>
 <section style={{textAlign:'center',padding:'30px 0 25px',borderBottom:`1px solid ${rule}`}}><div style={{...smallPrint,marginBottom:14}}>THE LEAGUE&apos;S MOST UNNECESSARY INVESTIGATIVE JOURNALISM</div><h2 style={{fontFamily:"Georgia, 'Times New Roman', serif",fontSize:'clamp(37px, 6.5vw, 76px)',lineHeight:1.04,fontWeight:900,letterSpacing:'-0.045em',textTransform:'uppercase',margin:0}}>{edition.headline}</h2><p style={{fontFamily:"Georgia, 'Times New Roman', serif",fontSize:'clamp(17px, 2vw, 21px)',fontStyle:'italic',lineHeight:1.55,maxWidth:800,margin:'18px auto',color:faded}}>{edition.subtitle}</p><div style={smallPrint}>BY {edition.byline}</div><div style={{marginTop:16,fontFamily:'Arial, sans-serif',fontSize:12,fontWeight:800}}><Link href="/newsletters" style={{textDecoration:'underline',textUnderlineOffset:4}}>PREVIOUS EDITIONS &amp; NEWSLETTER ARCHIVE</Link></div></section>
 <div className="boys-newspaper-layout" style={{paddingTop:30,paddingBottom:25,borderBottom:`4px double ${rule}`}}><PerfectTeamColumn/><section className="boys-main-article"><div style={{...smallPrint,marginBottom:18}}>THE WEDNESDAY REPORT • LEAGUE DISPATCH</div>{edition.paragraphs.map((paragraph,index)=><p key={index} style={paragraphStyle}>{index===0?<><span style={{float:'left',fontFamily:'Georgia, serif',fontSize:70,fontWeight:900,lineHeight:0.85,paddingRight:8,paddingTop:5}}>{paragraph.charAt(0)}</span>{paragraph.slice(1)}</>:paragraph}</p>)}<div style={{borderTop:`1px solid ${rule}`,marginTop:20,paddingTop:25,textAlign:'center',fontFamily:'Georgia, serif',fontSize:'clamp(27px, 4vw, 42px)',fontWeight:900}}>{edition.closing}</div></section><aside className="boys-honors"><HonorFeature title="GOAT OF THE WEEK" eyebrow="THE WEEK'S FINEST" honor={goat}/><HonorFeature title="BUM OF THE WEEK" eyebrow="THE WEEK'S WORST" honor={bum}/></aside></div>
 <AroundTheLeague/><div style={{...smallPrint,display:'flex',justifyContent:'space-between',flexWrap:'wrap',gap:12,paddingTop:15,marginTop:25,borderTop:`1px solid ${rule}`}}><span>THE BOYS • EST. 2020</span><span>ALL RECEIPTS PRESERVED</span></div></article><footer style={{textAlign:'center'}}>THE BOYS • PRIVATE LEAGUE HISTORY • EST. 2020</footer></main></>;
}
