// Cascading header filters — indication drives studies, sites, and subjects.

import { getStudies } from "./studyService";
import {
  getAccessibleSites,
  getAccessibleStudies,
  getAssignedSite,
  getCurrentUser,
  getStudiesForSite,
  isAdmin
} from "./roleService";
import {
  getStoredCROFilter,
  getStoredIndicationFilter,
  getStoredInstitutionFilter,
  getStoredSiteNumberFilter,
  getStoredSponsorFilter,
  getStoredStudyFilter
} from "../constants/headerFilters";

const DEFAULT_CROS = ["IQVIA", "PPD", "Syneos Health", "TriaNXT CRO"];
const DEFAULT_SPONSORS = [
  "TriaNXT Research",
  "Abbott Laboratories",
  "Intercept Pharmaceuticals"
];

function readSubjectsByStudy() {
  try {
    return JSON.parse(localStorage.getItem("subjectsByStudy")) || {};
  } catch {
    return {};
  }
}

function normalizeStudy(study) {
  return {
    ...study,
    indication: study.indication || "General",
    sponsor: study.sponsor || "TriaNXT Research",
    cro: study.cro || "TriaNXT CRO",
    site: study.site || study.location || ""
  };
}

function getBaseStudies(user = getCurrentUser()) {
  const studies = (isAdmin(user) ? getStudies() : getAccessibleStudies(user)).map(
    normalizeStudy
  );

  return studies;
}

function filterStudies(studies, filters) {
  let result = studies;

  if (filters.indication) {
    result = result.filter(
      (study) => study.indication === filters.indication
    );
  }

  if (filters.sponsor) {
    result = result.filter((study) => study.sponsor === filters.sponsor);
  }

  if (filters.cro) {
    result = result.filter((study) => study.cro === filters.cro);
  }

  if (filters.institution) {
    result = result.filter((study) => {
      const site = study.site || study.location || "";
      return (
        site === filters.institution ||
        site.includes(filters.institution) ||
        filters.institution.includes(site)
      );
    });
  }

  if (filters.studyCode) {
    result = result.filter(
      (study) => String(study.code) === String(filters.studyCode)
    );
  }

  return result;
}

export function getFilterState() {
  return {
    indication: getStoredIndicationFilter(),
    sponsor: getStoredSponsorFilter(),
    cro: getStoredCROFilter(),
    institution: getStoredInstitutionFilter(),
    siteNumber: getStoredSiteNumberFilter(),
    studyCode: getStoredStudyFilter()
  };
}

export function getIndicationOptions(user = getCurrentUser()) {
  const indications = [
    ...new Set(getBaseStudies(user).map((study) => study.indication))
  ];

  return indications.sort().map((value) => ({ value, label: value }));
}

export function getSponsorOptions(user = getCurrentUser()) {
  const filters = getFilterState();
  const fromStudies = [
    ...new Set(
      filterStudies(getBaseStudies(user), filters).map((study) => study.sponsor)
    )
  ];
  const merged = [...new Set([...fromStudies, ...DEFAULT_SPONSORS])];

  return merged.sort().map((value) => ({ value, label: value }));
}

export function getCROOptions(user = getCurrentUser()) {
  const filters = getFilterState();
  const fromStudies = [
    ...new Set(
      filterStudies(getBaseStudies(user), filters).map((study) => study.cro)
    )
  ];
  const merged = [...new Set([...fromStudies, ...DEFAULT_CROS])];

  return merged.sort().map((value) => ({ value, label: value }));
}

export function getRecruitedCROOptions(user = getCurrentUser()) {
  const studies = getBaseStudies(user);
  const sponsorName = user?.orgType || user?.sponsor || "TriaNXT Research";
  const recruited = [
    ...new Set(
      studies
        .filter(
          (study) =>
            study.sponsor === sponsorName &&
            study.cro &&
            study.cro !== "TriaNXT CRO"
        )
        .map((study) => study.cro)
    )
  ];

  try {
    const stored = JSON.parse(localStorage.getItem("sponsorRecruitedCROs") || "[]");
    stored.forEach((cro) => {
      if (cro && !recruited.includes(cro)) {
        recruited.push(cro);
      }
    });
  } catch {
    /* ignore */
  }

  return recruited.sort().map((value) => ({ value, label: value }));
}

export function getInstitutionOptions(user = getCurrentUser()) {
  const filters = getFilterState();
  const studies = filterStudies(getBaseStudies(user), filters);
  const studySites = [...new Set(studies.map((study) => study.site).filter(Boolean))];
  const accessibleSites = getAccessibleSites(user).map((site) => site.name);

  const merged = [...new Set([...studySites, ...accessibleSites])].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );

  return [
    { value: "", label: "All Institutions" },
    ...merged.map((value) => ({ value, label: value }))
  ];
}

export function getSiteNumberOptions(user = getCurrentUser()) {
  const filters = getFilterState();
  const sites = getAccessibleSites(user);

  const filteredSites = filters.institution
    ? sites.filter(
        (site) =>
          site.name === filters.institution ||
          site.name?.includes(filters.institution) ||
          filters.institution?.includes(site.name)
      )
    : sites;

  return [
    { value: "", label: "All Site Numbers" },
    ...filteredSites
      .map((site) => ({
        value: site.siteNumber || site.id,
        label: site.siteNumber || site.id
      }))
      .sort((a, b) =>
        String(a.label).localeCompare(String(b.label), undefined, {
          numeric: true,
          sensitivity: "base"
        })
      )
  ];
}

export function getStudyOptions(user = getCurrentUser()) {
  const filters = getFilterState();
  let studies = filterStudies(getBaseStudies(user), filters);

  if (filters.institution && isAdmin(user)) {
    studies = getStudiesForSite(filters.institution).map(normalizeStudy);
    studies = filterStudies(studies, { ...filters, institution: "" });
  }

  return studies
    .sort((a, b) =>
      String(a.code).localeCompare(String(b.code), undefined, {
        numeric: true,
        sensitivity: "base"
      })
    )
    .map((study) => ({
      value: study.code,
      label: study.code
    }));
}

export function getSubjectOptions(user = getCurrentUser()) {
  const filters = getFilterState();
  const studies = filterStudies(getBaseStudies(user), filters);
  const studyCodes = new Set(studies.map((study) => String(study.code)));
  const subjectsByStudy = readSubjectsByStudy();

  const subjects = Object.entries(subjectsByStudy).flatMap(([studyKey, list]) => {
    if (filters.studyCode && String(studyKey) !== String(filters.studyCode)) {
      return [];
    }

    if (!filters.studyCode && studyCodes.size && !studyCodes.has(String(studyKey))) {
      return [];
    }

    return (Array.isArray(list) ? list : []).map((subject) => ({
      value: String(subject.subjectId || subject.id),
      label: String(subject.subjectId || subject.id),
      studyKey
    }));
  });

  return subjects.sort((a, b) =>
    String(a.label).localeCompare(String(b.label), undefined, {
      numeric: true,
      sensitivity: "base"
    })
  );
}

export function getDefaultInstitution(user = getCurrentUser()) {
  return getStoredInstitutionFilter() || getAssignedSite(user) || "";
}
