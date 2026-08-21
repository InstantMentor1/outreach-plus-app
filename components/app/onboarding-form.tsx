'use client';

import { FormEvent, useState } from 'react';

type Draft = Record<string, unknown> & { business_name?: string | null; business_type?: string | null; location?: string | null; business_summary?: string | null; target_audience?: string | null; tone_of_voice?: string | null; primary_colour?: string | null; visual_style?: unknown; brand_positioning?: string | null; brand_values?: unknown; fonts?: unknown; secondary_colours?: unknown; content_guidelines?: unknown; prohibited_usage?: unknown };

const field = (value: unknown) => typeof value === 'string' ? value : '';
const list = (value: unknown) => Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').slice(0, 6) : [];
const joined = (value: unknown) => list(value).join(', ');

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
    if (response.ok) location.assign('/dashboard/brand-profile');
    else setError(result.error || 'We could not save your approved brand book.');
  }

  if (!draft) return <form className="onboarding-form dna-intro" onSubmit={analyseWebsite}><div className="dna-intro-orbit" /><p className="app-eyebrow">Outreach+ brand intelligence</p><h2>Build the business DNA behind every campaign.</h2><p>Share a public website and Outreach+ will prepare a professional, editable brand book. Nothing is saved or used until the business owner approves it.</p><label>Business website<input name="website" type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://yourbusiness.com" required autoFocus /></label>{analysing && <div className="analysis-progress" role="status"><span>01</span><p><b>Reading your public website</b><small>Finding business details, positioning and visible brand signals.</small></p><span>02</span><p><b>Preparing your Business DNA</b><small>Creating a draft you can edit before approving.</small></p></div>}{error && <p className="form-error" role="alert">{error}</p>}<div className="dna-intro-actions"><button disabled={analysing}>{analysing ? 'Preparing your Business DNA...' : 'Build my Brand Intelligence'}</button><button className="secondary-action" type="button" onClick={() => setDraft({})}>I do not have a website</button></div><p className="dna-footnote">Only public information is used. Outreach+ never invents prices, offers or business claims.</p></form>;

  const style = list(draft.visual_style);
  return <form className="onboarding-form dna-review" onSubmit={saveProfile}><header className="dna-review-header"><div><p className="app-eyebrow">Review and approve</p><h2>Your Business DNA.</h2><p>Refine the draft in your own words. These approved details guide Outreach+ across campaigns, captions and conversations.</p></div><span className="dna-status">Draft ready</span></header><div className="dna-tabs" aria-label="Brand book sections"><span>Brand foundations</span><span>Business details</span><span>Campaign context</span></div><section className="dna-grid"><article className="dna-highlight"><small>BRAND POSITIONING</small><textarea name="positioning" defaultValue={field(draft.brand_positioning)} placeholder="What makes this business distinct?" rows={3} /></article><article><small>BRAND VALUES</small><input name="brandValues" defaultValue={joined(draft.brand_values)} placeholder="Authenticity, hospitality, quality" /><p>Separate values with commas.</p></article><article><small>BRAND AESTHETIC</small><input name="visualStyle" defaultValue={style.join(', ')} placeholder="Modern, premium, locally rooted" /></article><article><small>TONE OF VOICE</small><input name="tone" defaultValue={field(draft.tone_of_voice)} placeholder="Warm, clear and confident" /></article></section><section className="dna-form-section"><div className="dna-section-heading"><p className="app-eyebrow">Business foundations</p><h3>Make the essentials accurate.</h3><p>These details ensure Outreach+ understands your business before making recommendations.</p></div><div className="dna-fields"><label>Business name<input name="businessName" defaultValue={field(draft.business_name)} required /></label><label>Business category<input name="category" defaultValue={field(draft.business_type)} placeholder="Café, restaurant, hotel..." required /></label><label>Location<input name="location" defaultValue={field(draft.location)} placeholder="City, India" required /></label><label>Main customer type<input name="audience" defaultValue={field(draft.target_audience)} placeholder="Families, office-goers, travellers..." required /></label><label className="wide">Business overview<textarea name="brandSummary" defaultValue={field(draft.business_summary)} placeholder="A concise description of the business, food, service or experience." rows={3} /></label></div></section><section className="dna-form-section"><div className="dna-section-heading"><p className="app-eyebrow">Brand expression</p><h3>Make it recognisable.</h3><p>Optional details that keep future marketing visually and verbally consistent.</p></div><div className="dna-fields"><label>Primary colour<input name="primaryColour" defaultValue={field(draft.primary_colour)} placeholder="#008FD5" /></label><label>Supporting colours<input name="secondaryColours" defaultValue={joined(draft.secondary_colours)} placeholder="#D3E9FB, #143954" /></label><label>Preferred fonts<input name="fonts" defaultValue={joined(draft.fonts)} placeholder="e.g. Lexend, Inter" /></label><label>Content direction<input name="contentGuidelines" defaultValue={joined(draft.content_guidelines)} placeholder="e.g. clear offer, local context" /></label><label className="wide">Do not use<textarea name="prohibitedUsage" defaultValue={joined(draft.prohibited_usage)} placeholder="e.g. unapproved discounts, exaggerated claims" rows={2} /></label></div></section><section className="dna-goal"><div><p className="app-eyebrow">Campaign context</p><h3>What should Outreach+ improve first?</h3><p>One clear priority helps the first campaign feel useful from day one.</p></div><label>Current marketing goal<input name="goal" placeholder="Increase weekday bookings" required /></label></section><div className="dna-approval"><div><b>Owner approval keeps you in control.</b><p>Your brand intelligence is saved only after approval and becomes the context for future Outreach+ work.</p></div><button disabled={loading}>{loading ? 'Saving your Brand Intelligence...' : 'Approve Business DNA'}</button></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="secondary-action" type="button" onClick={() => setDraft(null)}>Use a different website</button></form>;
}
