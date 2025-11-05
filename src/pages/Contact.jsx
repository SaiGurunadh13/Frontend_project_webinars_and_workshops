import React, { useState } from "react";

export default function Contact() {
  const [msg, setMsg] = useState("");
  function handleSubmit(e) {
    e.preventDefault();
    setMsg("Thanks! We received your message.");
    e.target.reset();
  }
  return (
    <section className="contact">
      <div className="card" style={{ padding: 18 }}>
        <h2>Contact / Register Interest</h2>
        <form id="contactForm" onSubmit={handleSubmit}>
          <input className="input" name="name" placeholder="Your name" required />
          <input className="input" type="email" name="email" placeholder="Email" required />
          <select name="reason" className="input" required defaultValue="">
            <option value="" disabled>
              I'm interested in…
            </option>
            <option>Registering for a webinar/workshop</option>
            <option>Inviting you to speak</option>
            <option>Project collaboration</option>
          </select>
          <textarea className="input" name="message" placeholder="Message (optional)"></textarea>
          <button className="btn primary" type="submit">Send</button>
          {msg && <div className="muted" style={{ display: "block" }}>{msg}</div>}
        </form>
      </div>
    </section>
  );
}