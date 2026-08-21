import 'server-only';

import { GoogleGenAI } from '@google/genai';

export type BrandProfile = Record<string, unknown> & {
  business_summary?: string | null;
  target_audience?: string | null;
  brand_positioning?: string | null;
  tone_of_voice?: string | null;
  primary_colour?: string | null;
  reviewed?: boolean;
};

export type WebsiteBrandDraft = BrandProfile & {
  business_name?: string | null;
  business_type?: string | null;
  location?: string | null;
};

const MODEL = 'gemini-3.6-flash';
const brandProperties = {
  business_summary: { type: ['string', 'null'] }, target_audience: { type: ['string', 'null'] }, brand_positioning: { type: ['string', 'null'] }, tone_of_voice: { type: ['string', 'null'] }, brand_values: { type: 'array', items: { type: 'string' } }, primary_colour: { type: ['string', 'null'] }, secondary_colours: { type: 'array', items: { type: 'string' } }, fonts: { type: 'array', items: { type: 'string' } }, visual_style: { type: 'array', items: { type: 'string' } }, logo_rules: { type: 'array', items: { type: 'string' } }, content_guidelines: { type: 'array', items: { type: 'string' } }, prohibited_usage: { type: 'array', items: { type: 'string' } }, additional_context: { type: 'array', items: { type: 'string' } }, extraction_confidence: { type: 'object', additionalProperties: { type: 'string' } },
};
const schema = { type: 'object', properties: brandProperties, required: Object.keys(brandProperties) };
const websiteProperties = {
  business_name: { type: ['string', 'null'] },
  business_type: { type: ['string', 'null'] },
  location: { type: ['string', 'null'] },
  business_summary: { type: ['string', 'null'] },
  target_audience: { type: ['string', 'null'] },
  brand_positioning: { type: ['string', 'null'] },
  tone_of_voice: { type: ['string', 'null'] },
  primary_colour: { type: ['string', 'null'] },
  secondary_colours: { type: 'array', items: { type: 'string' } },
  fonts: { type: 'array', items: { type: 'string' } },
  visual_style: { type: 'array', items: { type: 'string' } },
  brand_values: { type: 'array', items: { type: 'string' } },
  content_guidelines: { type: 'array', items: { type: 'string' } },
  prohibited_usage: { type: 'array', items: { type: 'string' } },
  additional_context: { type: 'array', items: { type: 'string' } },
  extraction_confidence: { type: 'object', additionalProperties: { type: 'string' } },
};
const websiteSchema = { type: 'object', properties: websiteProperties, required: Object.keys(websiteProperties) };

function aiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini is not configured.');
  return new GoogleGenAI({ apiKey });
}

function publicWebsiteFallback(website: string, pageText: string): WebsiteBrandDraft {
  type Evidence = { title?: string; metadata?: Array<{ key?: string; content?: string }>; fonts?: string[]; structured_data?: unknown[]; visible_text?: string };
  let evidence: Evidence = {};
  try { evidence = JSON.parse(pageText) as Evidence; } catch {}
  const metadata = evidence.metadata || [];
  const meta = (key: string) => metadata.find((item) => item.key === key)?.content || null;
  const flatten = (value: unknown): Record<string, unknown>[] => Array.isArray(value) ? value.flatMap(flatten) : value && typeof value === 'object' ? [value as Record<string, unknown>, ...flatten((value as Record<string, unknown>)['@graph'])] : [];
  const nodes = (evidence.structured_data || []).flatMap(flatten);
  const restaurant = nodes.find((item) => {
    const type = item['@type'];
    return type === 'Restaurant' || (Array.isArray(type) && type.includes('Restaurant'));
  }) || nodes[0] || {};
  const text = evidence.visible_text || pageText;
  const find = (pattern: RegExp) => pattern.exec(text)?.[1]?.trim() || null;
  const businessName = typeof restaurant.name === 'string' ? restaurant.name : evidence.title?.split(/[|\-]/)[0]?.trim() || find(/^(.{2,80}?)(?:\s*[|\-])/);
  const cuisine = typeof restaurant.servesCuisine === 'string' ? restaurant.servesCuisine : null;
  const address = restaurant.address && typeof restaurant.address === 'object' ? restaurant.address as Record<string, unknown> : {};
  const locality = typeof address.addressLocality === 'string' ? address.addressLocality : null;
  const region = typeof address.addressRegion === 'string' ? address.addressRegion : null;
  const description = meta('description') || meta('og:description') || (typeof restaurant.description === 'string' ? restaurant.description : null);
  const areaServed = Array.isArray(restaurant.areaServed) ? restaurant.areaServed.map((item) => typeof item === 'string' ? item : typeof item === 'object' && item && 'name' in item ? String(item.name) : '').filter(Boolean).slice(0, 12) : [];

  return {
    business_name: businessName,
    business_type: cuisine ? `${cuisine} restaurant` : null,
    location: [locality, region].filter(Boolean).join(', ') || null,
    business_summary: description,
    target_audience: null,
    brand_positioning: null,
    tone_of_voice: null,
    primary_colour: meta('theme-color'),
    secondary_colours: [],
    fonts: Array.isArray(evidence.fonts) ? evidence.fonts : [],
    visual_style: [],
    brand_values: [],
    content_guidelines: [],
    prohibited_usage: [],
    additional_context: [`Verified public website: ${website}`, ...(areaServed.length ? [`Publicly listed service areas: ${areaServed.join(', ')}`] : [])],
    extraction_confidence: { source: 'Verified public website metadata, structured data and visible text' },
  };
}

export async function extractBrandProfile(pdf: Buffer) {
  const response = await aiClient().models.generateContent({ model: MODEL, contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'application/pdf', data: pdf.toString('base64') } }, { text: 'Extract a conservative draft Brand Brain from this Pomelli brand-book PDF. Use only document-supported information. For unknown text fields return null; for unknown lists return []; use extraction_confidence to note confidence and source basis. Never infer missing colours, fonts, audience, rules or claims.' }] }], config: { responseMimeType: 'application/json', responseJsonSchema: schema } });
  if (!response.text) throw new Error('Gemini returned no structured extraction.');
  return JSON.parse(response.text) as BrandProfile;
}

export async function extractWebsiteBrandDraft(website: string, pageText: string) {
  try {
    const response = await aiClient().models.generateContent({ model: MODEL, contents: [{ role: 'user', parts: [{ text: `Create a concise, evidence-based draft brand book from this public website evidence. Website: ${website}\n\nWebsite evidence (JSON):\n${pageText}\n\nUse only facts explicitly present in the evidence. Preserve structured business data, public descriptions, listed areas, theme colours and font names when available. Do not infer menu items, prices, offers, locations, audiences, brand colours, fonts or claims. For unverified fields return null or []. Keep every written value concise. This is a draft that requires business-owner approval.` }] }], config: { responseMimeType: 'application/json', responseJsonSchema: websiteSchema, maxOutputTokens: 1_400 } });
    if (!response.text) throw new Error('Gemini returned no structured brand draft.');
    return JSON.parse(response.text) as WebsiteBrandDraft;
  } catch (error) {
    console.warn('[brand] Website AI draft unavailable; using verified website details.', { message: error instanceof Error ? error.message : 'Unknown error' });
    return publicWebsiteFallback(website, pageText);
  }
}
