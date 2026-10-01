import { createHash, createHmac, randomBytes } from "node:crypto";
export function actorSignature(secret:string,method:string,path:string,actor:string,stamp:string,nonce:string,body:string) {
  return createHmac("sha256",secret).update(["conan-actor-v1",method.toUpperCase(),path,actor,stamp,nonce,createHash("sha256").update(body).digest("hex")].join("\n")).digest("hex");
}
export function actorHeaders(secret:string,method:string,path:string,actor:string,body:string) {
  const stamp=String(Math.floor(Date.now()/1000)),nonce=randomBytes(16).toString("hex");
  return {authorization:`Bearer ${secret}`,"content-type":"application/json","x-conan-actor":actor,"x-conan-timestamp":stamp,"x-conan-nonce":nonce,"x-conan-signature":actorSignature(secret,method,path,actor,stamp,nonce,body)};
}
