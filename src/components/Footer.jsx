import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function Footer() {
  const location = useLocation();
  // Hide footer on login/signup pages
  if (location && (location.pathname === "/login" || location.pathname === "/signup")) {
    return null;
  }

  return (
    <footer>
      <div className="container" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", gap: 10 }}>
          <Link className="pill" to="/webinars">Next webinar →</Link>
        </div>
      </div>
    </footer>
  );
}