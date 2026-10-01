import { NextRequest, NextResponse } from "next/server";
import { environment } from "@/lib/env";
import { SESSION_COOKIE } from "@/lib/auth";
import { validMutation } from "@/lib/csrf";
export async function POST(request:NextRequest){const env=environment();if(!validMutation(request,env.appOrigin))return new NextResponse(null,{status:403});const response=NextResponse.redirect(env.appOrigin+"/login",303);response.cookies.delete(SESSION_COOKIE);return response;}
