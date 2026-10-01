import { NextRequest,NextResponse } from "next/server";
import { environment } from "@/lib/env";
import { readSession,createSession } from "@/lib/session";
import { STATE_COOKIE,SESSION_COOKIE,cookieOptions } from "@/lib/auth";
import { coreRequest } from "@/lib/core";
export async function GET(request:NextRequest){
  const env=environment();const failure=NextResponse.redirect(env.appOrigin+"/login?reason=denied");failure.cookies.delete(STATE_COOKIE);
  const state=await readSession(request.cookies.get(STATE_COOKIE)?.value,env.sessionSecret,"oauth-state"),code=request.nextUrl.searchParams.get("code");
  if(!state||!code||state.name!==request.nextUrl.searchParams.get("state"))return failure;
  try {
    const exchange=await fetch("https://discord.com/api/oauth2/token",{method:"POST",headers:{"content-type":"application/x-www-form-urlencoded"},body:new URLSearchParams({client_id:env.clientId,client_secret:env.clientSecret,grant_type:"authorization_code",code,redirect_uri:env.appOrigin+"/auth/callback"}),cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
    if(!exchange.ok)return failure;const token=await exchange.json();if(typeof token.access_token!=="string")return failure;
    const userResponse=await fetch("https://discord.com/api/users/@me",{headers:{authorization:`Bearer ${token.access_token}`},cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});
    if(!userResponse.ok)return failure;const user=await userResponse.json();if(typeof user.id!=="string"||!/^\d+$/.test(user.id))return failure;
    if(!(await coreRequest(user.id,"/api/v1/auth/check")).ok)return failure;
    const response=NextResponse.redirect(env.appOrigin+"/dashboard");response.cookies.delete(STATE_COOKIE);response.cookies.set(SESSION_COOKIE,await createSession({id:user.id,name:String(user.global_name||user.username||"Staff")},env.sessionSecret),{...cookieOptions,maxAge:28800});return response;
  }catch{return failure;}
}
