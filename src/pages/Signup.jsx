import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [captchaA, setCaptchaA] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaB, setCaptchaB] = useState(() => Math.floor(Math.random() * 9) + 1);
  const [captchaInput, setCaptchaInput] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!user.trim() || !pass) {
      setError('Please provide username and password');
      return;
    }
    const expected = (captchaA + captchaB).toString();
    if ((captchaInput || '').trim() !== expected) {
      setError('Captcha answer is incorrect. Please try again.');
      // regenerate
      setCaptchaA(Math.floor(Math.random() * 9) + 1);
      setCaptchaB(Math.floor(Math.random() * 9) + 1);
      setCaptchaInput('');
      return;
    }
    const raw = localStorage.getItem('users');
    const users = raw ? JSON.parse(raw) : [];
    if (users.find((u) => u.username === user)) {
      setError('Username already exists');
      return;
    }
    users.push({ username: user, password: pass });
    localStorage.setItem('users', JSON.stringify(users));
    // set role and navigate as student
    localStorage.setItem('role', 'student');
    localStorage.setItem('currentUser', user);
    window.dispatchEvent(new Event('roleChanged'));
    navigate('/webinars');
  }

  return (
    <section style={{ padding: 40 }}>
      <div className="card" style={{ maxWidth: 480, margin: '0 auto', padding: 20 }}>
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
          <input className="input" placeholder="Username" value={user} onChange={(e) => setUser(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ minWidth: 140 }} className="muted">What is {captchaA} + {captchaB}?</div>
            <input className="input" style={{ width: 120 }} name="captcha" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Answer" />
            <button type="button" className="btn" onClick={() => { setCaptchaA(Math.floor(Math.random()*9)+1); setCaptchaB(Math.floor(Math.random()*9)+1); setCaptchaInput(''); }}>New</button>
          </div>
          <button className="btn primary" type="submit">Create account</button>
          {error && <div className="muted">{error}</div>}
        </form>
      </div>
    </section>
  );
}
