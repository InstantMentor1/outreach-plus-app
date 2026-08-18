import 'server-only';
import crypto from 'node:crypto';
import { GoogleGenAI } from '@google/genai';
import { supabaseAdmin } from './supabase';

const MODEL = 'gemini-3.6-flash';

function normalisePhone(value: string) { return value.replace(/\D/g, ''); }
export function validWebhookSignature(rawBody: string, signature?: string | null) {
  const secret = process.env.META_APP_SECRET;
  if (!secret || !signature?.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const actual = signature.slice(7);
  return actual.length === expected.length && crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export async function sendWhatsAppText(to: string, text: string) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) throw new Error('WhatsApp is not configured.');
  const version = process.env.WHATSAPP_GRAPH_API_VERSION || 'v24.0';
  const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages`, { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', to, type: 'text', text: { preview_url: false, body: text.slice(0, 4000) } }) });
  if (!response.ok) throw new Error('WhatsApp delivery failed.');
}

export async function respondToWhatsAppMessage(from: string, externalId: string, text: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini is not configured.');
  const db = supabaseAdmin();
  const phone = normalisePhone(from);
  const { data: client } = await db.from('clients').select('id,business_name').eq('whatsapp_phone', phone).eq('status', 'active').single();
  if (!client) return;
  const { data: duplicate } = await db.from('messages').select('id').eq('external_message_id', externalId).maybeSingle();
  if (duplicate) return;
  const { data: profile } = await db.from('brand_profiles').select('business_summary,target_audience,brand_positioning,tone_of_voice,brand_values,primary_colour,secondary_colours,visual_style,logo_rules,content_guidelines,prohibited_usage,additional_context').eq('client_id', client.id).eq('reviewed', true).single();
  if (!profile) { await sendWhatsAppText(phone, 'Your Outreach+ brand setup is still being reviewed. Our team will confirm when it is ready.'); return; }
  let { data: conversation } = await db.from('conversations').select('id').eq('client_id', client.id).order('updated_at', { ascending: false }).limit(1).maybeSingle();
  if (!conversation) { const { data, error } = await db.from('conversations').insert({ client_id: client.id, title: 'WhatsApp marketing conversation' }).select('id').single(); if (error || !data) throw error; conversation = data; }
  const { data: history } = await db.from('messages').select('role,content').eq('conversation_id', conversation.id).eq('client_id', client.id).order('created_at', { ascending: true }).limit(20);
  const { error: userError } = await db.from('messages').insert({ conversation_id: conversation.id, client_id: client.id, role: 'user', content: text, external_message_id: externalId });
  if (userError) throw userError;
  const ai = new GoogleGenAI({ apiKey });
  const result = await ai.models.generateContent({ model: MODEL, contents: [...(history || []).map((item) => ({ role: item.role === 'assistant' ? 'model' : 'user', parts: [{ text: item.content }] })), { role: 'user', parts: [{ text }] }], config: { systemInstruction: `You are Outreach+, the WhatsApp marketing manager for ${client.business_name}. This approved Brand Brain is your persistent context: ${JSON.stringify(profile)}. Do not ask for information already stored. Ask only for campaign-specific missing details such as offer, date, channel or objective, no more than two related questions. Never invent prices, discounts, menu items, dates, locations or conditions. You can provide strategy, captions, hashtags and written campaign plans. Poster generation, publishing and live metrics are not enabled. Keep replies concise, practical and in Indian English for WhatsApp.`, maxOutputTokens: 900 } });
  const reply = result.text?.trim() || 'I could not prepare that just now. Please send it again in a moment.';
  await db.from('messages').insert({ conversation_id: conversation.id, client_id: client.id, role: 'assistant', content: reply });
  await db.from('conversations').update({ updated_at: new Date().toISOString() }).eq('id', conversation.id).eq('client_id', client.id);
  await sendWhatsAppText(phone, reply);
}
