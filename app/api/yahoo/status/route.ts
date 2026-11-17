import { NextResponse } from 'next/server';
import { commissioner } from '../../../../lib/server-auth';
import { db } from '../../../../lib/yahoo';
export async function GET() {
 const user=await commissioner();
 if(!user) return NextResponse.json({error:'Commissioner sign-in required'},{status:403});
 if(!process.env.YAHOO_CLIENT_ID) return NextResponse.json({connected:false,setup:'Awaiting Yahoo credentials'});
 const {data,error}=await db().from('yahoo_connections').select('expires_at,updated_at').eq('user_id',user.id).maybeSingle();
 if(error) return NextResponse.json({error:'Connection status unavailable'},{status:500});
 return NextResponse.json({connected:!!data,lastUpdated:data?.updated_at||null});
}
