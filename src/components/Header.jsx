import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [role, setRole] = useState(typeof window !== 'undefined' ? localStorage.getItem('role') : null);

  useEffect(() => {
    function onRole() {
      setRole(localStorage.getItem('role'));
    }
    window.addEventListener('roleChanged', onRole);
    return () => window.removeEventListener('roleChanged', onRole);
  }, []);

  function logout() {
    localStorage.removeItem('role');
    window.dispatchEvent(new Event('roleChanged'));
    navigate('/');
  }

  return (
    <header>
      <div className="container nav">
        <div className="logo">
          <div className="logo-badge"><span>3S</span></div>
          <span>Webinars & Workshops</span>
        </div>
        {role ? (
          <nav>
            <ul>
              <li>
                <Link className="active" to="/home">Home</Link>
              </li>
              <li>
                <Link to="/webinars">Webinars</Link>
              </li>
              <li>
                <Link to="/workshops">Workshops</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              {role === 'admin' && (
                <li>
                  <Link to="/admin">Admin</Link>
                </li>
              )}
            </ul>
          </nav>
        ) : null}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {role ? (
            <>
              <div style={{ color: 'var(--muted)', fontWeight: 700 }}>{role}</div>
              <button className="btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <button className="cta-btn" onClick={() => navigate('/login')}>Login</button>
          )}
        </div>
      </div>
    </header>
  );
}