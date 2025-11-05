import React from "react";
import StatusBadge from "./StatusBadge";

export default function WebinarCard({ webinar, onDetails, onRegister }) {
  return (
    <article className="webinar card">
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 10
      }}>
        <span className="title">{webinar.title}</span>
        <StatusBadge status={webinar.status} />
      </div>
      <div className="meta">
        <span className="date">
          {new Date(webinar.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
          {" • "}{webinar.time}
        </span>
        <span>•</span>
        <span className="duration">{webinar.duration}</span>
        <span>•</span>
        <span className="tag">Tag: {webinar.tag}</span>
      </div>
      <p className="desc muted" style={{ margin: 0 }}>{webinar.desc}</p>
      <div className="actions">
        <button className="btn" onClick={() => onDetails(webinar.id)}>Details</button>
        <button className="btn primary" onClick={() => onRegister(webinar.id)}>Register</button>
      </div>
    </article>
  );
}