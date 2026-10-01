export function operationPath(parts:string[],guild:string,method:string):string|null {
  const operation=parts.join("/");
  if(method==="GET"&&["config","media","logs"].includes(operation))return `/api/v1/${operation}/${guild}`;
  if(method==="PUT"&&operation==="config")return `/api/v1/config/${guild}`;
  if(method==="GET"&&["diagnostics","compatibility"].includes(operation))return `/api/v1/${operation}`;
  if(method==="GET"&&["status","channels","commands"].includes(operation))return operation==="status"?`/api/v1/admin/${guild}/status`:`/api/v1/discord/${guild}/${operation}`;
  if(method==="POST"&&operation==="sync-commands")return `/api/v1/discord/${guild}/sync-commands`;
  if(method==="POST"&&operation==="test-drive")return `/api/v1/media/${guild}/test-drive`;
  if(method==="POST"&&operation==="memory/clear")return `/api/v1/admin/${guild}/memory/clear`;
  if(method==="POST"&&/^bot\/(start|restart|shutdown)$/.test(operation))return `/api/v1/admin/${guild}/${operation}`;
  if(method==="POST"&&/^ai\/(pause|resume)$/.test(operation))return `/api/v1/admin/${guild}/${operation}`;
  if(method==="DELETE"&&parts.length===2&&parts[0]==="media"&&/^[a-zA-Z0-9_-]{1,100}$/.test(parts[1]))return `/api/v1/media/${guild}/${parts[1]}`;
  return null;
}
