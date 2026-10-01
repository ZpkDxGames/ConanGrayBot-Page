import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { environment } from "@/lib/env";
import { createSession } from "@/lib/session";
import { STATE_COOKIE,cookieOptions } from "@/lib/auth";
export async function GET(){
  const env=environment(),state=randomBytes(32).toString("hex");
  const token=await createSession({id:"0",name:state},env.sessionSecret,"oauth-state","5m");
  const url=new URL("https://discord.com/oauth2/authorize");url.search=new URLSearchParams({client_id:env.clientId,redirect_uri:env.appOrigin+"/auth/callback",response_type:"code",scope:"identify",state}).toString();
  const response=NextResponse.redirect(url);response.cookies.set(STATE_COOKIE,token,{...cookieOptions,maxAge:300});return response;
}
