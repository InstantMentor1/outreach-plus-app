import 'server-only';

import crypto from 'node:crypto';
import { cookies } from 'next/headers';

const ADMIN_COOKIE = 'outreach_admin';
const CLIENT_COOKIE = 'outreach_client';
const USER_COOKIE = 'outreach_user';
const HOUR = 60 * 60;

type Session = { role: 'admin' | 'client' | 'user'; clientId?: string; userId?: string; email?: string; exp: number };

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error('Session configuration is unavailable.');
  return value;
}

function encode(value: Buffer | string) { return Buffer.from(value).toString('base64url'); }
function decode(value: string) { return Buffer.from(value, 'base64url').toString('utf8'); }

function sign(value: string) { return encode(crypto.createHmac('sha256', secret()).update(value).digest()); }
function token(session: Session) { const payload = encode(JSON.stringify(session)); return `${payload}.${sign(payload)}`; }

function verify(value?: string): Session | null {
  if (!value) return null;
  const [payload, signature] = value.split('.');
  if (!payload || !signature) return null;
  const expected = sign(payload);
  const received = Buffer.from(signature);
  const actual = Buffer.from(expected);
  if (received.length !== actual.length || !crypto.timingSafeEqual(received, actual)) return null;
  try {
    const session = JSON.parse(decode(payload)) as Session;
    return session.exp > Math.floor(Date.now() / 1000) ? session : null;
  } catch { return null; }
}

const options = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/', priority: 'high' as const };

export async function getAdminSession() { return verify((await cookies()).get(ADMIN_COOKIE)?.value)?.role === 'admin'; }
export async function getClientSession() { const session = verify((await cookies()).get(CLIENT_COOKIE)?.value); return session?.role === 'client' && session.clientId ? session : null; }
export async function getUserSession() { const session = verify((await cookies()).get(USER_COOKIE)?.value); return session?.role === 'user' && session.userId ? session : null; }
export function adminCookie() { return { name: ADMIN_COOKIE, value: token({ role: 'admin', exp: Math.floor(Date.now() / 1000) + 8 * HOUR }), options: { ...options, maxAge: 8 * HOUR } }; }
export function clientCookie(clientId: string) { return { name: CLIENT_COOKIE, value: token({ role: 'client', clientId, exp: Math.floor(Date.now() / 1000) + 30 * 24 * HOUR }), options: { ...options, maxAge: 30 * 24 * HOUR } }; }
export function userCookie(userId: string, email?: string) { return { name: USER_COOKIE, value: token({ role: 'user', userId, email, exp: Math.floor(Date.now() / 1000) + 7 * 24 * HOUR }), options: { ...options, maxAge: 7 * 24 * HOUR } }; }
export const clearAdminCookie = { name: ADMIN_COOKIE, value: '', options: { ...options, maxAge: 0 } };
export const clearClientCookie = { name: CLIENT_COOKIE, value: '', options: { ...options, maxAge: 0 } };
export const clearUserCookie = { name: USER_COOKIE, value: '', options: { ...options, maxAge: 0 } };

export function validAdminPassword(password: unknown) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || typeof password !== 'string') return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function hashInvitation(tokenValue: string) { return crypto.createHash('sha256').update(tokenValue).digest('hex'); }
export function invitationToken() { return crypto.randomBytes(32).toString('base64url'); }
