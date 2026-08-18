'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import './chat.css';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const welcomeMessage: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I’m Outreach+, your AI Social and Marketing Manager. Tell me your business name and whether you run a café, restaurant, hotel, resort or cloud kitchen.",
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: text }) => ({ role, content: text })),
        }),
      });
      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok || !data.message) {
        throw new Error(data.error || 'Unable to get a response.');
      }

      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', content: data.message! },
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  function resetChat() {
    setMessages([welcomeMessage]);
    setInput('');
    setError('');
  }

  return (
    <main className="chat-page">
      <section className="chat-shell" aria-label="Outreach+ AI chat">
        <header className="chat-header">
          <a href="/" className="chat-brand" aria-label="Back to Outreach+ home">
            <img src="/assets/outreach-logo-primary.png" alt="Outreach+" />
          </a>
          <div>
            <strong>AI Marketing Manager</strong>
            <span><i /> Online</span>
          </div>
          <button type="button" onClick={resetChat}>Reset chat</button>
        </header>

        <div className="chat-notice">
          Planning and copy are live. Poster generation, publishing and metrics come next.
        </div>

        <div className="chat-messages" aria-live="polite">
          {messages.map((message) => (
            <article className={`chat-message ${message.role}`} key={message.id}>
              <span>{message.role === 'assistant' ? 'O+' : 'You'}</span>
              <p>{message.content}</p>
            </article>
          ))}
          {loading && (
            <article className="chat-message assistant chat-loading">
              <span>O+</span><p>Thinking<i>.</i><i>.</i><i>.</i></p>
            </article>
          )}
          {error && <div className="chat-error" role="alert">{error}</div>}
          <div ref={bottomRef} />
        </div>

        <form className="chat-composer" onSubmit={submit}>
          <label htmlFor="chat-input">Message Outreach+</label>
          <textarea
            id="chat-input"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Example: I run a café in Bengaluru…"
            rows={2}
            maxLength={8_000}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? 'Sending…' : 'Send →'}
          </button>
          <small>Outreach+ can make mistakes. Confirm prices, dates and offers before use.</small>
        </form>
      </section>
    </main>
  );
}
