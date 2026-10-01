import type { components } from "./generated";
export type BotConfig=components["schemas"]["BotConfig"];
export type ConfigEnvelope=components["schemas"]["ConfigEnvelope"];
export class ApiError extends Error {constructor(message:string,public status:number,public requestId="",public fields:{path:string;message:string}[]=[]){super(message);}}
export async function api<T>(operation:string,options:RequestInit={}):Promise<T>{
  const response=await fetch("/api/core/"+operation,{...options,headers:{"content-type":"application/json",...options.headers},cache:"no-store"});const data=await response.json();
  if(!response.ok){if(response.status===401)window.location.assign(new URL("/login?reason=expired",window.location.origin).href);throw new ApiError(data.message||"Request failed",response.status,data.requestId||"",data.fields||[]);}return data;
}
