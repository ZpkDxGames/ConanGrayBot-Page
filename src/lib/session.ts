import { SignJWT, jwtVerify } from "jose";
export type Identity={id:string;name:string};
const key=(secret:string)=>new TextEncoder().encode(secret);
export async function createSession(identity:Identity,secret:string,audience="dashboard",duration="8h") {
  if(secret.length<32)throw new Error("Invalid session secret");
  return new SignJWT(identity).setProtectedHeader({alg:"HS256"}).setIssuer("conangraybot").setAudience(audience).setIssuedAt().setExpirationTime(duration).sign(key(secret));
}
export async function readSession(token:string|undefined,secret:string,audience="dashboard"):Promise<Identity|null> {
  if(!token||secret.length<32)return null;
  try {const {payload}=await jwtVerify(token,key(secret),{issuer:"conangraybot",audience,algorithms:["HS256"]});if(typeof payload.id!=="string"||typeof payload.name!=="string"||!/^\d+$/.test(payload.id))return null;return {id:payload.id,name:payload.name};}catch{return null;}
}
