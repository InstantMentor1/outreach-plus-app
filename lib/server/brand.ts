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
const websiteSchema = { type: 'object', properties: { business_name: { type: ['string', 'null'] }, business_type: { type: ['string', 'null'] }, location: { type: ['string', 'null'] }, ...brandProperties }, required: ['business_name', 'business_type', 'location', ...Object.keys(brandProperties)] };

function aiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini is not configured.');
  return new GoogleGenAI({ apiKey });
}

export async function extractBrandProfile(pdf: Buffer) {
  const response = await aiClient().models.generateContent({ model: MODEL, contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'application/pdf', data: pdf.toString('base64') } }, { text: 'Extract a conservative draft Brand Brain from this Pomelli brand-book PDF. Use only document-supported information. For unknown text fields return null; for unknown lists return []; use extraction_confidence to note confidence and source basis. Never infer missing colours, fonts, audience, rules or claims.' }] }], config: { responseMimeType: 'application/json', responseJsonSchema: schema } });
  if (!response.text) throw new Error('Gemini returned no structured extraction.');
  return JSON.parse(response.text) as BrandProfile;
}

export async function extractWebsiteBrandDraft(website: string, pageText: string) {
  const response = await aiClient().models.generateContent({ model: MODEL, contents: [{ role: 'user', parts: [{ text: `Create a conservative draft brand book from this public website. Website: ${website}\n\nWebsite text:\n${pageText}\n\nUse only explicit information in the text. Do not infer menu items, prices, offers, locations, audiences, brand colours, fonts or claims. Return null or [] when unknown. Treat this as a draft that requires business-owner approval.` }] }], config: { responseMimeType: 'application/json', responseJsonSchema: websiteSchema, maxOutputTokens: 1600 } });
  if (!response.text) throw new Error('Gemini returned no structured brand draft.');
  return JSON.parse(response.text) as WebsiteBrandDraft;
}
