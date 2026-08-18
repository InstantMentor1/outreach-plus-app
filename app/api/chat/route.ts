import { ApiError, GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const MAX_MESSAGES = 24;
const MAX_MESSAGE_LENGTH = 4_000;
const MAX_CONVERSATION_LENGTH = 24_000;
const MODEL = 'gemini-3.6-flash';

const SYSTEM_INSTRUCTION = `You are Outreach+, a unified AI Social and Marketing Manager for cafés, restaurants, hotels, resorts and cloud kitchens.

Help hospitality business owners develop campaign ideas, content calendars, promotional offers, captions, hashtags and practical marketing recommendations.

For a new business, collect only the missing essentials: business name, business type, location, target audience, brand tone and current marketing goal. Ask no more than two related questions in one reply. Never request information already present in the conversation.

Once sufficient context is available, move from questions to useful campaign work.

Never invent menu items, prices, discounts, dates, locations or offer conditions. Never claim that content was published, scheduled, measured or generated as an image unless a corresponding tool successfully performed that action.

Currently, you may provide strategy, campaign plans, captions, hashtags and written promotional content. You cannot yet publish, schedule, retrieve live metrics or generate poster image files.

Keep responses concise, friendly and practical. Use Indian English and rupee formatting where relevant.`;

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string' && message.content.trim().length > 0 && message.content.length <= MAX_MESSAGE_LENGTH;
}

function errorResponse(error: unknown) {
  const status = error instanceof ApiError
    ? error.status
    : typeof error === 'object' && error && typeof (error as { status?: unknown }).status === 'number'
      ? (error as { status: number }).status
      : undefined;

  if (status === 401 || status === 403 || status === 400) return Response.json({ error: 'The Gemini API key was rejected. Please check the Vercel environment variable.' }, { status: 502 });
  if (status === 404) return Response.json({ error: 'The configured Gemini model is unavailable. Please try again later.' }, { status: 502 });
  if (status === 429) return Response.json({ error: 'Outreach+ is receiving too many requests. Please wait a moment and retry.' }, { status: 429 });
  return Response.json({ error: 'Outreach+ could not reach the AI service. Please try again.' }, { status: 502 });
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return Response.json({ error: 'Outreach+ chat is not configured yet. Please add GEMINI_API_KEY in Vercel.' }, { status: 503 });

  let body: unknown;
  try { body = await request.json(); } catch { return Response.json({ error: 'Please send a valid chat request.' }, { status: 400 }); }

  const messages = body && typeof body === 'object' && Array.isArray((body as { messages?: unknown }).messages) ? (body as { messages: unknown[] }).messages : null;
  if (!messages || messages.length === 0 || messages.length > MAX_MESSAGES || !messages.every(isChatMessage) || messages.reduce((total, message) => total + message.content.length, 0) > MAX_CONVERSATION_LENGTH) {
    return Response.json({ error: 'Please keep your conversation concise and try again.' }, { status: 400 });
  }

  const ai = new GoogleGenAI({ apiKey });
  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: messages.map((message) => ({ role: message.role === 'assistant' ? 'model' : 'user', parts: [{ text: message.content.trim() }] })),
      config: { systemInstruction: SYSTEM_INSTRUCTION, maxOutputTokens: 900 },
    });
    const reply = response.text?.trim();
    if (!reply) return Response.json({ error: 'Outreach+ returned an empty response. Please retry your message.' }, { status: 502 });
    return Response.json({ message: reply });
  } catch (error) {
    return errorResponse(error);
  }
}
