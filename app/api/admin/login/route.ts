import { NextRequest, NextResponse } from 'next/server';
import { adminCookie, validAdminPassword } from '@/lib/server/auth';
import { rateLimit, sameOrigin } from '@/lib/server/security';
export const runtime = 'nodejs';
export async function POST(request: NextRequest) { if (!sameOrigin(request) || !rateLimit(request, 'admin-login', 5, 15 * 60_000)) return NextResponse.json({ error: 'Unable to sign in.' }, { status: 429 }); let body: { password?: unknown } = {}; try { body = await request.json(); } catch {} if (!validAdminPassword(body.password)) return NextResponse.json({ error: 'Unable to sign in.' }, { status: 401 }); const response = NextResponse.json({ ok: true }); response.cookies.set(adminCookie()); return response; }
