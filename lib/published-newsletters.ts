import { db } from './yahoo';

export type NewsletterSection = { id: string; title: string; body: string };
export type PublishedNewsletter = {
  year: number;
  week: number;
  published_at: string | null;
  sections: NewsletterSection[];
};

function clean(row: unknown): PublishedNewsletter | null {
  if (!row || typeof row !== 'object') return null;
  const r = row as Record<string, unknown>;
  if (typeof r.year !== 'number' || typeof r.week !== 'number' || !Array.isArray(r.sections)) return null;
  const sections = r.sections.filter((s): s is NewsletterSection =>
    s !== null && typeof s === 'object' &&
    typeof s.id === 'string' && typeof s.title === 'string' && typeof s.body === 'string');
  if (!sections.length) return null;
  return {year:r.year,week:r.week,published_at:typeof r.published_at==='string'?r.published_at:null,sections};
}

export async function latestPublishedNewsletter(): Promise<PublishedNewsletter | null> {
  try {
    const {data,error} = await db().from('weekly_newsletter_drafts')
      .select('year,week,published_at,sections').eq('status','published')
      .order('published_at',{ascending:false}).order('year',{ascending:false})
      .order('week',{ascending:false}).limit(1).maybeSingle();
    if (error) throw error;
    return clean(data);
  } catch (error) {
    console.error('Could not load published newsletter',error);
    return null;
  }
}

export async function listPublishedNewsletters(): Promise<PublishedNewsletter[]> {
  const {data,error}=await db().from('weekly_newsletter_drafts')
    .select('year,week,published_at,sections').eq('status','published')
    .order('year',{ascending:false}).order('week',{ascending:false});
  if (error) throw error;
  return (data||[]).map(clean).filter((r):r is PublishedNewsletter=>r!==null);
}

export async function getPublishedNewsletter(year:number,week:number): Promise<PublishedNewsletter|null> {
  if (!Number.isInteger(year)||year<2020||year>2100||!Number.isInteger(week)||week<1||week>20) return null;
  const {data,error}=await db().from('weekly_newsletter_drafts')
    .select('year,week,published_at,sections').eq('status','published')
    .eq('year',year).eq('week',week).maybeSingle();
  if(error)throw error;
  return clean(data);
}
