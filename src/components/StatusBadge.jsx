import React from "react";

export default function StatusBadge({ status }) {
  let className = "badge ";
  if (status === "live") className += "live";
  else if (status === "past") className += "past";
  else className += "upcoming";
  return <span className={className}>{status.toUpperCase()}</span>;
}