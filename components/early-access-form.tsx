'use client';

import { FormEvent, useState } from 'react';

export default function EarlyAccessForm({ industry }: { industry?: string }) {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setMessage(''); setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch('/api/early-access', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, industry }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'We could not save your request.');
      setMessage('You are on the early-access list. We will email you when your playbook is ready.');
      event.currentTarget.reset();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'We could not save your request.'); }
    finally { setLoading(false); }
  }

  return <form className="early-access-form" onSubmit={submit}><label>Business name<input name="businessName" required placeholder="Your business name" /></label><label>Work email<input name="email" type="email" required placeholder="you@business.com" /></label><label>Business website <span>Optional</span><input name="website" type="url" placeholder="https://yourbusiness.com" /></label><button className="local-primary" disabled={loading}>{loading ? 'Joining...' : 'Join early access'}</button>{message && <p className="early-success" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}</form>;
}
