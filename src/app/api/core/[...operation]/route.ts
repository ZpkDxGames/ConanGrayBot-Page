import { NextRequest, NextResponse } from "next/server";
import { authorizedIdentity } from "@/lib/auth";
import { environment } from "@/lib/env";
import { coreRequest } from "@/lib/core";
import { operationPath } from "@/lib/operations";
import { validMutation, boundedBody } from "@/lib/csrf";
async function handle(request:NextRequest,{params}:{params:Promise<{operation:string[]}>}) {
  const env=environment(),identity=await authorizedIdentity();
  if(!identity)return NextResponse.json({code:"session_expired",message:"Sign in again"},{status:401});
  if(request.method!=="GET"&&!validMutation(request,env.appOrigin))return NextResponse.json({code:"origin_denied",message:"Request denied"},{status:403});
  let path=operationPath((await params).operation,env.guildId,request.method);
  if(!path)return NextResponse.json({code:"operation_not_found",message:"Unknown operation"},{status:404});
  const query=new URLSearchParams();for(const key of ["limit","cursor","search","media_type","channel_id"]){const value=request.nextUrl.searchParams.get(key);if(value)query.set(key,value);}
  if(query.size)path+="?"+query;
  try {
    const body=request.method==="GET"?"":await boundedBody(request);
    const response=await coreRequest(identity.id,path,request.method,body);
    const data=await response.json();
    if(!response.ok)return NextResponse.json({code:typeof data.code==="string"?data.code:"core_error",message:response.status>=500?"Core is temporarily unavailable":typeof data.message==="string"?data.message:"Request failed",requestId:typeof data.requestId==="string"?data.requestId:"",fields:Array.isArray(data.fields)?data.fields:[]},{status:response.status,headers:{"Cache-Control":"no-store"}});
    return NextResponse.json(data,{headers:{"Cache-Control":"no-store"}});
  }catch(error){const large=error instanceof Error&&error.message==="body_too_large";return NextResponse.json({code:large?"body_too_large":"core_unavailable",message:large?"Request exceeds 256 KB":"Core is temporarily unavailable"},{status:large?413:502});}
}
export const GET=handle,POST=handle,PUT=handle,DELETE=handle;
