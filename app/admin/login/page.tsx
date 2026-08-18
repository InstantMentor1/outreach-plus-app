import { redirect } from 'next/navigation';
import { getAdminSession } from '@/lib/server/auth';
import { AdminLoginForm } from '@/components/portal/admin-login-form';
import '../../portal.css';
export default async function AdminLogin() { if (await getAdminSession()) redirect('/admin'); return <main className="portal-page"><section className="portal-auth"><a href="/" className="portal-logo">Outreach+</a><p className="portal-kicker">Administrator access</p><h1>Welcome back.</h1><p>Use the administrator password to manage invitation-only client workspaces.</p><AdminLoginForm /></section></main>; }
