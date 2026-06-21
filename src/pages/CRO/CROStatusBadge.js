import React from "react";
import "./CROStatusBadge.css";

const STATUS_MAP = {
  Completed: "completed",
  Pending: "pending",
  Scheduled: "scheduled",
  Approved: "approved",
  Expired: "expired",
  Open: "open",
  Answered: "answered",
  Closed: "closed",
  Active: "active",
  Generated: "completed",
  Unread: "pending",
  Read: "completed",
  Excellent: "approved",
  Good: "scheduled",
  "At Risk": "expired",
};

function CROStatusBadge({ status }) {
  const variant = STATUS_MAP[status] || "default";

  return (
    <span className={`cro-status-badge cro-status-${variant}`}>
      {status}
    </span>
  );
}

export default CROStatusBadge;
