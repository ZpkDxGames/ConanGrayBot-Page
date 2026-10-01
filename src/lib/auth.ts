import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { environment } from "./env";
import { readSession } from "./session";
import { coreRequest } from "./core";
export const SESSION_COOKIE="__Host-conan-session",STATE_COOKIE="__Host-conan-state";
export const cookieOptions={httpOnly:true,secure:true,sameSite:"lax" as const,path:"/"};
export const authorizedIdentity=cache(async()=>{
  const identity=await readSession((await cookies()).get(SESSION_COOKIE)?.value,environment().sessionSecret);
  if(!identity)return null;
  try {if(!(await coreRequest(identity.id,"/api/v1/auth/check")).ok)return null;}catch{return null;}
  return identity;
});
export async function requireIdentity(){const identity=await authorizedIdentity();if(!identity)redirect("/login?reason=expired");return identity;}
