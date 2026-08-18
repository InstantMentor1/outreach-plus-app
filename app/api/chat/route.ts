type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const SYSTEM_INSTRUCTION = `You are Outreach+, a unified AI Social and Marketing Manager for cafes, restaurants, hotels, resorts and cloud kitchens.

Your job is to help hospitality business owners develop campaign ideas, content calendars, promotional offers, captions, hashtags and practical marketing recommendations.

For a new business, collect only the missing essentials: business name, business type, location, target audience, brand tone and current marketing goal. Ask no more than two related questions in one reply. Never ask again for information already present in the conversation.

Once enough context is available, move from questions to useful work. Provide concrete campaign recommendations and clearly label any assumptions that require confirmation.

Never invent menu items, prices, discounts, dates, locations or offer conditions. Never claim that a post, campaign or message has been generated as an image, published, scheduled or measured unless an enabled tool has completed that action. At present you can plan campaigns and write text, but you cannot publish, schedule, retrieve live metrics or generate image files.

Keep responses concise, friendly and practical for a small-business owner in India. Use Indian English and rupee formatting when relevant.`;

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return (
    (message.role === 'user' || message.role === 'assistant') &&
    typeof message.content === 'string' &&
    message.content.trim().length > 0 &&
    message.content.length <= 8_000
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: 'The AI service is not configured yet.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const messages =
    body && typeof body === 'object' && Array.isArray((body as { messages?: unknown }).messages)
      ? (body as { messages: unknown[] }).messages
      : null;

  if (!messages || messages.length === 0 || messages.length > 30 || !messages.every(isChatMessage)) {
    return Response.json({ error: 'Please send a valid conversation.' }, { status: 400 });
  }

  const contents = messages.map((message) => ({
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  }));

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
          contents,
          generationConfig: {
            temperature: 0.6,
            maxOutputTokens: 900,
          },
        }),
      },
    );

    const data = (await response.json()) as {
      error?: { message?: string };
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };

    if (!response.ok) {
      console.error('Gemini API error:', response.status, data.error?.message);
      return Response.json(
        { error: 'Outreach+ could not respond right now. Please try again.' },
        { status: 502 },
      );
    }

    const reply = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || '')
      .join('')
      .trim();

    if (!reply) {
      return Response.json(
        { error: 'Outreach+ returned an empty response. Please try again.' },
        { status: 502 },
      );
    }

    return Response.json({ message: reply });
  } catch (error) {
    console.error('Chat request failed:', error);
    return Response.json(
      { error: 'Outreach+ could not connect to the AI service.' },
      { status: 502 },
    );
  }
}
