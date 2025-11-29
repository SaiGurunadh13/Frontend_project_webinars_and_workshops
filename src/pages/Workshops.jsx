import React, { useEffect, useState } from "react";
import { loadWebinars } from "../data/store";
import WebinarCard from "../components/WebinarCard";
import Modal from "../components/Modal";
import { addRegistration } from '../data/store';

function RegisterFormInline({ webinarId, onDone }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');

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

export default function Workshops() {
  const [modal, setModal] = useState(null);
  const [webinars, setWebinars] = useState(() => loadWebinars());

  useEffect(() => {
    function onUpdate() { setWebinars(loadWebinars()); }
    window.addEventListener('webinarsUpdated', onUpdate);
    return () => window.removeEventListener('webinarsUpdated', onUpdate);
  }, []);

  // Prefer tag matches for workshops/web, but ensure at least 4 items by supplementing with upcoming webinars
  const tagMatches = webinars.filter(
    (w) => w.tag.toLowerCase().includes("work") || w.tag.toLowerCase().includes("web")
  );
  const upcoming = webinars.filter((w) => w.status !== "past");
  // Start with tagMatches, then add upcoming (excluding duplicates) until we have 4
  const workshopList = [...tagMatches];
  for (const w of upcoming) {
    if (workshopList.length >= 4) break;
    if (!workshopList.find((x) => x.id === w.id)) workshopList.push(w);
  }

  function handleDetails(id) {
    const w = webinars.find((x) => x.id === id);
    setModal(
      <Modal onClose={() => setModal(null)}>
        <h2>{w.title}</h2>
        <p>{w.desc}</p>
        <p>
          <strong>Date & Time:</strong> {new Date(w.date).toLocaleDateString()}  {w.time}
        </p>
        <p>
          <strong>Duration:</strong> {w.duration}
        </p>
        <p>
          <strong>Tag:</strong> {w.tag}
        </p>
        <button className="btn primary" onClick={() => handleRegister(id)}>
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
        <RegisterFormInline webinarId={id} onDone={() => setModal(null)} />
      </Modal>
    );
  }

  return (
    <section id="workshops">
      <div className="section-head">
        <div>
          <h2>Workshops</h2>
          <div className="muted">Hands-on multi-hour workshops and deep dives.</div>
        </div>
      </div>

      <div className="grid">
        {workshopList.length ? (
          workshopList.map((webinar) => (
            <WebinarCard key={webinar.id} webinar={webinar} onDetails={handleDetails} onRegister={handleRegister} />
          ))
        ) : (
          <div className="muted" style={{ gridColumn: "1/-1", textAlign: "center", padding: 20 }}>
            No upcoming workshops found.
          </div>
        )}
      </div>
      {modal}
    </section>
  );
}
