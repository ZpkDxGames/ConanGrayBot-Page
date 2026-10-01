"use client";
import { useState } from "react";
import { api } from "@/lib/api";
import { Confirmation } from "./confirmation";
export function Actions({items}:{items:{label:string;operation:string;body?:unknown}[]}){const [pending,setPending]=useState<(typeof items)[number]|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState("");async function confirm(){if(!pending)return;setBusy(true);try{await api(pending.operation,{method:"POST",body:JSON.stringify(pending.body||{})});setMessage("Action completed");}catch(error){setMessage(error instanceof Error?error.message:"Action failed");}finally{setPending(null);setBusy(false);}}return <section className="card"><div className="row">{items.map(item=><button key={item.operation} disabled={busy} onClick={()=>setPending(item)}>{item.label}</button>)}</div><p role="status">{message}</p>{pending&&<Confirmation title={pending.label+"?"} onConfirm={()=>void confirm()} onCancel={()=>setPending(null)}/>}</section>;}
