import React, { useState } from "react";
import webinars from "../data/webinars";
import WebinarCard from "../components/WebinarCard";
import Modal from "../components/Modal";

export default function Workshops() {
  const [modal, setModal] = useState(null);

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
        <form style={{ display: "grid", gap: 10 }} onSubmit={(e) => { e.preventDefault(); alert('Thanks for registering!'); setModal(null); }}>
          <input className="input" name="name" placeholder="Your Name" required />
          <input className="input" name="email" type="email" placeholder="Email" required />
          <button className="btn primary" type="submit">Submit</button>
        </form>
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
