import React, { useEffect, useState } from 'react';
import { loadWebinars, saveWebinars, loadMessages, saveMessages, replyMessage } from '../data/store';

export default function Admin() {
  const [list, setList] = useState(() => loadWebinars());
  const [users, setUsers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('users') || '[]'); } catch(e){ return []; }
  });
  const [registrations, setRegistrations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('registrations') || '[]'); } catch(e){ return []; }
  });
  const [messages, setMessages] = useState(() => loadMessages());
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [form, setForm] = useState({ title: '', date: '', time: '', duration: '', tag: '', status: 'upcoming', desc: '' });

  useEffect(() => {
    function onUpdate() {
      setList(loadWebinars());
    }
    function onUsers() {
      setUsers(JSON.parse(localStorage.getItem('users') || '[]'));
    }
    function onRegs() {
      setRegistrations(JSON.parse(localStorage.getItem('registrations') || '[]'));
    }
    function onMessages() {
      setMessages(loadMessages());
    }
    window.addEventListener('webinarsUpdated', onUpdate);
    window.addEventListener('usersUpdated', onUsers);
    window.addEventListener('registrationsUpdated', onRegs);
    window.addEventListener('messagesUpdated', onMessages);

    // If an API is configured, fetch initial data from it to replace local caches
    (async () => {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      if (!API_BASE) return;
      try {
        const [uRes, rRes, mRes] = await Promise.all([
          fetch(`${API_BASE}/api/users`),
          fetch(`${API_BASE}/api/registrations`),
          fetch(`${API_BASE}/api/messages`)
        ]);
        if (uRes.ok) setUsers(await uRes.json());
        if (rRes.ok) setRegistrations(await rRes.json());
        if (mRes.ok) setMessages(await mRes.json());
      } catch (e) {
        // ignore network errors; keep using localStorage
      }
    })();

    return () => {
      window.removeEventListener('webinarsUpdated', onUpdate);
      window.removeEventListener('usersUpdated', onUsers);
      window.removeEventListener('registrationsUpdated', onRegs);
      window.removeEventListener('messagesUpdated', onMessages);
    };
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function handleAdd(e) {
    e.preventDefault();
    const existing = loadWebinars();
    const maxId = existing.reduce((m, x) => Math.max(m, x.id || 0), 0);
    const item = { ...form, id: maxId + 1 };
    const next = [item, ...existing];
    saveWebinars(next);
    setForm({ title: '', date: '', time: '', duration: '', tag: '', status: 'upcoming', desc: '' });
    setList(next);
  }

  function handleDelete(id) {
    if (!confirm('Delete this webinar?')) return;
    const next = loadWebinars().filter((w) => w.id !== id);
    saveWebinars(next);
    setList(next);
  }

  function handleDeleteUser(username) {
    if (!confirm(`Delete user ${username}?`)) return;
    (async () => {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      if (API_BASE) {
        try {
          const res = await fetch(`${API_BASE}/api/users/${encodeURIComponent(username)}`, { method: 'DELETE' });
          if (res.ok) {
            const next = (await fetch(`${API_BASE}/api/users`).then(r => r.ok ? r.json() : []));
            setUsers(next);
            return;
          }
        } catch (e) {
          // fallback to local
        }
      }
      const raw = localStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      const next = users.filter(u => u.username !== username);
      localStorage.setItem('users', JSON.stringify(next));
      window.dispatchEvent(new Event('usersUpdated'));
      setUsers(next);
    })();
  }

  function handleDeleteRegistration(id) {
    if (!confirm('Remove this registration?')) return;
    (async () => {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      if (API_BASE) {
        try {
          const res = await fetch(`${API_BASE}/api/registrations/${encodeURIComponent(id)}`, { method: 'DELETE' });
          if (res.ok) {
            const next = await fetch(`${API_BASE}/api/registrations`).then(r => r.ok ? r.json() : []);
            setRegistrations(next);
            return;
          }
        } catch (e) {}
      }
      const raw = localStorage.getItem('registrations');
      const regs = raw ? JSON.parse(raw) : [];
      const next = regs.filter(r => r.id !== id);
      localStorage.setItem('registrations', JSON.stringify(next));
      window.dispatchEvent(new Event('registrationsUpdated'));
      setRegistrations(next);
    })();
  }

  function handleDeleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    (async () => {
      const API_BASE = import.meta.env.VITE_API_URL || '';
      if (API_BASE) {
        try {
          const res = await fetch(`${API_BASE}/api/messages/${encodeURIComponent(id)}`, { method: 'DELETE' });
          if (res.ok) {
            const next = await fetch(`${API_BASE}/api/messages`).then(r => r.ok ? r.json() : []);
            setMessages(next);
            return;
          }
        } catch (e) {}
      }
      const next = messages.filter(m => m.id !== id);
      saveMessages(next);
      setMessages(next);
    })();
  }

  function startReply(id, existing) {
    setReplyingId(id);
    setReplyText(existing?.reply?.text || '');
  }

  function cancelReply() {
    setReplyingId(null);
    setReplyText('');
  }

  function sendReply(id) {
    (async () => {
      const payload = { text: replyText, by: 'admin' };
      const res = await replyMessage(id, payload);
      if (res && res.ok) {
        // If API is configured replyMessage already updated local cache; fetch latest
        const API_BASE = import.meta.env.VITE_API_URL || '';
        if (API_BASE) {
          try {
            const all = await fetch(`${API_BASE}/api/messages`).then(r => r.ok ? r.json() : []);
            setMessages(all);
          } catch (e) {}
        } else {
          setMessages(loadMessages());
        }
        cancelReply();
      } else {
        alert('Failed to send reply');
      }
    })();
  }

  return (
    <section style={{ padding: 24 }}>
      <div className="section-head">
        <div>
          <h2>Admin — Manage Webinars</h2>
          <div className="muted">Add or remove webinars. Changes persist in your browser (localStorage).</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 18 }}>
        <div className="card" style={{ padding: 18 }}>
          <h3>Add Webinar / Workshop</h3>
          <form onSubmit={handleAdd} style={{ display: 'grid', gap: 10 }}>
            <input className="input" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
            <input className="input" name="date" type="date" value={form.date} onChange={handleChange} />
            <input className="input" name="time" placeholder="Time (e.g., 6:00 PM)" value={form.time} onChange={handleChange} />
            <input className="input" name="duration" placeholder="Duration (e.g., 90 min)" value={form.duration} onChange={handleChange} />
            <input className="input" name="tag" placeholder="Tag (Web, JavaScript, AI/ML, Career)" value={form.tag} onChange={handleChange} />
            <select className="input" name="status" value={form.status} onChange={handleChange}>
              <option value="upcoming">upcoming</option>
              <option value="live">live</option>
              <option value="past">past</option>
            </select>
            <textarea className="input" name="desc" placeholder="Short description" value={form.desc} onChange={handleChange} />
            <button className="btn primary" type="submit">Add</button>
          </form>
        </div>

        <div>
          <h3>Existing</h3>
          <div className="grid">
            {list.map((w) => (
              <div key={w.id} className="card webinar" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9em', color: 'var(--muted)' }}>{w.tag} • {new Date(w.date).toLocaleDateString()}</div>
                    <div style={{ fontWeight: 800 }}>{w.title}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn" onClick={() => navigator.clipboard?.writeText(JSON.stringify(w))}>Copy</button>
                    <button className="btn" onClick={() => handleDelete(w.id)}>Delete</button>
                  </div>
                </div>
                <div className="muted" style={{ marginTop: 8 }}>{w.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: 24 }}>
        <h3>Registered Users</h3>
        <div className="card" style={{ padding: 12 }}>
          {users.length ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr><th style={{ textAlign: 'left' }}>Username</th><th style={{ textAlign: 'left' }}>Password</th><th></th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.username}>
                    <td>{u.username}</td>
                    <td style={{ fontFamily: 'monospace' }}>{u.password}</td>
                    <td><button className="btn" onClick={() => handleDeleteUser(u.username)}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (<div className="muted">No registered users.</div>)}
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <h3>Registrations</h3>
        <div className="card" style={{ padding: 12 }}>
          {registrations.length ? (
            <div style={{ display: 'grid', gap: 8 }}>
              {registrations.map(r => (
                <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '0.9em', color: 'var(--muted)' }}>{new Date(r.timestamp).toLocaleString()} • {r.webinarId}</div>
                    <div style={{ fontWeight: 700 }}>{r.name} ({r.username})</div>
                    <div className="muted">{r.email}</div>
                  </div>
                  <div><button className="btn" onClick={() => handleDeleteRegistration(r.id)}>Remove</button></div>
                </div>
              ))}
            </div>
          ) : (<div className="muted">No registrations yet.</div>)}
        </div>
      </div>
      
      <div style={{ marginTop: 24 }}>
        <h3>Contact Messages</h3>
        <div className="card" style={{ padding: 12 }}>
          {messages.length ? (
            <div style={{ display: 'grid', gap: 8 }}>
              {messages.map(m => (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85em', color: 'var(--muted)' }}>{new Date(m.timestamp).toLocaleString()} • {m.reason}</div>
                    <div style={{ fontWeight: 700 }}>{m.name} • {m.email}</div>
                    <div className="muted" style={{ marginTop: 6 }}>{m.message || <span className="muted">(no message)</span>}</div>
                    {m.reply ? (
                      <div style={{ marginTop: 10, padding: 10, background: 'rgba(0,0,0,0.03)', borderRadius: 6 }}>
                        <div style={{ fontSize: '0.85em', color: 'var(--muted)' }}>Reply • {new Date(m.reply.timestamp).toLocaleString()} by {m.reply.by}</div>
                        <div style={{ marginTop: 6 }}>{m.reply.text}</div>
                      </div>
                    ) : null}
                    {replyingId === m.id ? (
                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        <input className="input" value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply" />
                        <button className="btn primary" onClick={() => sendReply(m.id)}>Send</button>
                        <button className="btn" onClick={cancelReply}>Cancel</button>
                      </div>
                    ) : (
                      <div className="muted" style={{ marginTop: 8 }}>
                        <button className="btn" onClick={() => navigator.clipboard?.writeText(JSON.stringify(m))}>Copy</button>
                        <button className="btn" onClick={() => startReply(m.id, m)}>Reply</button>
                        <button className="btn" onClick={() => handleDeleteMessage(m.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (<div className="muted">No messages yet.</div>)}
        </div>
      </div>
    </section>
  );
}
