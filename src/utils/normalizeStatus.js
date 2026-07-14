export function normalizeStatus(status, options = {}) {
  const value = String(status || "").trim();
  const lowerValue = value.toLowerCase();

  if (options.type === "comment") {
    if (value === "Resolved" || lowerValue === "resolved") {
      return "resolved";
    }

    if (value === "Open" || lowerValue === "open" || lowerValue === "unresolved") {
      return "unresolved";
    }

    return "pending-review";
  }

  if (lowerValue.includes("screen")) return "Screening";
  if (lowerValue.includes("enroll")) return "Enrolled";
  if (lowerValue.includes("ongoing") || lowerValue.includes("active")) return "Ongoing";
  if (lowerValue.includes("complete")) return "Completed";
  if (lowerValue.includes("withdraw")) return "Withdrawn";
  if (lowerValue.includes("drop")) return "Dropout";

  return null;
}
