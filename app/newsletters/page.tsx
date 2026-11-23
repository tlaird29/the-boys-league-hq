import Link from 'next/link';
import {listPublishedNewsletters} from '../../lib/published-newsletters';
export const dynamic='force-dynamic';
export default async function NewsletterArchive(){
  let editions;
  try {editions=await listPublishedNewsletters();}
  catch {return <main className="shell"><h1>NEWSLETTER ARCHIVE</h1><p>Archives are temporarily unavailable.</p><Link className="button" href="/">Back to The Boys</Link></main>}
  return <main className="shell"><div className="kicker">THE BOYS • ALL THE NEWS THAT'S FIT TO ROAST</div><h1>PREVIOUS EDITIONS</h1>
    <p className="muted">Every published Wednesday report stays on the record. Drafts are never shown here.</p>
    <div className="grid">{editions.length?editions.map(e=><section key={`${e.year}-${e.week}`} className="card span6">
      <div className="label">{e.year} SEASON • WEEK {e.week}</div>
      <h2 style={{margin:'12px 0'}}>{e.sections.find(s=>s.id==='intro')?.title||'THE WEDNESDAY REPORT'}</h2>
      <p className="muted">{e.published_at?`Published ${new Date(e.published_at).toLocaleDateString('en-US',{timeZone:'UTC'})}`:'Published edition'}</p>
      <Link className="button" href={`/newsletters/${e.year}/${e.week}`}>READ THIS EDITION</Link>
    </section>):<section className="card span12"><h2>NO PUBLISHED EDITIONS YET</h2><p className="muted">Once the commissioner approves and publishes the first newsletter, it will appear here.</p></section>}</div>
    <Link className="button" href="/">← BACK TO THE FRONT PAGE</Link>
  </main>;
}
