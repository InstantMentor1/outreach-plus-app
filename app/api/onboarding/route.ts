import { NextRequest, NextResponse } from 'next/server';

import { getUserSession } from '@/lib/server/auth';
import { safeText, sameOrigin } from '@/lib/server/security';
import { supabaseAdmin } from '@/lib/server/supabase';

function errorDetails(error: unknown) {
  if (!error || typeof error !== 'object') return { message: String(error) };
  const value = error as Record<string, unknown>;
  return {
    code: typeof value.code === 'string' ? value.code : undefined,
    message: typeof value.message === 'string' ? value.message : 'Unknown database error',
  };
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return NextResponse.json({ error: 'Invalid request.' }, { status: 403 });

  const session = await getUserSession();
  if (!session) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });

  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
  } catch {}

  const businessName = safeText(body.businessName, 120);
  const category = safeText(body.category, 80);
  const location = safeText(body.location, 120);
  const goal = safeText(body.goal, 200);
  const audience = safeText(body.audience, 200);
  const website = safeText(body.website, 240);
  const instagram = safeText(body.instagram, 120);
  const google = safeText(body.google, 240);
  const tone = safeText(body.tone, 200);

  if (!businessName || !category || !location || !goal || !audience) {
    return NextResponse.json({ error: 'Complete the required business details.' }, { status: 400 });
  }

  try {
    const db = supabaseAdmin();
    const { data: client, error } = await db
      .from('clients')
      .upsert(
        {
          owner_user_id: session.userId,
          business_name: businessName,
          business_type: category,
          location,
          website_url: website || null,
          status: 'ready',
        },
        { onConflict: 'owner_user_id' },
      )
      .select('id')
      .single();

    if (error || !client) throw error ?? new Error('Client record was not returned.');

    const { error: profileError } = await db.from('brand_profiles').upsert(
      {
        client_id: client.id,
        business_summary: `${businessName} is a ${category} in ${location}.`,
        target_audience: audience,
        tone_of_voice: tone || null,
        additional_context: {
          marketing_goal: goal,
          instagram: instagram || null,
          google_business_link: google || null,
          source: 'manual onboarding',
        },
        reviewed: false,
      },
      { onConflict: 'client_id' },
    );

    if (profileError) throw profileError;
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[onboarding] business profile save failed', errorDetails(error));
    return NextResponse.json({ error: 'Your business profile could not be saved. Check the Supabase setup.' }, { status: 500 });
  }
}
