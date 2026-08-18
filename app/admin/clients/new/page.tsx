import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/server/auth';
import { NewClientForm } from '@/components/portal/new-client-form';
import '../../../portal.css';
export default async function NewClientPage() { if (!await getAdminSession()) redirect('/admin/login'); return <main className="portal-page"><header className="portal-header"><a href="/admin">← Outreach+ Admin</a></header><section className="portal-heading narrow"><p className="portal-kicker">New client</p><h1>Create a private workspace.</h1><p>Upload the exported Pomelli brand book. Outreach+ will extract a reviewable Brand Brain on the server.</p></section><NewClientForm /></main>; }
