import React, { useState } from "react";
import { Link } from "react-router-dom";
import { loadWebinars } from "../data/store";
import WebinarCard from "../components/WebinarCard";
import Modal from "../components/Modal";
import { addRegistration } from '../data/store';

function RegisterInline({ webinarId, onDone }) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [msg, setMsg] = React.useState('');

  function submit(e) {
    e.preventDefault();
    const currentUser = localStorage.getItem('currentUser') || name;
    (async () => {
      const reg = await addRegistration({ webinarId, username: currentUser, name, email });
      if (reg) {
        setMsg('Thanks for registering!');
        setTimeout(() => onDone && onDone(), 800);
      } else {
        setMsg('Failed to register');
      }
    })();
  }

  return (
    <form style={{ display: 'grid', gap: 10 }} onSubmit={submit}>
      <input className="input" name="name" placeholder="Your Name" value={name} onChange={(e)=>setName(e.target.value)} required />
      <input className="input" name="email" type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
      <button className="btn primary" type="submit">Submit</button>
      {msg && <div className="muted">{msg}</div>}
    </form>
  );
}

export default function Home() {
  const [modal, setModal] = useState(null);
  const [webinars, setWebinars] = useState(() => loadWebinars());

  React.useEffect(() => {
    function onUpdate() { setWebinars(loadWebinars()); }
    window.addEventListener('webinarsUpdated', onUpdate);
    return () => window.removeEventListener('webinarsUpdated', onUpdate);
  }, []);

  function handleDetails(id) {
    const w = webinars.find((x) => x.id === id);
    setModal(
      <Modal onClose={() => setModal(null)}>
        <h2>{w.title}</h2>
        <p>{w.desc}</p>
        <p>
          <strong>Date & Time:</strong> {new Date(w.date).toLocaleDateString()}  {w.time}
        </p>
        <p>
          <strong>Duration:</strong> {w.duration}
        </p>
        <button className="btn primary" onClick={() => {
          setModal(
            <Modal onClose={() => setModal(null)}>
              <h2>Register for "{w.title}"</h2>
              <RegisterInline webinarId={w.id} onDone={() => setModal(null)} />
            </Modal>
          );
        }}>
          Register
        </button>
      </Modal>
    );
  }

  function handleRegister(id) {
    const w = webinars.find((x) => x.id === id);
      setModal(
      <Modal onClose={() => setModal(null)}>
        <h2>Register for "{w.title}"</h2>
        <RegisterInline webinarId={w.id} onDone={() => setModal(null)} />
      </Modal>
    );
  }

  const upcoming = webinars.filter(w => w.status !== 'past').slice(0,4);
  const featured = upcoming[0];

  return (
    <>
      <section className="hero">
        <div>
          <div className="pill">Hosting live tech sessions  Mentoring beginners</div>
          <h1>
            Learn Live. Build Bold.<br />
            Join my <span style={{
              background: "linear-gradient(135deg,var(--brand),var(--brand-2))",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent"
            }}>webinars</span> & workshops.
          </h1>
          <p>
            Practical, beginner-friendly sessions on full-stack dev, AI basics, and project building. Browse upcoming sessions below or register for the featured session.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Link className="cta-btn" to="/webinars">Browse Webinars</Link>
            <Link className="btn" to="/workshops">Workshops</Link>
            <Link className="btn" to="/contact">Contact</Link>
          </div>

          <div className="stats" style={{ marginTop: 18 }}>
            <div className="pill">50+ sessions hosted</div>
            <div className="pill">2k+ attendees</div>
            <div className="pill">Response time &lt; 24h</div>
          </div>
        </div>

        <div className="card" style={{ padding: 18 }}>
          <div style={{ borderRadius: 14, height: 180, background: 'transparent' }} />
        </div>
      </section>

      <section>
        <div className="section-head">
          <div>
            <h2>Featured Session</h2>
            <div className="muted">Don't miss this curated session — limited seats.</div>
          </div>
        </div>

        {featured ? (
          <div className="card" style={{ padding: 18, display: 'flex', gap: 18, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9em', color: 'var(--muted)', marginBottom: 8 }}>{featured.tag}  {new Date(featured.date).toLocaleDateString()}</div>
              <h3 style={{ margin: '0 0 8px' }}>{featured.title}</h3>
              <p className="muted" style={{ marginTop: 0 }}>{featured.desc}</p>
              <div style={{ marginTop: 12 }}>
                <button className="btn" onClick={() => handleDetails(featured.id)}>Details</button>
                <button className="btn primary" onClick={() => handleRegister(featured.id)} style={{ marginLeft: 8 }}>Register</button>
              </div>
            </div>
            <div style={{ width: 220 }}>
              <div style={{ width: '100%', height: 140, borderRadius: 8, background: 'transparent' }} />
            </div>
          </div>
        ) : (
          <div className="muted">No featured session at the moment.</div>
        )}
      </section>

      <section>
        <div className="section-head">
          <div>
            <h2>Upcoming Sessions</h2>
            <div className="muted">A quick look at the next few webinars.</div>
          </div>
          <div>
            <Link className="pill" to="/webinars">View all</Link>
          </div>
        </div>

        <div className="grid">
          {upcoming.length ? upcoming.map(w => (
            <WebinarCard key={w.id} webinar={w} onDetails={handleDetails} onRegister={handleRegister} />
          )) : (
            <div className="muted">No upcoming sessions.</div>
          )}
        </div>
      </section>

      {modal}
    </>
  );
}