import { NextRequest, NextResponse } from 'next/server';
import { clearUserCookie } from '@/lib/server/auth';
import { sameOrigin } from '@/lib/server/security';
export async function POST(request: NextRequest) { if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403 }); const response = NextResponse.json({ ok: true }); response.cookies.set(clearUserCookie); return response; }
