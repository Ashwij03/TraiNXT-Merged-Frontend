/**
 * Display-only formatter for scheduled visit dates.
 * Preserves the authoritative datetime in source data; strips time at the UI boundary.
 */
export function formatScheduleDisplayDate(dateValue) {
  if (!dateValue) {
    return "—";
  }

  const parsed = new Date(dateValue);

  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const raw = String(dateValue).trim();
  const withoutTime = raw.replace(/\s+\d{1,2}:\d{2}(?::\d{2})?\s*(AM|PM)?/i, "");

  return withoutTime || raw;
}
