export function validMutation(request:Request,origin:string) {
  return request.headers.get("origin")===origin && (!request.headers.has("sec-fetch-site")||request.headers.get("sec-fetch-site")==="same-origin");
}
export async function boundedBody(request:Request,maximum=256000):Promise<string> {
  if(!request.body)return "";
  const reader=request.body.getReader();let size=0;const chunks:Uint8Array[]=[];
  try {while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>maximum){await reader.cancel();throw new Error("body_too_large");}chunks.push(value);}}finally{reader.releaseLock();}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return new TextDecoder("utf-8",{fatal:true}).decode(bytes);
}
