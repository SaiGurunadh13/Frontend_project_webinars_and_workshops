import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  return (
    <header>
      <div className="container nav">
        <div className="logo">
          <div className="logo-badge"><span>3S</span></div>
          <span>Webinars & Workshops</span>
        </div>
        <nav>
          <ul>
            <li>
              <Link className="active" to="/">Home</Link>
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
          </ul>
        </nav>
        <button className="cta-btn" onClick={() => navigate("/contact")}>
          Register
        </button>
      </div>
    </header>
  );
}