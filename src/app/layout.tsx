import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
export const dynamic="force-dynamic";
export const metadata:Metadata={title:"ConanGrayBot · Control",description:"ConanGrayBot staff management"};
export default async function RootLayout({children}:{children:React.ReactNode}){await headers();return <html lang="en"><body>{children}</body></html>;}
