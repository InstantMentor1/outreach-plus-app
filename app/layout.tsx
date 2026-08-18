import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Outreach+ — Your AI Marketing Manager for Hospitality', description: 'Outreach+ helps hospitality teams plan, create, publish and improve marketing through WhatsApp.' };
export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
