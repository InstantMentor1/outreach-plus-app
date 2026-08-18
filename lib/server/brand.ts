import 'server-only';

import { GoogleGenAI } from '@google/genai';

export type BrandProfile = Record<string, unknown> & { business_summary?: string | null; target_audience?: string | null; brand_positioning?: string | null; tone_of_voice?: string | null; primary_colour?: string | null; reviewed?: boolean };

const MODEL = 'gemini-3.6-flash';
const schema = { type: 'object', properties: {
  business_summary: { type: ['string', 'null'] }, target_audience: { type: ['string', 'null'] }, brand_positioning: { type: ['string', 'null'] }, tone_of_voice: { type: ['string', 'null'] }, brand_values: { type: 'array', items: { type: 'string' } }, primary_colour: { type: ['string', 'null'] }, secondary_colours: { type: 'array', items: { type: 'string' } }, fonts: { type: 'array', items: { type: 'string' } }, visual_style: { type: 'array', items: { type: 'string' } }, logo_rules: { type: 'array', items: { type: 'string' } }, content_guidelines: { type: 'array', items: { type: 'string' } }, prohibited_usage: { type: 'array', items: { type: 'string' } }, additional_context: { type: 'array', items: { type: 'string' } }, extraction_confidence: { type: 'object', additionalProperties: { type: 'string' } }
}, required: ['business_summary', 'target_audience', 'brand_positioning', 'tone_of_voice', 'brand_values', 'primary_colour', 'secondary_colours', 'fonts', 'visual_style', 'logo_rules', 'content_guidelines', 'prohibited_usage', 'additional_context', 'extraction_confidence'] };

export async function extractBrandProfile(pdf: Buffer) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('Gemini is not configured.');
  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({ model: MODEL, contents: [{ role: 'user', parts: [{ inlineData: { mimeType: 'application/pdf', data: pdf.toString('base64') } }, { text: 'Extract a conservative draft Brand Brain from this Pomelli brand-book PDF. Use only document-supported information. For unknown text fields return null; for unknown lists return []; use extraction_confidence to note confidence and source basis. Never infer missing colours, fonts, audience, rules or claims.' }] }], config: { responseMimeType: 'application/json', responseJsonSchema: schema } });
  if (!response.text) throw new Error('Gemini returned no structured extraction.');
  return JSON.parse(response.text) as BrandProfile;
}
