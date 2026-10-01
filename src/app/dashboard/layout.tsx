import Link from "next/link";
import { requireIdentity } from "@/lib/auth";
import { Navigation } from "@/components/navigation";
export default async function DashboardLayout({children}:{children:React.ReactNode}){const identity=await requireIdentity();return <div className="shell"><aside><Link className="brand" href="/dashboard">CONAN<span>BOT / CONTROL</span></Link><details className="mobile-menu"><summary>Browse sections</summary><Navigation/></details><div className="desktop-nav"><Navigation/></div><div className="identity"><strong>{identity.name}</strong><span className="badge">Staff verified</span><form action="/auth/logout" method="post"><button type="submit">Sign out</button></form></div></aside><main id="main-content">{children}</main></div>;}
