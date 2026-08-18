import 'server-only';

import { NextRequest } from 'next/server';
import { getAdminSession } from './auth';

const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(request: Request, action: string, limit = 10, windowMs = 60_000) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const key = `${action}:${ip}`;
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.reset <= now) { hits.set(key, { count: 1, reset: now + windowMs }); return true; }
  entry.count += 1;
  return entry.count <= limit;
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return process.env.NODE_ENV !== 'production';
  return origin === request.nextUrl.origin;
}

export function safeText(value: unknown, max = 500) { return typeof value === 'string' ? value.trim().slice(0, max) : ''; }
export function isPdf(file: File) { return file.type === 'application/pdf' && file.size > 0 && file.size <= 15 * 1024 * 1024; }
export async function hasPdfSignature(file: File) { return Buffer.from(await file.slice(0, 5).arrayBuffer()).toString('ascii') === '%PDF-'; }
export async function adminRequest(request: NextRequest) { return sameOrigin(request) && await getAdminSession(); }
