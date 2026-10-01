import { afterEach,beforeEach,it,expect,vi } from "vitest";
const state=vi.hoisted(()=>({token:undefined as string|undefined}));
vi.mock("server-only",()=>({}));
vi.mock("next/headers",()=>({cookies:async()=>({get:()=>state.token?{value:state.token}:undefined})}));
vi.mock("next/navigation",()=>({redirect:(path:string)=>{throw new Error("redirect:"+path);}}));
import { coreRequest,coreData } from "../../src/lib/core";
import { authorizedIdentity,requireIdentity } from "../../src/lib/auth";
import { createSession } from "../../src/lib/session";
beforeEach(()=>{state.token=undefined;for(const [k,v] of Object.entries({APP_ORIGIN:"https://dashboard.test",CORE_ORIGIN:"https://core.test",CORE_SERVICE_TOKEN:"a".repeat(40),SESSION_SECRET:"b".repeat(40),DISCORD_GUILD_ID:"123",DISCORD_CLIENT_ID:"client",DISCORD_CLIENT_SECRET:"private-client-fixture"}))vi.stubEnv(k,v);});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it("signs server-only fetches and disables cache/redirects",async()=>{
  const fetch=vi.fn().mockResolvedValue(new Response('{"ok":true}'));vi.stubGlobal("fetch",fetch);
  expect(await coreData("789","/api/v1/config/123")).toEqual({ok:true});
  expect(fetch.mock.calls[0][0]).toBe("https://core.test/api/v1/config/123");expect(fetch.mock.calls[0][1].cache).toBe("no-store");expect(fetch.mock.calls[0][1].headers["x-conan-actor"]).toBe("789");
  await coreRequest("789","/api/v1/config/123","PUT","{}");expect(fetch.mock.calls[1][1].body).toBe("{}");
  await expect(coreRequest("789","https://evil.test")).rejects.toThrow();await expect(coreRequest("789","/api/v1/../evil")).rejects.toThrow();
  fetch.mockResolvedValue(new Response('{}',{status:503}));await expect(coreData("789","/api/v1/config/123")).rejects.toThrow("503");
});
it("revalidates role authorization and fails closed",async()=>{
  expect(await authorizedIdentity()).toBeNull();await expect(requireIdentity()).rejects.toThrow("redirect:/login");
  state.token=await createSession({id:"789",name:"Staff"},"b".repeat(40));const fetch=vi.fn().mockResolvedValue(new Response('{"allowed":true}'));vi.stubGlobal("fetch",fetch);
  expect(await requireIdentity()).toEqual({id:"789",name:"Staff"});expect(fetch.mock.calls[0][0]).toContain("/auth/check");
  fetch.mockResolvedValue(new Response('{}',{status:403}));expect(await authorizedIdentity()).toBeNull();fetch.mockRejectedValue(new Error("network"));expect(await authorizedIdentity()).toBeNull();
});
