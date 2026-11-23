import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getPublishedNewsletter} from '../../../../lib/published-newsletters';
export const dynamic='force-dynamic';
export default async function EditionPage({params}:{params:Promise<{year:string;week:string}>}){
  const {year,week}=await params;
  const edition=await getPublishedNewsletter(Number(year),Number(week));
  if(!edition)notFound();
  const intro=edition.sections.find(s=>s.id==='intro');
  return <main className="shell" style={{maxWidth:1000}}>
    <div className="kicker">THE BOYS • WEDNESDAY REPORT • ARCHIVE</div>
    <article style={{background:'#f4f0e4',color:'#211f19',padding:'clamp(20px,4vw,52px)',border:'1px solid #c6beac',marginTop:18}}>
      <div style={{fontFamily:'Georgia,serif',textAlign:'center',fontSize:'clamp(42px,8vw,88px)',fontWeight:900,borderBottom:'5px double #38352d'}}>The Boys</div>
      <p style={{textAlign:'center',fontWeight:800,letterSpacing:2,fontSize:12}}>SEASON {edition.year} • WEEK {edition.week}</p>
      <h1 style={{textAlign:'center',fontFamily:'Georgia,serif',fontSize:'clamp(30px,5vw,54px)',lineHeight:1.1,margin:'25px 0'}}>{intro?.title||'THE WEDNESDAY REPORT'}</h1>
      {edition.sections.map(s=><section key={s.id} style={{margin:'24px 0'}}>
        {s.id!=='intro'&&s.id!=='closing'&&<h2 style={{fontFamily:'Georgia,serif',fontSize:22,marginBottom:10}}>{s.title}</h2>}
        {s.body.split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i} style={{fontFamily:'Georgia,serif',fontSize:17,lineHeight:1.8,whiteSpace:'pre-wrap'}}>{p}</p>)}
      </section>)}
    </article>
    <div style={{display:'flex',gap:12,marginTop:20,flexWrap:'wrap'}}><Link className="button" href="/newsletters">← ALL EDITIONS</Link><Link className="button" href="/">CURRENT FRONT PAGE</Link></div>
  </main>;
}
