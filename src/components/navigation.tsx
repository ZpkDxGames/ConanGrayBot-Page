"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect,useRef,useState } from "react";
import { sections } from "@/lib/navigation";
export function Navigation(){const path=usePathname(),[filter,setFilter]=useState(""),input=useRef<HTMLInputElement>(null);useEffect(()=>{const key=(event:KeyboardEvent)=>{if((event.ctrlKey||event.metaKey)&&event.key==="k"){event.preventDefault();input.current?.focus();}};window.addEventListener("keydown",key);return()=>window.removeEventListener("keydown",key);},[]);return <nav aria-label="Management sections"><label className="sr-only" htmlFor="section-search">Find a section</label><input ref={input} id="section-search" type="search" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Find a section · Ctrl K"/>{sections.filter(([,name])=>name.toLowerCase().includes(filter.toLowerCase())).map(([slug,name])=><Link key={slug} href={"/dashboard"+(slug?"/"+slug:"")} aria-current={path==="/dashboard"+(slug?"/"+slug:"")?"page":undefined}>{name}</Link>)}</nav>;}
