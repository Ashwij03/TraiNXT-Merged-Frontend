// Global header search — matches studies (with full details) and subjects.

import { getStudies } from "../services/studyService";
import {
  getAccessibleStudies,
  getStudiesForSite,
  isAdmin,
  getCurrentUser
} from "../services/roleService";

function getAllSubjectsFlat() {
  try {
    const byStudy =
      JSON.parse(localStorage.getItem("subjectsByStudy")) || {};
    const results = [];

    Object.entries(byStudy).forEach(([studyKey, subjects]) => {
      if (!Array.isArray(subjects)) {
        return;
      }

      subjects.forEach((subject) => {
        results.push({
          type: "subject",
          id: subject.id || subject.subjectId,
          studyKey,
          label: subject.id || subject.subjectId,
          meta: [
            subject.status,
            subject.site,
            subject.pi,
            studyKey
          ]
            .filter(Boolean)
            .join(" • ")
        });
      });
    });

    return results;
  } catch {
    return [];
  }
}

function getStudySearchFields(study) {
  return [
    study.name,
    study.code,
    study.protocol,
    study.site,
    study.location,
    study.status,
    study.sponsor,
    study.principalInvestigator,
    study.description,
    study.phase
  ]
    .filter(Boolean)
    .map(String);
}

export function searchHeader(query, { institutionFilter } = {}) {
  const trimmed = query.trim().toLowerCase();

  if (!trimmed) {
    return [];
  }

  const user = getCurrentUser();
  const studies = isAdmin(user)
    ? getStudiesForSite(institutionFilter)
    : getAccessibleStudies(user);

  const studyResults = studies
    .filter((study) =>
      getStudySearchFields(study).some((field) =>
        field.toLowerCase().includes(trimmed)
      )
    )
    .slice(0, 5)
    .map((study) => ({
      type: "study",
      study,
      label: study.name || study.code,
      meta: [
        study.code,
        study.protocol,
        study.principalInvestigator
          ? `PI: ${study.principalInvestigator}`
          : null,
        study.site,
        study.status,
        study.sponsor ? `Sponsor: ${study.sponsor}` : null
      ]
        .filter(Boolean)
        .join(" • ")
    }));

  const subjectResults = getAllSubjectsFlat()
    .filter(
      (subject) =>
        String(subject.label || "")
          .toLowerCase()
          .includes(trimmed) ||
        String(subject.meta || "")
          .toLowerCase()
          .includes(trimmed)
    )
    .slice(0, 4);

  return [...studyResults, ...subjectResults];
}

export function getStudiesForSearchContext(institutionFilter) {
  const user = getCurrentUser();

  if (isAdmin(user)) {
    return getStudiesForSite(institutionFilter);
  }

  return getAccessibleStudies(user);
}

export { getStudies };
