import "server-only";
import { environment } from "./env";
import { actorHeaders } from "./signing";
export async function coreRequest(actor:string,path:string,method="GET",body="") {
  if(!path.startsWith("/api/v1/")||path.includes(".."))throw new Error("Invalid API operation");
  const env=environment();return fetch(env.coreOrigin+path,{method,headers:actorHeaders(env.secret,method,path,actor,body),body:body||undefined,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(20000)});
}
export async function coreData<T>(actor:string,path:string):Promise<T> {
  const response=await coreRequest(actor,path);if(!response.ok)throw new Error(`Core request unavailable (${response.status})`);return response.json() as Promise<T>;
}
