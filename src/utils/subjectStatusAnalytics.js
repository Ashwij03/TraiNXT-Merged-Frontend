import { normalizeStatus } from "./normalizeStatus";
export const SUBJECT_STATUS_ORDER = [
  "Screened",
  "Enrolled",
  "Ongoing",
  "Completed",
  "Withdrawn",
  "Dropout"
];

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
