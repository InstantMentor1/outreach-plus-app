'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import './chat.css';

type Message = { id: string; role: 'user' | 'assistant'; content: string };
const SESSION_STORAGE_KEY = 'outreach-plus-chat-history';
const welcomeMessage: Message = { id: 'welcome', role: 'assistant', content: 'Hi! I’m Outreach+, your AI Social and Marketing Manager. Tell me your business name and whether you run a café, restaurant, hotel, resort or cloud kitchen.' };

function isStoredMessage(value: unknown): value is Message {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return typeof message.id === 'string' && (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string';
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionReady, setSessionReady] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(isStoredMessage)) setMessages(parsed);
      }
    } catch { window.sessionStorage.removeItem(SESSION_STORAGE_KEY); } finally { setSessionReady(true); }
  }, []);

  useEffect(() => { if (sessionReady) window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages)); }, [messages, sessionReady]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, error]);

  async function send(nextMessages: Message[]) {
    setError(''); setLoading(true);
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: nextMessages.map(({ role, content }) => ({ role, content })) }) });
      const data: { message?: string; error?: string } = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.message !== 'string' || !data.message.trim()) throw new Error(data.error || 'Outreach+ could not respond. Please retry.');
      const reply = data.message;
      setMessages((current) => [...current, { id: crypto.randomUUID(), role: 'assistant', content: reply }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Something went wrong. Please retry your message.');
    } finally { setLoading(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const content = input.trim(); if (!content || loading) return;
    const nextMessages = [...messages, { id: crypto.randomUUID(), role: 'user' as const, content }];
    setMessages(nextMessages); setInput(''); await send(nextMessages);
  }

  function resetChat() { setMessages([welcomeMessage]); setInput(''); setError(''); window.sessionStorage.removeItem(SESSION_STORAGE_KEY); }
  function retry() { if (!loading && messages[messages.length - 1]?.role === 'user') void send(messages); }

  return <main className="chat-page"><section className="chat-shell" aria-label="Outreach+ AI chat">
    <header className="chat-header"><a href="/" className="chat-brand" aria-label="Back to Outreach+ home"><img src="/assets/outreach-logo-primary.png" alt="Outreach+" /></a><div><strong>AI Marketing Manager</strong><span><i /> Ready to help</span></div><button type="button" onClick={resetChat}>Reset chat</button></header>
    <div className="chat-notice"><strong>Public demo:</strong> this chat does not save client memory. Planning and copy are live; poster generation, publishing and metrics come next.</div>
    <div className="chat-messages" aria-live="polite">{messages.map((message) => <article className={`chat-message ${message.role}`} key={message.id}><span>{message.role === 'assistant' ? 'O+' : 'You'}</span><p>{message.content}</p></article>)}{loading && <article className="chat-message assistant chat-loading"><span>O+</span><p>Thinking<i>.</i><i>.</i><i>.</i></p></article>}{error && <div className="chat-error" role="alert"><span>{error}</span><button type="button" onClick={retry} disabled={loading || messages[messages.length - 1]?.role !== 'user'}>Retry</button></div>}<div ref={bottomRef} /></div>
    <form className="chat-composer" onSubmit={submit}><label htmlFor="chat-input">Message Outreach+</label><textarea id="chat-input" value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder="Example: I run a café in Bengaluru…" rows={2} maxLength={4_000} disabled={loading} /><button type="submit" disabled={loading || !input.trim()}>{loading ? 'Sending…' : 'Send →'}</button><small>Outreach+ can make mistakes. Confirm prices, dates and offers before use.</small></form>
  </section></main>;
}
