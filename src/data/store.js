import defaultWebinars from './webinars';

export function loadWebinars() {
  try {
    const raw = localStorage.getItem('webinars');
    if (!raw) return defaultWebinars;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultWebinars;
    return parsed;
  } catch (e) {
    return defaultWebinars;
  }
}

export function saveWebinars(list) {
  try {
    localStorage.setItem('webinars', JSON.stringify(list));
    
    window.dispatchEvent(new Event('webinarsUpdated'));
  } catch (e) {
    console.error('Failed to save webinars', e);
  }
}

// Users (localStorage 'users')
export function loadUsers() {
  try {
    const raw = localStorage.getItem('users');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

export function saveUsers(list) {
  try {
    localStorage.setItem('users', JSON.stringify(list));
    window.dispatchEvent(new Event('usersUpdated'));
  } catch (e) {
    console.error('Failed to save users', e);
  }
}

// Registrations (localStorage 'registrations')
export function loadRegistrations() {
  try {
    const raw = localStorage.getItem('registrations');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

export function saveRegistrations(list) {
  try {
    localStorage.setItem('registrations', JSON.stringify(list));
    window.dispatchEvent(new Event('registrationsUpdated'));
  } catch (e) {
    console.error('Failed to save registrations', e);
  }
}

export async function addRegistration(reg) {
  try {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/registrations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reg)
        });
        if (res.ok) {
          const created = await res.json();
          // refresh local storage cache
          const all = await fetch(`${API_BASE}/api/registrations`).then(r => r.ok ? r.json() : []);
          saveRegistrations(all);
          return created;
        }
      } catch (e) {
        // fallback to local
      }
    }
    const list = loadRegistrations();
    const next = [{ id: Date.now().toString(), timestamp: new Date().toISOString(), ...reg }, ...list];
    saveRegistrations(next);
    return next[0];
  } catch (e) {
    console.error('Failed to add registration', e);
    return null;
  }
}

// Contact messages (localStorage 'messages')
export function loadMessages() {
  try {
    const raw = localStorage.getItem('messages');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch (e) {
    return [];
  }
}

export function saveMessages(list) {
  try {
    localStorage.setItem('messages', JSON.stringify(list));
    window.dispatchEvent(new Event('messagesUpdated'));
  } catch (e) {
    console.error('Failed to save messages', e);
  }
}

export async function addMessage(msg) {
  try {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(msg)
        });
        if (res.ok) {
          const created = await res.json();
          // refresh local cache
          const all = await fetch(`${API_BASE}/api/messages`).then(r => r.ok ? r.json() : []);
          saveMessages(all);
          return created;
        }
      } catch (e) {
        // fallback to local
      }
    }

    const list = loadMessages();
    const next = [{ id: Date.now().toString(), timestamp: new Date().toISOString(), ...msg }, ...list];
    saveMessages(next);
    return next[0];
  } catch (e) {
    console.error('Failed to add message', e);
    return null;
  }
}

// CAPTCHA helpers: get a challenge (API or local) and verify
export async function getCaptcha() {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/captcha`);
      if (res.ok) return await res.json();
    } catch (e) {
      // fallback to local
    }
  }
  // local fallback
  const ops = ['+', '-', '*'];
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const op = ops[Math.floor(Math.random() * ops.length)];
  let answer = 0;
  if (op === '+') answer = a + b;
  if (op === '-') answer = a - b;
  if (op === '*') answer = a * b;
  const id = Date.now().toString() + Math.floor(Math.random() * 10000).toString();
  sessionStorage.setItem(`captcha:${id}`, String(answer));
  return { id, question: `${a} ${op} ${b}` };
}

export async function verifyCaptcha(id, answer) {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/captcha/verify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, answer })
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // fallthrough to local
    }
  }
  const expected = sessionStorage.getItem(`captcha:${id}`);
  // consume
  sessionStorage.removeItem(`captcha:${id}`);
  return { ok: String(answer || '').trim() === String(expected || '').trim() };
}

export async function replyMessage(id, reply) {
  try {
    const API_BASE = import.meta.env.VITE_API_URL || '';
    if (API_BASE) {
      try {
        const res = await fetch(`${API_BASE}/api/messages/${encodeURIComponent(id)}/reply`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reply)
        });
        if (res.ok) {
          const all = await fetch(`${API_BASE}/api/messages`).then(r => r.ok ? r.json() : []);
          saveMessages(all);
          return { ok: true, message: all.find(m => m.id === id) };
        }
      } catch (e) {
        // fallback to local
      }
    }

    const list = loadMessages();
    const idx = list.findIndex(m => m.id === id);
    if (idx === -1) return { ok: false, error: 'Not found' };
    const r = { text: reply.text, by: reply.by || 'admin', timestamp: new Date().toISOString() };
    list[idx].reply = r;
    saveMessages(list);
    return { ok: true, message: list[idx] };
  } catch (e) {
    console.error('Failed to reply to message', e);
    return { ok: false, error: e && e.message };
  }
}
