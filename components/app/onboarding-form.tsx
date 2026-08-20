'use client';

import { FormEvent, useState } from 'react';

type Draft = Record<string, unknown> & { business_name?: string | null; business_type?: string | null; location?: string | null; business_summary?: string | null; target_audience?: string | null; tone_of_voice?: string | null; primary_colour?: string | null; visual_style?: unknown };

const field = (value: unknown) => typeof value === 'string' ? value : '';
const list = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 4) : [];

export function OnboardingForm() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [website, setWebsite] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysing, setAnalysing] = useState(false);

  async function analyseWebsite(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setAnalysing(true);
    const response = await fetch('/api/onboarding/website', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ website }) });
    const result = await response.json().catch(() => ({}));
    setAnalysing(false);
    if (!response.ok) return setError(result.error || 'We could not analyse that website.');
    setWebsite(result.website || website);
    setDraft(result.draft || {});
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch('/api/onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, website, draft: JSON.stringify(draft || {}) }) });
    const result = await response.json().catch(() => ({}));
    setLoading(false);
    if (response.ok) location.assign('/dashboard');
    else setError(result.error || 'We could not save your approved brand book.');
  }

  if (!draft) return <form className="onboarding-form website-first" onSubmit={analyseWebsite}><p className="app-eyebrow">Website-first setup</p><h2>Start with your website.</h2><p>Outreach+ will turn public website information into a draft brand book. You review it before anything is saved.</p><label>Business website<input name="website" type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://yourbusiness.com" required autoFocus /></label><div className="notice"><b>What we use</b><p>Only public text from the page you share. Outreach+ does not invent offers, prices, brand rules or details that are not on the website.</p></div>{error && <p className="form-error" role="alert">{error}</p>}<button disabled={analysing}>{analysing ? 'Creating your draft...' : 'Create draft brand book'}</button><button className="secondary-action" type="button" onClick={() => setDraft({})}>I do not have a website</button></form>;

  const style = list(draft.visual_style);
  return <form className="onboarding-form brand-review" onSubmit={saveProfile}><p className="app-eyebrow">Review and approve</p><h2>Your draft brand book.</h2><p>Confirm the website findings below. Only the details marked required need your input if they were not available on the site.</p><div className="brand-book-preview"><div><small>BUSINESS SUMMARY</small><p>{field(draft.business_summary) || 'No clear business summary was found. Add the essentials below.'}</p></div><div><small>BRAND VOICE</small><p>{field(draft.tone_of_voice) || 'Not found on the website'}</p></div><div><small>VISUAL DIRECTION</small><p>{style.length ? style.join(' · ') : 'Not found on the website'}</p></div><div><small>PRIMARY COLOUR</small><p>{field(draft.primary_colour) || 'Not confirmed'}</p></div></div><section><h3>Complete the essentials</h3><label>Business name<input name="businessName" defaultValue={field(draft.business_name)} required /></label><label>Business category<input name="category" defaultValue={field(draft.business_type)} placeholder="Café, restaurant, hotel..." required /></label><label>Location<input name="location" defaultValue={field(draft.location)} placeholder="City, India" required /></label><label>Main customer type<input name="audience" defaultValue={field(draft.target_audience)} placeholder="Who do you want to attract?" required /></label><label>Current marketing goal<input name="goal" placeholder="Increase weekday bookings" required /></label><label>Brand tone <span>(optional)</span><input name="tone" defaultValue={field(draft.tone_of_voice)} placeholder="Warm, premium, local..." /></label></section><div className="notice"><b>Approval means control</b><p>Your draft is saved only when you approve it. You can revise the saved brand book later before using it for campaign planning or content.</p></div>{error && <p className="form-error" role="alert">{error}</p>}<button disabled={loading}>{loading ? 'Saving your brand book...' : 'Approve and save brand book'}</button><button className="secondary-action" type="button" onClick={() => setDraft(null)}>Use a different website</button></form>;
}
