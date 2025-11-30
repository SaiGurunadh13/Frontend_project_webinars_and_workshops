import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCaptcha, verifyCaptcha } from '../data/store';

export default function Signup() {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [captcha, setCaptcha] = useState(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!user.trim() || !pass) {
      setError('Please provide username and password');
      return;
    }
    (async () => {
      if (!captcha) {
        setError('Please solve the captcha');
        return;
      }
      const res = await verifyCaptcha(captcha.id, captchaInput);
      if (!res || !res.ok) {
        setError('Captcha answer is incorrect. Please try again.');
        
        const next = await getCaptcha();
        setCaptcha(next);
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
      
      localStorage.setItem('role', 'student');
      localStorage.setItem('currentUser', user);
      window.dispatchEvent(new Event('roleChanged'));
      navigate('/webinars');
    })();
  }

  useEffect(() => {
    (async () => {
      const c = await getCaptcha();
      setCaptcha(c);
    })();
  }, []);

  return (
    <section style={{ padding: 40 }}>
      <div className="card" style={{ maxWidth: 480, margin: '0 auto', padding: 20 }}>
        <h2>Sign up</h2>
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 10 }}>
          <input className="input" placeholder="Username" value={user} onChange={(e) => setUser(e.target.value)} />
          <input className="input" type="password" placeholder="Password" value={pass} onChange={(e) => setPass(e.target.value)} />
          <div className="captcha-row">
            {captcha ? (
              <img className="captcha-image" src={captcha.image} alt="captcha" />
            ) : (
              <div className="muted">Loading captcha...</div>
            )}
            <input className="input" name="captcha" value={captchaInput} onChange={(e) => setCaptchaInput(e.target.value)} placeholder="Enter characters" />
            <button type="button" className="btn" onClick={async () => { const c = await getCaptcha(); setCaptcha(c); setCaptchaInput(''); }}>Refresh</button>
          </div>
          <button className="btn primary" type="submit">Create account</button>
          {error && <div className="muted">{error}</div>}
        </form>
      </div>
    </section>
  );
}
