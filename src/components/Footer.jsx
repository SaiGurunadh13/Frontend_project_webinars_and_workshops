import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer>
      <div className="container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap"
      }}>
        <div>© {new Date().getFullYear()} SSS</div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="pill" to="/webinars">Next webinar →</Link>
        </div>
      </div>
    </footer>
  );
}