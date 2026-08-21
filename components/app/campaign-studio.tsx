'use client';

import { useState } from 'react';
import { playbookFor } from '@/lib/industry-playbooks';
import styles from './campaign-studio.module.css';

const baseChoices = ['Promote an offer', 'Launch a new product', 'Create a festival campaign', 'Bring back previous customers', 'Promote an event', 'Create this week’s content', 'Start from my own idea'];
const actions = ['Claim offer', 'View menu or service list', 'Book now', 'Order now', 'Join WhatsApp list', 'Leave a review'];

export function CampaignStudio({ ready, businessType }: { ready: boolean; businessType?: string | null }) {
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [customerAction, setCustomerAction] = useState(playbookFor(businessType).action);
  const playbook = playbookFor(businessType);
  const choices = [playbook.goal, ...baseChoices.filter((choice) => choice !== playbook.goal)];

  async function create(objective: string) {
    if (!ready) return;
    setLoading(objective); setError(''); setDraft('');
    try {
      const response = await fetch('/api/dashboard/campaign', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ objective, customerAction }) });
      const data: { draft?: string; error?: string } = await response.json().catch(() => ({}));
      if (!response.ok || !data.draft) throw new Error(data.error || 'Outreach+ could not create this campaign.');
      setDraft(data.draft);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'Outreach+ could not create this campaign.'); }
    finally { setLoading(''); }
  }

  if (!ready) return <><p className="dash-lede">Campaign generation uses your approved Brand Profile so every recommendation follows the right business context.</p><section className="notice"><b>Complete the first step</b><p>Build and approve your Brand Profile to unlock campaign drafts, captions and poster briefs.</p><a className="dash-primary" href="/onboarding">Build Brand Profile</a></section></>;
  return <><p className="dash-lede">{playbook.status === 'available' ? `Your ${playbook.name} campaign playbook is active.` : 'Your specialist playbook is in early access, so Outreach+ will use the general local-business workflow.'} Choose an objective to prepare a campaign draft for review.</p><label className="campaign-action">Customer action <select value={customerAction} onChange={(event) => setCustomerAction(event.target.value)}>{actions.map((action) => <option key={action}>{action}</option>)}</select><small>Smart QR delivery and verified action tracking are coming soon. This selection guides the campaign plan only.</small></label><section className="choice-grid">{choices.map((choice) => <button key={choice} type="button" onClick={() => void create(choice)} disabled={Boolean(loading)}>{loading === choice ? 'Preparing campaign...' : choice}<small>{loading === choice ? 'Using your approved Brand Profile' : 'Create a campaign draft'}</small></button>)}</section>{error && <p className="form-error" role="alert">{error}</p>}{draft && <section className={styles.draft} aria-live="polite"><div><p className="app-eyebrow">Outreach+ campaign draft</p><h2>Ready for your review.</h2></div><pre>{draft}</pre><p>Nothing has been published. Confirm final offer details before using this campaign.</p></section>}<section className="notice"><b>What a generated campaign includes</b><p>Campaign direction, suggested audience, captions, hashtags, a poster brief and one clear approval question. It does not publish, distribute, track redemptions or spend money automatically.</p></section></>;
}
