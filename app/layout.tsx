import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Outreach+ — AI Campaign Manager for Local Businesses', description: 'Outreach+ turns business goals into ready-to-launch campaigns, starting with hospitality.' };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
