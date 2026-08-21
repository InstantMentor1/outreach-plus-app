import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Outreach+ — Your AI Social Media & Growth Manager', description: 'Outreach+ helps hospitality teams plan, create, approve and improve marketing through a WhatsApp-friendly conversation.' };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
