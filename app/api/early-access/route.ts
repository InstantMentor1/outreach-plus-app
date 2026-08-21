import { NextRequest, NextResponse } from 'next/server';

import { rateLimit, safeText, sameOrigin } from '@/lib/server/security';
import { supabaseAdmin } from '@/lib/server/supabase';

export const runtime = 'nodejs';

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character] || character)); }

async function sendEmail(to: string, subject: string, html: string, idempotencyKey: string) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EARLY_ACCESS_FROM_EMAIL;
  if (!key || !from) return false;
  const response = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ from, to, subject, html }) });
  return response.ok;
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request) || !rateLimit(request, 'early-access', 5, 10 * 60_000)) return NextResponse.json({ error: 'Please wait a moment before trying again.' }, { status: 429 });
  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Please complete the form and try again.' }, { status: 400 }); }
  const businessName = safeText(body.businessName, 120);
  const email = safeText(body.email, 254).toLowerCase();
  const website = safeText(body.website, 500);
  const industry = safeText(body.industry, 100) || 'General local business';
  if (!businessName || !emailPattern.test(email)) return NextResponse.json({ error: 'Enter a business name and valid work email.' }, { status: 400 });
  if (website && !/^https?:\/\//i.test(website)) return NextResponse.json({ error: 'Add a complete website URL starting with https://.' }, { status: 400 });
  try {
    const db = supabaseAdmin();
    const { data, error } = await db.from('early_access_requests').upsert({ business_name: businessName, email, website_url: website || null, industry }, { onConflict: 'email,industry' }).select('id').single();
    if (error || !data) throw error || new Error('No confirmation received from the database.');
    const safeName = escapeHtml(businessName); const safeIndustry = escapeHtml(industry); const safeWebsite = escapeHtml(website || 'Not provided');
    await Promise.allSettled([
      sendEmail(email, 'You are on the Outreach+ early-access list', `<main style="font-family:Arial,sans-serif;color:#143954"><h1>Thanks for joining, ${safeName}.</h1><p>You are on the waiting list for the ${safeIndustry} Outreach+ playbook.</p><p>We will email you when early access is ready. No account has been created and no action is needed from you today.</p></main>`, `early-access-confirmation-${data.id}`),
      process.env.EARLY_ACCESS_TEAM_EMAIL ? sendEmail(process.env.EARLY_ACCESS_TEAM_EMAIL, `New Outreach+ early-access request: ${safeName}`, `<main style="font-family:Arial,sans-serif"><p><b>Business:</b> ${safeName}</p><p><b>Email:</b> ${escapeHtml(email)}</p><p><b>Industry:</b> ${safeIndustry}</p><p><b>Website:</b> ${safeWebsite}</p></main>`, `early-access-team-${data.id}`) : Promise.resolve(false),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'We could not save your early-access request. Please try again shortly.' }, { status: 503 });
  }
}
