import { NextRequest, NextResponse } from 'next/server';
import { clearAdminCookie } from '@/lib/server/auth';
import { sameOrigin } from '@/lib/server/security';
export async function POST(request: NextRequest) { if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403 }); const response = NextResponse.redirect(new URL('/admin/login', request.url), 303); response.cookies.set(clearAdminCookie); return response; }
