import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/server/security';
import { respondToWhatsAppMessage, validWebhookSignature } from '@/lib/server/whatsapp';

export const runtime = 'nodejs';
type Inbound = { from?: string; id?: string; type?: string; text?: { body?: string } };
type WebhookPayload = { entry?: Array<{ changes?: Array<{ value?: { messages?: Inbound[] } }> }> };

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (params.get('hub.mode') === 'subscribe' && params.get('hub.verify_token') === process.env.WHATSAPP_VERIFY_TOKEN) return new NextResponse(params.get('hub.challenge') || '', { status: 200 });
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  if (!rateLimit(request, 'whatsapp-webhook', 120, 60_000)) return NextResponse.json({ error: 'Rate limited.' }, { status: 429 });
  const raw = await request.text();
  if (!validWebhookSignature(raw, request.headers.get('x-hub-signature-256'))) return new NextResponse('Forbidden', { status: 403 });
  try {
    const payload = JSON.parse(raw) as WebhookPayload;
    const messages = payload.entry?.flatMap((entry) => entry.changes?.flatMap((change) => change.value?.messages || []) || []) || [];
    await Promise.all(messages.map(async (message) => { if (message.type === 'text' && message.from && message.id && message.text?.body) await respondToWhatsAppMessage(message.from, message.id, message.text.body.slice(0, 4000)); }));
  } catch { return new NextResponse('Accepted', { status: 200 }); }
  return new NextResponse('Accepted', { status: 200 });
}
