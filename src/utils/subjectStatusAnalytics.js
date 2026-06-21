export const SUBJECT_STATUS_ORDER = [
  "Screening",
  "Enrolled",
  "Ongoing",
  "Completed",
  "Withdrawn",
  "Dropout"
];

function normalizeStatus(status) {
  const value = String(status || "").trim().toLowerCase();

  if (value.includes("screen")) return "Screening";
  if (value.includes("enroll")) return "Enrolled";
  if (value.includes("ongoing") || value.includes("active")) return "Ongoing";
  if (value.includes("complete")) return "Completed";
  if (value.includes("withdraw")) return "Withdrawn";
  if (value.includes("drop")) return "Dropout";

  return null;
}

export function getSubjectStatusAnalytics(subjects = []) {
  const counts = Object.fromEntries(
    SUBJECT_STATUS_ORDER.map((status) => [status, 0])
  );

  subjects.forEach((subject) => {
    const normalized = normalizeStatus(subject?.status);

    if (normalized) {
      counts[normalized] += 1;
    }
  });

  return SUBJECT_STATUS_ORDER.map((name) => ({
    name,
    value: counts[name]
  }));
}

export function getAllSubjectsFromStorage() {
  try {
    const subjectsByStudy =
      JSON.parse(localStorage.getItem("subjectsByStudy")) || {};

    return Object.entries(subjectsByStudy).flatMap(([studyKey, subjects]) =>
      (Array.isArray(subjects) ? subjects : []).map((subject) => ({
        ...subject,
        studyKey
      }))
    );
  } catch {
    return [];
  }
}
