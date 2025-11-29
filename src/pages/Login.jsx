import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Modal from '../components/Modal';

export default function Login() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    // admin login
    if (user === 'admin' && pass === 'admin') {
      localStorage.setItem('role', 'admin');
      window.dispatchEvent(new Event('roleChanged'));
      navigate('/admin');
      return;
    }

    // check registered users
    const raw = localStorage.getItem('users');
    const users = raw ? JSON.parse(raw) : [];
    const found = users.find((u) => u.username === user && u.password === pass);
    if (found) {
      localStorage.setItem('role', 'student');
      localStorage.setItem('currentUser', found.username);
      window.dispatchEvent(new Event('roleChanged'));
      navigate('/webinars');
      return;
    }

    // not found
    setError("Unknown credentials. Please sign up if you don't have an account.");
  }


  function openForgot() {
    setModal(
      <Modal onClose={() => setModal(null)}>
        <ForgotPassword onDone={() => setModal(null)} />
      </Modal>
    );
  }

  return (
    <section style={{ padding: 40 }}>
      <div className="card" style={{ maxWidth: 480, margin: '0 auto', padding: 20 }}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
          <input className="input" placeholder="Username" value={user} onChange={(e) => setUser(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
          <button className="btn primary" type="submit">Sign in</button>
          {error && <div className="muted">{error}</div>}
        </form>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/signup" className="pill">Sign up</Link>
          <button className="btn" onClick={openForgot} style={{ marginLeft: 'auto' }}>Forgot password?</button>
        </div>
        {modal}
      </div>
    </section>
  );
}

function ForgotPassword({ onDone }) {
  const [username, setUsername] = useState('');
  const [newPass, setNewPass] = useState('');
  const [msg, setMsg] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [captchaInput, setCaptchaInput] = useState('');

  function handleReset(e) {
    e.preventDefault();
    (async () => {
      if (!captcha) {
        setMsg('Please solve the captcha');
        return;
      }
      const res = await verifyCaptcha(captcha.id, captchaInput);
      if (!res || !res.ok) {
        setMsg('Captcha answer is incorrect. Please try again.');
        const next = await getCaptcha();
        setCaptcha(next);
        setCaptchaInput('');
        return;
      }

      const raw = localStorage.getItem('users');
      const users = raw ? JSON.parse(raw) : [];
      const idx = users.findIndex((u) => u.username === username);
      if (idx === -1) {
        setMsg('User not found.');
        return;
      }
      if (!newPass) {
        setMsg('Please enter a new password.');
        return;
      }
      users[idx].password = newPass;
      localStorage.setItem('users', JSON.stringify(users));
      setMsg('Password updated. You can now login.');
      setTimeout(() => {
        onDone && onDone();
      }, 900);
    })();
    const raw = localStorage.getItem('users');
    const users = raw ? JSON.parse(raw) : [];
    const idx = users.findIndex((u) => u.username === username);
    if (idx === -1) {
      setMsg('User not found.');
      return;
    }
    if (!newPass) {
      setMsg('Please enter a new password.');
      return;
    }
    users[idx].password = newPass;
    localStorage.setItem('users', JSON.stringify(users));
    setMsg('Password updated. You can now login.');
    setTimeout(() => {
      onDone && onDone();
    }, 900);
  }

  return (
    <div>
      <h3>Reset Password</h3>
      <form onSubmit={handleReset} style={{ display: 'grid', gap: 10 }}>
        <input className="input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input className="input" placeholder="New password" type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="muted" style={{ minWidth: 140 }}>{captcha ? `Solve: ${captcha.question}` : 'Loading captcha...'}</div>
          <input className="input" style={{ width: 120 }} value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Answer" />
          <button type="button" className="btn" onClick={async () => { const c = await getCaptcha(); setCaptcha(c); setCaptchaInput(''); }}>New</button>
        </div>
        <button className="btn primary" type="submit">Set new password</button>
        {msg && <div className="muted">{msg}</div>}
      </form>
    </div>
  );
}
