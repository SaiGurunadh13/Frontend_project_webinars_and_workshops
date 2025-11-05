import React, { useState } from "react";
import webinars from "../data/webinars";
import WebinarCard from "../components/WebinarCard";
import Modal from "../components/Modal";

function RegisterForm() {
  const [msg, setMsg] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    setMsg("Thanks for registering! Check your email for details.");
    e.target.reset();
  }
  return (
    <form style={{ display: "grid", gap: 10 }} onSubmit={handleSubmit}>
      <input className="input" name="name" placeholder="Your Name" required />
      <input className="input" name="email" type="email" placeholder="Email" required />
      <button className="btn primary" type="submit">Submit</button>
      {msg && <div className="muted" style={{ display: "block" }}>{msg}</div>}
    </form>
  );
}

export default function Webinars() {
  const [search, setSearch] = useState("");
  const [tag, setTag] = useState("");
  const [modal, setModal] = useState(null);

  const filteredWebinars = webinars
    .filter((w) => (tag ? w.tag === tag : true))
    .filter((w) => w.title.toLowerCase().includes(search.toLowerCase()) || w.desc.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  function handleDetails(id) {
    const w = webinars.find((x) => x.id === id);
    setModal(
      <Modal onClose={() => setModal(null)}>
        <h2>{w.title}</h2>
        <p>{w.desc}</p>
        <p>
          <strong>Date & Time:</strong> {new Date(w.date).toLocaleDateString()} • {w.time}
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
        <RegisterForm />
      </Modal>
    );
  }

  function resetFilters() {
    setSearch("");
    setTag("");
  }

  return (
    <section id="webinars">
      <div className="section-head">
        <div>
          <h2>Upcoming Webinars</h2>
          <div className="muted">Search, filter by tag, and register.</div>
        </div>
        <div className="toolbar">
          <input
            className="input"
            placeholder="Search topics (e.g., React, AI, Career)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input" value={tag} onChange={(e) => setTag(e.target.value)}>
            <option value="">All tags</option>
            <option>Web</option>
            <option>JavaScript</option>
            <option>AI/ML</option>
            <option>Career</option>
          </select>
          <button className="btn" onClick={resetFilters}>Reset</button>
        </div>
      </div>

      <div className="grid">
        {filteredWebinars.length ? (
          filteredWebinars.map((webinar) => (
            <WebinarCard
              key={webinar.id}
              webinar={webinar}
              onDetails={handleDetails}
              onRegister={handleRegister}
            />
          ))
        ) : (
          <div className="muted" style={{ gridColumn: "1/-1", textAlign: "center", padding: 20 }}>
            No results. Try resetting filters.
          </div>
        )}
      </div>
      {modal}
    </section>
  );
}