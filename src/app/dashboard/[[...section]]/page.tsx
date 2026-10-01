import { notFound } from "next/navigation";
import { requireIdentity } from "@/lib/auth";
import { sections } from "@/lib/navigation";
import { Section } from "@/components/section";
export default async function DashboardPage({params}:{params:Promise<{section?:string[]}>}){const slug=(await params).section?.join("/")||"",entry=sections.find(([path])=>path===slug);if(!entry)notFound();const identity=await requireIdentity();return <><header className="page-header"><p className="eyebrow">CONANGRAYBOT / {entry[1].toUpperCase()}</p><h1>{entry[1]}</h1><p className="muted">One server. Every detail under control.</p></header><Section slug={slug} actor={identity.id}/></>;}
