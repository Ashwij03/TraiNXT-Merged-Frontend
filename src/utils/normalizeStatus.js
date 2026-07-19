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

  // Item 21: canonical normal-lifecycle capitalization is
  // Screened / Enrolled / Ongoing / Completed. Legacy stored values such as
  // "Screening" are normalized to "Screened" for the subject lifecycle
  // domain via the shared subjectLifecycle helper; this normalizer maps the
  // raw token consistently to the same canonical output.
  if (lowerValue.includes("screen")) return "Screened";
  if (lowerValue.includes("enroll")) return "Enrolled";
  if (lowerValue.includes("ongoing") || lowerValue.includes("active")) return "Ongoing";
  if (lowerValue.includes("complete")) return "Completed";
  if (lowerValue.includes("withdraw")) return "Withdrawn";
  if (lowerValue.includes("drop") || lowerValue.includes("discontin") || lowerValue.includes("terminat")) return "Dropout";

  return null;
}
