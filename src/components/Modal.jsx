import React from "react";

export default function Modal({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backdropFilter: "blur(6px)",
        background: "rgba(0,0,0,.5)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          maxWidth: 560,
          width: "92%",
          padding: 24,
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <button
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            fontSize: 18,
            background: "none",
            border: "none",
            color: "var(--muted)",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          ✕
        </button>
      </div>
    </div>
  );
}