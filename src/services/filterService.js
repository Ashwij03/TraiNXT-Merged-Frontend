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
    site: study.site || study.location || "",
    country: study.country || ""
  };
}

function getBaseStudies(user = getCurrentUser()) {
  const studies = (isAdmin(user) ? getStudies() : getAccessibleStudies(user)).map(
    normalizeStudy
  );

  return studies;
}

function filterStudies(studies, filters, user = getCurrentUser()) {
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

  // Site Name and Site Number both describe the same institution, so
  // whichever one was actually selected should narrow the studies. If only
  // a Site Number was picked, resolve it back to its institution name via
  // the shared directory before filtering.
  const effectiveInstitution =
    filters.institution || getInstitutionForSiteNumber(filters.siteNumber, user);

  if (effectiveInstitution) {
    result = result.filter((study) => {
      const site = study.site || study.location || "";
      return (
        site === effectiveInstitution ||
        site.includes(effectiveInstitution) ||
        effectiveInstitution.includes(site)
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

// Resolves the institution name paired with a given Site Number, and vice
// versa, using the same stable directory getSiteNumberOptions/
// getInstitutionOptions are built from. This is what lets selecting either
// field in the header filter show the correct value in the other.
export function getInstitutionForSiteNumber(siteNumber, user = getCurrentUser()) {
  if (!siteNumber) {
    return "";
  }

  const entry = getSiteNumberDirectory(user).find(
    (candidate) => String(candidate.number) === String(siteNumber)
  );

  return entry ? entry.name : "";
}

export function getSiteNumberForInstitution(institution, user = getCurrentUser()) {
  if (!institution) {
    return "";
  }

  const directory = getSiteNumberDirectory(user);
  const entry =
    directory.find((candidate) => candidate.name === institution) ||
    directory.find(
      (candidate) =>
        candidate.name.includes(institution) || institution.includes(candidate.name)
    );

  return entry ? entry.number : "";
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
  const studies = filterStudies(getBaseStudies(user), filters, user);
  const studySites = [...new Set(studies.map((study) => study.site).filter(Boolean))];
  const accessibleSites = getAccessibleSites(user).map((site) => site.name);

  let merged = [...new Set([...studySites, ...accessibleSites])];

  if (filters.siteNumber) {
    const matchedName = getInstitutionForSiteNumber(filters.siteNumber, user);
    merged = matchedName ? merged.filter((name) => name === matchedName) : [];
  }

  merged = merged.sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );

  return [
    { value: "", label: "All Institutions" },
    ...merged.map((value) => ({ value, label: value }))
  ];
}

// Institutions in this app aren't backed by a real "sites" table that a Site
// Number is ever entered into — institution names only ever come from what's
// typed on a Study's Site/Hospital field or a user's Organization Type. This
// builds the Site Number <-> Site Name pairing everywhere else in the app
// already assumes exists, deriving one stable "SITE-00N" per distinct
// institution name (alphabetical order keeps the numbering the same across
// renders/sessions) while still honoring a real siteNumber if one was ever
// entered directly on a study.
export function getSiteNumberDirectory(user = getCurrentUser()) {
  const studies = getBaseStudies(user);
  const accessibleSites = getAccessibleSites(user);

  const studySiteNames = studies.map((study) => study.site).filter(Boolean);
  const accessibleSiteNames = accessibleSites
    .map((site) => site.name)
    .filter(Boolean);

  const siteNames = [
    ...new Set([...studySiteNames, ...accessibleSiteNames])
  ].sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );

  return siteNames.map((name, index) => {
    const matchedStudy = studies.find(
      (study) => study.site === name && (study.siteNumber || study.siteNo)
    );
    const matchedAccessibleSite = accessibleSites.find(
      (site) => site.name === name && (site.siteNumber || site.id)
    );

    const number =
      matchedStudy?.siteNumber ||
      matchedStudy?.siteNo ||
      matchedAccessibleSite?.siteNumber ||
      matchedAccessibleSite?.id ||
      `SITE-${String(index + 1).padStart(3, "0")}`;

    return { number: String(number), name };
  });
}

export function getSiteNumberOptions(user = getCurrentUser()) {
  const filters = getFilterState();

  const directory = getSiteNumberDirectory(user).filter(
    (entry) =>
      !filters.institution ||
      entry.name === filters.institution ||
      entry.name?.includes(filters.institution) ||
      filters.institution?.includes(entry.name)
  );

  return [
    { value: "", label: "All Site Numbers" },
    ...directory
      .map((entry) => ({
        value: entry.number,
        label: entry.number
      }))
      .sort((a, b) =>
        String(a.value).localeCompare(String(b.value), undefined, {
          numeric: true,
          sensitivity: "base"
        })
      )
  ];
}

export function getStudyOptions(user = getCurrentUser()) {
  const filters = getFilterState();

  // Study options are only meaningful once the list has been narrowed down
  // by Indication or Institution (Site Name/Site Number) — otherwise every
  // study across every site would show up at once. Require one of those
  // filters first.
  const effectiveInstitution =
    filters.institution || getInstitutionForSiteNumber(filters.siteNumber, user);

  if (!filters.indication && !effectiveInstitution) {
    return [];
  }

  let studies = filterStudies(getBaseStudies(user), filters, user);

  if (effectiveInstitution && isAdmin(user)) {
    studies = getStudiesForSite(effectiveInstitution).map(normalizeStudy);
    studies = filterStudies(studies, { ...filters, institution: "" }, user);
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

  // Same rule as studies: don't surface subjects from every study across
  // every site until the list has been narrowed by Indication or
  // Institution (Site Name/Site Number) — a specific Study selection also
  // narrows things further down below, but that itself requires reaching
  // this point first.
  const effectiveInstitution =
    filters.institution || getInstitutionForSiteNumber(filters.siteNumber, user);

  if (!filters.indication && !effectiveInstitution) {
    return [];
  }

  const studies = filterStudies(getBaseStudies(user), filters, user);
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

export function getFilteredStudies(user = getCurrentUser()) {
    return filterStudies(
        getBaseStudies(user),
        getFilterState(),
        user
    );
}