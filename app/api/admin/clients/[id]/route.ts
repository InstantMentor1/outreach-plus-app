import { NextRequest, NextResponse } from 'next/server';
import { adminRequest, safeText } from '@/lib/server/security';
import { supabaseAdmin } from '@/lib/server/supabase';

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!await adminRequest(request)) return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 });
  const { id } = await context.params;
  let body: { profile?: Record<string, unknown> } = {};
  try { body = await request.json(); } catch {}
  if (!body.profile) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const profile = { business_summary: safeText(body.profile.business_summary, 2000) || null, target_audience: safeText(body.profile.target_audience, 1200) || null, brand_positioning: safeText(body.profile.brand_positioning, 1200) || null, tone_of_voice: safeText(body.profile.tone_of_voice, 800) || null, primary_colour: safeText(body.profile.primary_colour, 80) || null, reviewed: false };
  try { const { error } = await supabaseAdmin().from('brand_profiles').upsert({ client_id: id, ...profile }, { onConflict: 'client_id' }); if (error) throw error; return NextResponse.json({ message: 'Draft Brand Brain saved. Review it before inviting the client.' }); } catch { return NextResponse.json({ error: 'The Brand Brain could not be saved.' }, { status: 500 }); }
}
