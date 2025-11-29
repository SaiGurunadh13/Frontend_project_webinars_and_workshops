import React, { useState, useEffect } from "react";
import { addMessage, loadMessages } from '../data/store';

export default function Contact() {
  const [msg, setMsg] = useState("");
  const [filterEmail, setFilterEmail] = useState(() => localStorage.getItem('lastContactEmail') || '');
  const [myMessages, setMyMessages] = useState([]);

  useEffect(() => {
    function onMessages() {
      const all = loadMessages();
      const username = localStorage.getItem('currentUser');
      const email = filterEmail;
      const filtered = all.filter(m => (username && m.username === username) || (email && m.email === email));
      setMyMessages(filtered);
    }
    window.addEventListener('messagesUpdated', onMessages);
    onMessages();
    return () => window.removeEventListener('messagesUpdated', onMessages);
  }, [filterEmail]);
  function handleSubmit(e) {
    e.preventDefault();
    (async () => {
      const fd = new FormData(e.target);
      const email = fd.get('email') || '';
      const payload = {
        name: fd.get('name') || '',
        email,
        reason: fd.get('reason') || '',
        message: fd.get('message') || '',
        username: localStorage.getItem('currentUser') || ''
      };
      const saved = await addMessage(payload);
      if (saved) {
        setMsg("Thanks! We received your message.");
        e.target.reset();
        localStorage.setItem('lastContactEmail', email);
        setFilterEmail(email);
      } else {
        setMsg('Failed to send message. Please try again.');
      }
    })();
  }
  return (
    <section className="contact">
      <div className="card" style={{ padding: 18 }}>
        <h2>Contact / Register Interest</h2>
        <form id="contactForm" onSubmit={handleSubmit}>
          <input className="input" name="name" placeholder="Your name" required />
          <input className="input" type="email" name="email" placeholder="Email" required />
          <select name="reason" className="input" required defaultValue="">
            <option value="" disabled>
              I'm interested in…
            </option>
            <option>Registering for a webinar/workshop</option>
            <option>Inviting you to speak</option>
            <option>Project collaboration</option>
          </select>
          <textarea className="input" name="message" placeholder="Message (optional)"></textarea>
          <button className="btn primary" type="submit">Send</button>
          {msg && <div className="muted" style={{ display: "block" }}>{msg}</div>}
        </form>
          {filterEmail || localStorage.getItem('currentUser') ? (
            <div style={{ marginTop: 18 }}>
              <h3>Your Messages & Replies</h3>
              {myMessages.length ? (
                <div style={{ display: 'grid', gap: 8 }}>
                  {myMessages.map(m => (
                    <div key={m.id} className="card" style={{ padding: 12 }}>
                      <div style={{ fontSize: '0.85em', color: 'var(--muted)' }}>{new Date(m.timestamp).toLocaleString()} • {m.reason}</div>
                      <div style={{ fontWeight: 700 }}>{m.name} • {m.email}</div>
                      <div className="muted" style={{ marginTop: 6 }}>{m.message || <span className="muted">(no message)</span>}</div>
                      {m.reply ? (
                        <div style={{ marginTop: 10, padding: 10, background: 'rgba(0,0,0,0.03)', borderRadius: 6 }}>
                          <div style={{ fontSize: '0.85em', color: 'var(--muted)' }}>Reply • {new Date(m.reply.timestamp).toLocaleString()} by {m.reply.by}</div>
                          <div style={{ marginTop: 6 }}>{m.reply.text}</div>
                        </div>
                      ) : (
                        <div className="muted" style={{ marginTop: 8 }}>No reply yet.</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="muted" style={{ marginTop: 8 }}>No messages yet for this account/email.</div>
              )}
            </div>
          ) : null}
      </div>
    </section>
  );
}