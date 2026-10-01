import { environment } from "@/lib/env";
import { coreData } from "@/lib/core";
import type { ConfigEnvelope } from "@/lib/api";
import { panel } from "@/lib/panels";
import defaults from "../../contracts/defaults.json";
import type { JsonValue } from "@/lib/forms";
import { ConfigEditor } from "./config-editor";
import { Actions } from "./actions";
import { Records } from "./records";
import { ProviderTest } from "./provider-test";
import type { components } from "@/lib/generated";
import { CommandList } from "./command-list";

type Diagnostics = components["schemas"]["Diagnostics"];
async function load<T>(actor: string, path: string): Promise<T | null> {
  try { return await coreData<T>(actor, path); } catch { return null; }
}
function Unavailable() {
  return <section className="card" role="alert"><h2>Core is temporarily unavailable</h2><p>Check the deployment and your staff access, then reload this section.</p></section>;
}
export async function Section({ slug, actor }: { slug: string; actor: string }) {
  const guild = environment().guildId;
  if (!slug) {
    const status = await load<Diagnostics>(actor, "/api/v1/diagnostics");
    if (!status) return <Unavailable />;
    const entries = {
      "Core version": status.version,
      Discord: status.botReady ? "Online" : "Unavailable",
      Commands: status.commandSync,
      Storage: status.store,
      "Google Drive": status.driveConfigured ? "Configured" : "Missing credentials",
      Weather: status.weatherConfigured ? "Configured" : "Missing key",
      ...Object.fromEntries(Object.entries(status.providers).map(([p, v]) => [p, v ? "Configured" : "Missing key"])),
    };
    return <div className="status-grid">{Object.entries(entries).map(([key, value]) => <article className="card" key={key}><p className="muted">{key}</p><strong>{value}</strong></article>)}</div>;
  }
  if (slug === "admin/lifecycle") return <Actions items={[
    { label: "Start bot", operation: "bot/start" }, { label: "Restart bot", operation: "bot/restart" },
    { label: "Shut down bot", operation: "bot/shutdown" }, { label: "Pause AI", operation: "ai/pause" },
    { label: "Resume AI", operation: "ai/resume" },
  ]} />;
  if (slug === "media" || slug === "logs") {
    const data = await load<{ items?: React.ComponentProps<typeof Records>["initial"]; logs?: React.ComponentProps<typeof Records>["initial"]; nextCursor?: string|null }>(actor, `/api/v1/${slug}/${guild}?limit=50`);
    return data ? <Records kind={slug} initial={data.items || data.logs || []} initialCursor={data.nextCursor} /> : <Unavailable />;
  }
  const spec = panel(slug);
  if (!spec) return null;
  const config = await load<ConfigEnvelope>(actor, `/api/v1/config/${guild}`);
  if (!config) return <Unavailable />;
  const commands = slug === "commands" ? await load<{ commands: React.ComponentProps<typeof CommandList>["commands"] }>(actor, `/api/v1/discord/${guild}/commands`) : null;
  return <>
    {slug === "commands" && <>{commands ? <CommandList commands={commands.commands} /> : <Unavailable />}<Actions items={[{ label: "Publish command changes", operation: "sync-commands" }]} /></>}
    {slug === "media/drive" && <Actions items={[{ label: "Test Drive folder", operation: "test-drive" }]} />}
    {slug === "ai/memory" && <Actions items={[{ label: "Clear all conversation memory", operation: "memory/clear", body: { allChannels: true } }]} />}
    {slug === "ai/providers" && <ProviderTest />}
    <ConfigEditor initial={config} section={spec.section} keys={spec.keys} defaults={defaults as JsonValue} />
  </>;
}
