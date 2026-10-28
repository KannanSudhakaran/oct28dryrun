import { useEffect, useRef, useState } from 'react';
import { api } from './api.js';

const SUGGESTIONS = ['Get all customers', 'Find customer named Abdul', 'Add customer Sara, sara@example.com'];

export default function Chat({ onDataChange }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! Ask me about your customers, or tell me to add, update or delete one.' },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const bottom = useRef(null);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, busy]);

  const send = async (text) => {
    const message = text.trim();
    if (!message || busy) return;
    // skip the greeting when sending history; the API expects it to start with a user turn
    const history = messages.slice(1).map(({ role, content }) => ({ role, content }));
    setMessages((m) => [...m, { role: 'user', content: message }]);
    setInput('');
    setBusy(true);
    try {
      const { reply } = await api.chat(message, history);
      setMessages((m) => [...m, { role: 'assistant', content: reply }]);
      onDataChange();
    } catch (e) {
      setMessages((m) => [...m, { role: 'assistant', content: `Error: ${e.message}`, error: true }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="card chat">
      <h2>AI Assistant</h2>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}${m.error ? ' err' : ''}`}>{m.content}</div>
        ))}
        {busy && <div className="msg assistant typing">Thinking…</div>}
        <div ref={bottom} />
      </div>
      <div className="chips">
        {SUGGESTIONS.map((s) => <button key={s} onClick={() => send(s)} disabled={busy}>{s}</button>)}
      </div>
      <form className="composer" onSubmit={(e) => { e.preventDefault(); send(input); }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your customers…" disabled={busy} />
        <button className="primary" type="submit" disabled={busy || !input.trim()}>Send</button>
      </form>
    </section>
  );
}
