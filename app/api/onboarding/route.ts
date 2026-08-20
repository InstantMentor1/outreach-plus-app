import { NextRequest, NextResponse } from 'next/server';

import { getUserSession } from '@/lib/server/auth';
import { safeText, sameOrigin } from '@/lib/server/security';
import { supabaseAdmin } from '@/lib/server/supabase';

function strings(value: unknown, limit = 12) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 240)).filter(Boolean).slice(0, limit) : [];
}

function draftFrom(value: unknown) {
  if (typeof value !== 'string' || value.length > 16_000) return {} as Record<string, unknown>;
  try { const parsed = JSON.parse(value); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {}; } catch { return {}; }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403 });
  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch {}
  const businessName = safeText(body.businessName, 120), category = safeText(body.category, 80), location = safeText(body.location, 120), goal = safeText(body.goal, 200), audience = safeText(body.audience, 200), website = safeText(body.website, 240), instagram = safeText(body.instagram, 120), google = safeText(body.google, 240), tone = safeText(body.tone, 200), draft = draftFrom(body.draft);
  if (!businessName || !category || !location || !goal || !audience) return NextResponse.json({ error: 'Please complete the few details marked as required before approval.' }, { status: 400 });

  try {
    const db = supabaseAdmin();
    const { data: client, error } = await db.from('clients').upsert({ owner_user_id: session.userId, business_name: businessName, business_type: category, location, website_url: website || null, status: 'ready' }, { onConflict: 'owner_user_id' }).select('id').single();
    if (error || !client) throw error ?? new Error('Client record was not returned.');
    const { error: profileError } = await db.from('brand_profiles').upsert({
      client_id: client.id,
      business_summary: safeText(draft.business_summary, 1_000) || `${businessName} is a ${category} in ${location}.`,
      target_audience: audience,
      brand_positioning: safeText(draft.brand_positioning, 600) || null,
      tone_of_voice: tone || safeText(draft.tone_of_voice, 200) || null,
      brand_values: strings(draft.brand_values),
      primary_colour: safeText(draft.primary_colour, 40) || null,
      secondary_colours: strings(draft.secondary_colours, 8),
      fonts: strings(draft.fonts, 8),
      visual_style: strings(draft.visual_style),
      logo_rules: strings(draft.logo_rules),
      content_guidelines: strings(draft.content_guidelines),
      prohibited_usage: strings(draft.prohibited_usage),
      additional_context: { marketing_goal: goal, website: website || null, instagram: instagram || null, google_business_link: google || null, website_signals: strings(draft.additional_context), source: website ? 'approved website draft' : 'manual onboarding' },
      extraction_confidence: draft.extraction_confidence && typeof draft.extraction_confidence === 'object' && !Array.isArray(draft.extraction_confidence) ? draft.extraction_confidence : {},
      reviewed: true,
    }, { onConflict: 'client_id' });
    if (profileError) throw profileError;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[onboarding] business profile save failed', { message: error && typeof error === 'object' && 'message' in error ? String(error.message) : 'Unknown database error' });
    return NextResponse.json({ error: 'Your approved brand book could not be saved. Check the Supabase setup.' }, { status: 500 });
  }
}
