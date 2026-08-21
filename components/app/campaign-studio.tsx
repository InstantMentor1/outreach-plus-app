'use client';

import { useState } from 'react';
import styles from './campaign-studio.module.css';

const choices = ['Increase weekday sales', 'Promote an offer', 'Launch a new product', 'Create a festival campaign', 'Bring back previous customers', 'Promote an event', 'Create this week’s content', 'Start from my own idea'];

export function CampaignStudio({ ready }: { ready: boolean }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');

  async function create(objective: string) {
    if (!ready) return;
    setLoading(objective); setError(''); setDraft('');
    try {
      const response = await fetch('/api/dashboard/campaign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ objective }) });
      const data: { draft?: string; error?: string } = await response.json().catch(() => ({}));
      if (!response.ok || !data.draft) throw new Error(data.error || 'Outreach+ could not create this campaign.');
      setDraft(data.draft);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Outreach+ could not create this campaign.'); }
    finally { setLoading(''); }
  }

  if (!ready) return <><p className="dash-lede">Campaign generation uses your approved Brand Profile so every recommendation follows the right business context.</p><section className="notice"><b>Complete the first step</b><p>Build and approve your Brand Profile to unlock campaign drafts, captions and poster briefs.</p><a className="dash-primary" href="/onboarding">Build Brand Profile</a></section></>;
  return <><p className="dash-lede">Choose an objective. Outreach+ will use your approved Brand Profile to prepare a campaign draft for review.</p><section className="choice-grid">{choices.map((choice) => <button key={choice} type="button" onClick={() => void create(choice)} disabled={Boolean(loading)}>{loading === choice ? 'Preparing campaign...' : choice}<small>{loading === choice ? 'Using your approved Brand Profile' : 'Create a campaign draft'}</small></button>)}</section>{error && <p className="form-error" role="alert">{error}</p>}{draft && <section className={styles.draft} aria-live="polite"><div><p className="app-eyebrow">Outreach+ campaign draft</p><h2>Ready for your review.</h2></div><pre>{draft}</pre><p>Nothing has been published. Confirm final offer details before using this campaign.</p></section>}<section className="notice"><b>What a generated campaign includes</b><p>Campaign direction, suggested audience, captions, hashtags, a poster brief and one clear approval question. It does not publish or spend money automatically.</p></section></>;
}
