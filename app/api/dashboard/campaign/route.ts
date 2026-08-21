import { ApiError, GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

import { getUserSession } from '@/lib/server/auth';
import { rateLimit, safeText, sameOrigin } from '@/lib/server/security';
import { supabaseAdmin } from '@/lib/server/supabase';

export const runtime = 'nodejs';
const MODEL = 'gemini-3.6-flash';

export async function POST(request: NextRequest) {
  if (!sameOrigin(request) || !rateLimit(request, 'dashboard-campaign', 8, 10 * 60_000)) return NextResponse.json({ error: 'Please wait a moment before creating another draft.' }, { status: 429 });
  const session = await getUserSession();
  if (!session?.userId) return NextResponse.json({ error: 'Please log in again.' }, { status: 401 });
  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch {}
  const objective = safeText(body.objective, 240);
  if (!objective) return NextResponse.json({ error: 'Choose a campaign objective first.' }, { status: 400 });
  try {
    const db = supabaseAdmin();
    const { data: client } = await db.from('clients').select('id,business_name,business_type,location').eq('owner_user_id', session.userId).maybeSingle();
    if (!client) return NextResponse.json({ error: 'Build your Brand Profile before creating campaigns.' }, { status: 409 });
    const { data: profile } = await db.from('brand_profiles').select('business_summary,target_audience,brand_positioning,tone_of_voice,brand_values,primary_colour,secondary_colours,visual_style,content_guidelines,prohibited_usage,additional_context,reviewed').eq('client_id', client.id).maybeSingle();
    if (!profile?.reviewed) return NextResponse.json({ error: 'Approve your Brand Profile before creating campaigns.' }, { status: 409 });
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'Outreach+ AI is not configured yet.' }, { status: 503 });
    const result = await new GoogleGenAI({ apiKey }).models.generateContent({ model: MODEL, contents: [{ role: 'user', parts: [{ text: `Create one concise, approval-ready hospitality campaign draft for this objective: ${objective}.\n\nBusiness: ${JSON.stringify(client)}\nApproved brand profile: ${JSON.stringify(profile)}\n\nUse only the supplied brand facts. Do not invent menu items, prices, discounts, dates, locations or offer conditions. If a missing fact is essential, clearly label it as an owner decision. Include: campaign idea, audience, suggested offer framework, 2 caption options, 8 relevant hashtags, poster brief, and next approval question. Use Indian English.` }] }], config: { maxOutputTokens: 1_200 } });
    const draft = result.text?.trim();
    if (!draft) return NextResponse.json({ error: 'Outreach+ returned an empty campaign draft. Please retry.' }, { status: 502 });
    return NextResponse.json({ draft });
  } catch (error) {
    if (error instanceof ApiError && error.status === 429) return NextResponse.json({ error: 'Outreach+ is busy. Please try again shortly.' }, { status: 429 });
    if (error instanceof ApiError && [400, 401, 403, 404].includes(error.status || 0)) return NextResponse.json({ error: 'The AI configuration could not create this draft. Please check the configured Gemini model and key.' }, { status: 502 });
    return NextResponse.json({ error: 'Outreach+ could not create that campaign draft. Please try again.' }, { status: 502 });
  }
}
