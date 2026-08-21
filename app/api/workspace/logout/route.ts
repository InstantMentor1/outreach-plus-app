import { NextRequest, NextResponse } from 'next/server';
import { clearClientCookie } from '@/lib/server/auth';
import { sameOrigin } from '@/lib/server/security';
export async function POST(request: NextRequest) { if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403 }); const response = NextResponse.redirect(new URL('/chat', request.url), 303); response.cookies.set(clearClientCookie); return response; }
