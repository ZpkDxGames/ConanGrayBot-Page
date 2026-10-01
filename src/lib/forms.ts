export type JsonValue=string|number|boolean|null|JsonValue[]|{[key:string]:JsonValue};
export function updatePath(value:JsonValue,path:string[],next:JsonValue):JsonValue {
  if(!path.length)return next;const [head,...tail]=path;
  if(["__proto__","prototype","constructor"].includes(head))throw new Error("Invalid form path");
  if(Array.isArray(value)){const result=[...value];result[Number(head)]=updatePath(result[Number(head)],tail,next);return result;}
  if(value===null||typeof value!=="object")throw new Error("Invalid form structure");
  return {...value,[head]:updatePath(value[head],tail,next)};
}
export function label(key:string){return key.replace(/([a-z])([A-Z])/g,"$1 $2").replace(/^./,c=>c.toUpperCase());}
