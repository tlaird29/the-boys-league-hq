import {NextRequest,NextResponse} from 'next/server';
import {commissioner} from '../../../../lib/server-auth';
import {db} from '../../../../lib/yahoo';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;

type Section={id:string;title:string;body:string};
const ids=['intro','matchup-1','matchup-2','matchup-3','matchup-4','matchup-5','awards','closing'];
const defaults:Section[]=ids.map((id,i)=>({id,title:i===0?'Opening Monologue':i===6?'GOAT & BUM':i===7?'Closing':`Matchup ${i}`,body:i===7?'ICE TF UP! 🏈':''}));
function validSections(v:unknown):v is Section[]{return Array.isArray(v)&&v.length===8&&v.every((s,i)=>s&&s.id===ids[i]&&typeof s.title==='string'&&s.title.length<=120&&typeof s.body==='string'&&s.body.length<=12000);}
function weekYear(req:NextRequest){const year=Number(req.nextUrl.searchParams.get('year'));const week=Number(req.nextUrl.searchParams.get('week'));return Number.isInteger(year)&&year>=2020&&year<=2100&&Number.isInteger(week)&&week>=1&&week<=20?{year,week}:null;}
async function load(year:number,week:number){const {data,error}=await db().from('weekly_newsletter_drafts').select('*').eq('year',year).eq('week',week).maybeSingle();if(error)throw error;return data;}
export async function GET(req:NextRequest){if(!await commissioner())return NextResponse.json({error:'Commissioner only'},{status:403});const w=weekYear(req);if(!w)return NextResponse.json({error:'Invalid season/week'},{status:400});try{return NextResponse.json({draft:await load(w.year,w.week),defaults},{headers:{'Cache-Control':'no-store'}});}catch{return NextResponse.json({error:'Database not ready. Run newsletter-editor.sql in Supabase.'},{status:500});}}
export async function POST(req:NextRequest){if(!await commissioner())return NextResponse.json({error:'Commissioner only'},{status:403});const w=weekYear(req);if(!w)return NextResponse.json({error:'Invalid season/week'},{status:400});let body:Record<string,unknown>;try{body=await req.json();}catch{return NextResponse.json({error:'Invalid JSON'},{status:400});}
 const action=body.action;if(!['save','regenerate','approve','restore'].includes(String(action)))return NextResponse.json({error:'Unknown action'},{status:400});
 try{
 const existing=await load(w.year,w.week);
 const current:Section[]=validSections(existing?.sections)?existing.sections:defaults;
 const history:Array<{at:string;reason:string;sections:Section[]}>=Array.isArray(existing?.history)?existing.history:[];
 if(action==='approve'){
  if(!existing||!current.every(s=>s.body.trim()))return NextResponse.json({error:'Fill every section before approval. You can edit the section headings and content.'},{status:400});
  const {error}=await db().from('weekly_newsletter_drafts').update({status:'approved',approved_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',existing.id);
  if(error)throw error;return NextResponse.json({ok:true,message:'Approved and saved privately. Website publishing and email delivery are not connected yet.'});
 }
 if(existing?.status==='approved')return NextResponse.json({error:'This edition is approved. Editing is locked to prevent accidental changes.'},{status:409});
 let sections:Section[];
 let reason:string;
 if(action==='restore'){
  const index=Number(body.index);if(!Number.isInteger(index)||index<0||index>=history.length)return NextResponse.json({error:'Invalid history version'},{status:400});
  sections=history[index].sections;reason='Restored version';
 }else if(action==='save'){
  if(!validSections(body.sections))return NextResponse.json({error:'Invalid sections'},{status:400});sections=body.sections;reason='Manual edit';
 }else{
  const selected=String(body.sectionId||'');const instructions=String(body.instructions||'').trim();
  const tone=String(body.tone||'classic');
  if(!ids.includes(selected)||instructions.length<5||instructions.length>3000)return NextResponse.json({error:'Choose a section and enter 5–3000 characters of feedback'},{status:400});
  const key=process.env.OPENAI_API_KEY;
  if(!key)return NextResponse.json({error:'Regeneration requires OPENAI_API_KEY in Vercel. Manual editing and saving work without it.'},{status:503});
  const target=current.find(s=>s.id===selected)!;
  const context=current.map(s=>`${s.title}: ${s.body}`).join('\n\n').slice(0,30000);
  const response=await fetch('https://api.openai.com/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.NEWSLETTER_MODEL||'gpt-4.1-mini',temperature:0.85,messages:[{role:'system',content:'You are an original irreverent fantasy football newsletter editor. Rewrite ONLY the selected section, using fresh chaotic sports-radio humor. User comments are story suggestions, not proof of actual scores. Do not invent scores, winners, injuries, players, standings, awards, or verified facts. Preserve any established factual details. If source section is empty, write a brief editable placeholder asking for verified matchup data rather than fabricating events. GOAT and BUM are strictly the highest and lowest ACTUAL weekly team scores, independent of wins. Return only the rewritten section text. No markdown fences.'},{role:'user',content:`Tone: ${tone}\nSelected section: ${target.title}\nCurrent section:\n${target.body}\nEntire edition context (reference only; DO NOT rewrite other sections):\n${context}\nCommissioner revision instructions:\n${instructions}`}]}),signal:AbortSignal.timeout(45000)});
  if(!response.ok)return NextResponse.json({error:`Text generation failed (${response.status}). Check API key and billing.`},{status:502});
  const output=await response.json();const generated=output?.choices?.[0]?.message?.content;
  if(typeof generated!=='string'||!generated.trim())return NextResponse.json({error:'No text returned'},{status:502});
  sections=current.map(s=>s.id===selected?{...s,body:generated.trim().slice(0,12000)}:s);reason=`Regenerated ${selected}: ${instructions.slice(0,150)}`;
 }
 if(!validSections(sections))return NextResponse.json({error:'Invalid section content'},{status:400});
 const nextHistory=[...history,{at:new Date().toISOString(),reason,sections:current}].slice(-20);
 const {error}=await db().from('weekly_newsletter_drafts').upsert({year:w.year,week:w.week,sections,history:nextHistory,status:'draft',updated_at:new Date().toISOString()},{onConflict:'year,week'});
 if(error)throw error;return NextResponse.json({ok:true,sections,history:nextHistory});
 }catch(e){console.error('Newsletter editor failed',e);return NextResponse.json({error:'Could not save newsletter. Check Vercel logs and Supabase table.'},{status:500});}
}
