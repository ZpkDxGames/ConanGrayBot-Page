import { afterEach,beforeEach,describe,it,expect,vi } from "vitest";
import { environment } from "../../src/lib/env";
import { actorHeaders,actorSignature } from "../../src/lib/signing";
import { createSession,readSession } from "../../src/lib/session";
import { validMutation,boundedBody } from "../../src/lib/csrf";
import { operationPath } from "../../src/lib/operations";
import { updatePath,label } from "../../src/lib/forms";
import { panel } from "../../src/lib/panels";
import { sections } from "../../src/lib/navigation";
import { api,ApiError } from "../../src/lib/api";

beforeEach(()=>{
  for(const [key,value] of Object.entries({APP_ORIGIN:"https://dashboard.test",CORE_ORIGIN:"https://core.test",CORE_SERVICE_TOKEN:"a".repeat(40),SESSION_SECRET:"b".repeat(40),DISCORD_GUILD_ID:"123",DISCORD_CLIENT_ID:"client",DISCORD_CLIENT_SECRET:"private-client-fixture"}))vi.stubEnv(key,value);
});
afterEach(()=>{vi.unstubAllEnvs();vi.unstubAllGlobals();});
describe("configuration",()=>{
  it("validates server-only origins and independent secrets",()=>{
    expect(environment().guildId).toBe("123");
    vi.stubEnv("CORE_ORIGIN","https://user:pass@core.test");expect(()=>environment()).toThrow("Invalid CORE_ORIGIN");
    vi.stubEnv("CORE_ORIGIN","https://core.test/path");expect(()=>environment()).toThrow();
    vi.stubEnv("CORE_ORIGIN","https://core.test");vi.stubEnv("CORE_SERVICE_TOKEN","short");expect(()=>environment()).toThrow();
    vi.stubEnv("CORE_SERVICE_TOKEN","b".repeat(40));expect(()=>environment()).toThrow();
    vi.stubEnv("CORE_SERVICE_TOKEN","a".repeat(40));vi.stubEnv("DISCORD_GUILD_ID","invalid");expect(()=>environment()).toThrow();
    vi.stubEnv("DISCORD_GUILD_ID","123");vi.stubEnv("DISCORD_CLIENT_SECRET","");expect(()=>environment()).toThrow("Missing DISCORD_CLIENT_SECRET");
  });
  it("rejects insecure production origins and permits local development",()=>{
    vi.stubEnv("NODE_ENV","production");vi.stubEnv("CORE_ORIGIN","http://localhost:8000");expect(()=>environment()).toThrow();
    vi.stubEnv("NODE_ENV","development");expect(environment().coreOrigin).toBe("http://localhost:8000");
    vi.stubEnv("CORE_ORIGIN","http://remote.test");expect(()=>environment()).toThrow();
  });
});
describe("identity",()=>{
  it("binds session audience, signature and expiry",async()=>{
    const secret="x".repeat(40),token=await createSession({id:"789",name:"Staff"},secret);
    expect(await readSession(token,secret)).toEqual({id:"789",name:"Staff"});
    expect(await readSession(token,secret,"oauth-state")).toBeNull();
    expect(await readSession(token,"y".repeat(40))).toBeNull();
    expect(await readSession(undefined,secret)).toBeNull();
    expect(await readSession(token,"short")).toBeNull();
    expect(await readSession(await createSession({id:"bad",name:"Staff"},secret),secret)).toBeNull();
    expect(await readSession(await createSession({id:"789",name:"Staff"},secret,"dashboard","-1s"),secret)).toBeNull();
    await expect(createSession({id:"789",name:"Staff"},"short")).rejects.toThrow();
  });
  it("binds actor proof to body, path and identity",()=>{
    const signature=actorSignature("fixture","PUT","/api/v1/config/123","789","1000","a".repeat(32),"{}");
    expect(signature).toHaveLength(64);
    expect(signature).not.toBe(actorSignature("fixture","PUT","/api/v1/config/123","789","1000","a".repeat(32),"different"));
    const headers=actorHeaders("fixture","GET","/api/v1/config/123","789","");
    expect(headers["x-conan-nonce"]).toHaveLength(32);expect(headers.authorization).toBe("Bearer fixture");
  });
});
describe("request boundaries",()=>{
  it("rejects cross-origin mutations",()=>{
    expect(validMutation(new Request("https://dashboard.test",{headers:{origin:"https://dashboard.test","sec-fetch-site":"same-origin"}}),"https://dashboard.test")).toBe(true);
    expect(validMutation(new Request("https://dashboard.test",{headers:{origin:"https://dashboard.test"}}),"https://dashboard.test")).toBe(true);
    expect(validMutation(new Request("https://dashboard.test",{headers:{origin:"https://dashboard.test","sec-fetch-site":"cross-site"}}),"https://dashboard.test")).toBe(false);
    expect(validMutation(new Request("https://dashboard.test"),"https://dashboard.test")).toBe(false);
  });
  it("bounds body while reading and decodes UTF-8 strictly",async()=>{
    expect(await boundedBody(new Request("https://test"))).toBe("");
    expect(await boundedBody(new Request("https://test",{method:"POST",body:"é"}))).toBe("é");
    await expect(boundedBody(new Request("https://test",{method:"POST",body:"abcdef"}),5)).rejects.toThrow("body_too_large");
    await expect(boundedBody(new Request("https://test",{method:"POST",body:new Uint8Array([255])}))).rejects.toThrow();
  });
  it.each([
    ["config","GET","/api/v1/config/123"],["config","PUT","/api/v1/config/123"],["media","GET","/api/v1/media/123"],["logs","GET","/api/v1/logs/123"],
    ["diagnostics","GET","/api/v1/diagnostics"],["compatibility","GET","/api/v1/compatibility"],["status","GET","/api/v1/admin/123/status"],["channels","GET","/api/v1/discord/123/channels"],["commands","GET","/api/v1/discord/123/commands"],
    ["sync-commands","POST","/api/v1/discord/123/sync-commands"],["test-drive","POST","/api/v1/media/123/test-drive"],["memory/clear","POST","/api/v1/admin/123/memory/clear"],["bot/restart","POST","/api/v1/admin/123/bot/restart"],["ai/pause","POST","/api/v1/admin/123/ai/pause"],["media/record_1","DELETE","/api/v1/media/123/record_1"],
  ])("allows only declared operation %s %s",(operation,method,path)=>expect(operationPath(operation.split("/"),"123",method)).toBe(path));
  it.each(["../config","https://evil.test","media/../../../credentials","bot/arbitrary"])("rejects arbitrary paths %s",operation=>expect(operationPath(operation.split("/"),"123","POST")).toBeNull());
});
describe("forms and panels",()=>{
  it("updates objects/arrays immutably",()=>{
    const value={ai:{enabled:true},items:["a"]};expect(updatePath(value,["ai","enabled"],false)).toEqual({ai:{enabled:false},items:["a"]});expect(value.ai.enabled).toBe(true);
    expect(updatePath(value,["items","0"],"b")).toEqual({ai:{enabled:true},items:["b"]});expect(updatePath(value,[],true)).toBe(true);
    expect(()=>updatePath(value,["__proto__"],"x")).toThrow();expect(()=>updatePath(true,["unknown"],"x")).toThrow();expect(label("maxOutputTokens")).toBe("Max Output Tokens");
  });
  it("covers every configuration section",()=>{
    for(const [slug] of sections){if(!["","media","logs","admin/lifecycle"].includes(slug))expect(panel(slug)).not.toBeNull();}
    expect(panel("unknown")).toBeNull();expect(panel("ai/unknown")).toBeNull();
  });
});
describe("browser API errors",()=>{
  it("returns typed success and actionable errors",async()=>{
    vi.stubGlobal("fetch",vi.fn().mockResolvedValueOnce(new Response('{"ok":true}')).mockResolvedValueOnce(new Response('{"message":"Changed","requestId":"request123","fields":[{"path":"ai","message":"invalid"}]}',{status:409})));
    expect(await api("config")).toEqual({ok:true});
    try{await api("config");throw new Error("expected failure");}catch(error){expect(error).toBeInstanceOf(ApiError);expect((error as ApiError).requestId).toBe("request123");expect((error as ApiError).fields).toHaveLength(1);}
  });
  it("expires the browser session on authentication denial",async()=>{
    const assign=vi.fn();vi.stubGlobal("window",{location:{origin:"https://dashboard.test",assign}});vi.stubGlobal("fetch",vi.fn().mockResolvedValue(new Response('{}',{status:401})));
    await expect(api("config")).rejects.toThrow("Request failed");expect(assign).toHaveBeenCalledWith("https://dashboard.test/login?reason=expired");
  });
});
