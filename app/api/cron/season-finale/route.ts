import {NextRequest,NextResponse} from 'next/server';
import {prepareSeasonFinale} from '../../../../lib/season-finale-job';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(req:NextRequest){
 const secret=process.env.CRON_SECRET;
 if(!secret||req.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'Unauthorized'},{status:401});
 const userId=process.env.COMMISSIONER_USER_ID;
 if(!userId)return NextResponse.json({error:'COMMISSIONER_USER_ID not configured'},{status:503});
 const year=new Date().getUTCFullYear();
 try{return NextResponse.json(await prepareSeasonFinale(userId,year),{headers:{'Cache-Control':'no-store'}});}
 catch(e){console.error('Season finale job failed',e);return NextResponse.json({error:'Season finale check failed; see Vercel logs'},{status:502});}
}
