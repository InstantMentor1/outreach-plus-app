import dns from 'node:dns/promises';
import net from 'node:net';

import { NextRequest, NextResponse } from 'next/server';

import { getUserSession } from '@/lib/server/auth';
import { extractWebsiteBrandDraft } from '@/lib/server/brand';
import { rateLimit, safeText, sameOrigin } from '@/lib/server/security';

export const runtime = 'nodejs';

function isPrivateAddress(address: string) {
  if (net.isIP(address) === 4) return /^(10\.|127\.|0\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(address);
  const value = address.toLowerCase();
  return value === '::1' || value.startsWith('fc') || value.startsWith('fd') || value.startsWith('fe80:');
}

async function publicWebsite(value: string) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.port || url.hostname === 'localhost' || url.hostname.endsWith('.local')) throw new Error('Please use a public website URL.');
  const records = await dns.lookup(url.hostname, { all: true });
  if (!records.length || records.some((record) => isPrivateAddress(record.address))) throw new Error('Please use a public website URL.');
  return url;
}

function decodeHtml(value: string) {
  return value.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

function readableText(html: string) {
  const title = [...html.matchAll(/<title[^>]*>([\s\S]*?)<\/title>/gi)].map((match) => match[1]);
  const metadata = [...html.matchAll(/<meta\b[^>]*(?:name|property)=["'][^"']+["'][^>]*content=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
  const structuredData = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].map((match) => match[1]);
  const bodyText = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ');

  return decodeHtml([...title, ...metadata, ...structuredData, bodyText].join(' ')).replace(/\s+/g, ' ').trim().slice(0, 24_000);
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request) || !rateLimit(request, 'website-brand-draft', 3, 15 * 60_000)) return NextResponse.json({ error: 'Please wait before analysing another website.' }, { status: 429 });
  if (!await getUserSession()) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch {}
  const website = safeText(body.website, 240);
  if (!website) return NextResponse.json({ error: 'Enter your public website URL.' }, { status: 400 });

  try {
    const url = await publicWebsite(website);
    const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(12_000), headers: { 'User-Agent': 'OutreachPlusBrandBook/1.0' } });
    const type = response.headers.get('content-type') || '';
    const length = Number(response.headers.get('content-length') || 0);
    if (!response.ok || !type.includes('text/html') || length > 1_000_000) throw new Error('The website could not be read.');
    const text = readableText(await response.text());
    if (text.length < 120) throw new Error('The website did not contain enough public information.');
    const draft = await extractWebsiteBrandDraft(url.toString(), text);
    return NextResponse.json({ website: url.toString(), draft });
  } catch (error) {
    console.error('[onboarding] website brand draft failed', { message: error instanceof Error ? error.message : 'Unknown error' });
    return NextResponse.json({ error: error instanceof Error && error.message.startsWith('Please use') ? error.message : 'We could not create a draft from that website. You can continue by entering the details manually.' }, { status: 422 });
  }
}
