// Shared header filter keys, storage helpers, and change events.

export const SELECTED_INDICATION_KEY = "selectedIndication";
export const SELECTED_INSTITUTION_KEY = "selectedInstitution";
export const SELECTED_SITE_NUMBER_KEY = "selectedSiteNumber";
export const SELECTED_SPONSOR_KEY = "selectedSponsor";
export const SELECTED_CRO_KEY = "selectedCRO";
export const SELECTED_STUDY_FILTER_KEY = "selectedStudyFilter";
export const SELECTED_SUBJECT_KEY = "selectedSubject";
export const ADMIN_PREVIEW_ROLE_KEY = "adminPreviewRole";
export const ADMIN_PREVIEW_ROLE_EVENT = "adminPreviewRoleChange";
export const PI_PREVIEW_ROLE_KEY = "piPreviewRole";
export const PI_PREVIEW_ROLE_EVENT = "piPreviewRoleChange";
export const INSTITUTION_FILTER_EVENT = "institutionFilterChange";
export const HEADER_FILTERS_EVENT = "headerFiltersChange";

function dispatchFilterEvent(detail = {}) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(HEADER_FILTERS_EVENT, { detail })
  );
}

export function getStoredValue(key) {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(key) || "";
}

export function setStoredValue(key, value) {
  if (typeof window === "undefined") {
    return;
  }

  if (value) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
  }
}

export function getStoredInstitutionFilter() {
  return getStoredValue(SELECTED_INSTITUTION_KEY);
}

export function setStoredInstitutionFilter(value) {
  setStoredValue(SELECTED_INSTITUTION_KEY, value);
  dispatchFilterEvent({ institution: value });

  window.dispatchEvent(
    new CustomEvent(INSTITUTION_FILTER_EVENT, { detail: value })
  );
}

export function getStoredIndicationFilter() {
  return getStoredValue(SELECTED_INDICATION_KEY);
}

export function setStoredIndicationFilter(value) {
  setStoredValue(SELECTED_INDICATION_KEY, value);
  dispatchFilterEvent({ indication: value });
}

export function getStoredSiteNumberFilter() {
  return getStoredValue(SELECTED_SITE_NUMBER_KEY);
}

export function setStoredSiteNumberFilter(value) {
  setStoredValue(SELECTED_SITE_NUMBER_KEY, value);
  dispatchFilterEvent({ siteNumber: value });
}

export function getStoredSponsorFilter() {
  return getStoredValue(SELECTED_SPONSOR_KEY);
}

export function setStoredSponsorFilter(value) {
  setStoredValue(SELECTED_SPONSOR_KEY, value);
  dispatchFilterEvent({ sponsor: value });
}

export function getStoredCROFilter() {
  return getStoredValue(SELECTED_CRO_KEY);
}

export function setStoredCROFilter(value) {
  setStoredValue(SELECTED_CRO_KEY, value);
  dispatchFilterEvent({ cro: value });
}

export function getStoredStudyFilter() {
  return getStoredValue(SELECTED_STUDY_FILTER_KEY);
}

export function setStoredStudyFilter(value) {
  setStoredValue(SELECTED_STUDY_FILTER_KEY, value);
  dispatchFilterEvent({ study: value });
}

export function getStoredSubjectFilter() {
  return getStoredValue(SELECTED_SUBJECT_KEY);
}

export function setStoredSubjectFilter(value) {
  setStoredValue(SELECTED_SUBJECT_KEY, value);
  dispatchFilterEvent({ subject: value });
}

export function getStoredAdminPreviewRole() {
  return getStoredValue(ADMIN_PREVIEW_ROLE_KEY);
}

export function setStoredAdminPreviewRole(role) {
  if (typeof window === "undefined") {
    return;
  }

  const nextRole = role || "";
  const currentRole = getStoredAdminPreviewRole() || "";

  if (nextRole === currentRole) {
    return;
  }

  if (role) {
    localStorage.setItem(ADMIN_PREVIEW_ROLE_KEY, role);
  } else {
    localStorage.removeItem(ADMIN_PREVIEW_ROLE_KEY);
  }

  window.dispatchEvent(
    new CustomEvent(ADMIN_PREVIEW_ROLE_EVENT, { detail: role || "" })
  );
}

export function getStoredPIPreviewRole() {
  return getStoredValue(PI_PREVIEW_ROLE_KEY);
}

export function setStoredPIPreviewRole(role) {
  if (typeof window === "undefined") {
    return;
  }

  const nextRole = role || "";
  const currentRole = getStoredPIPreviewRole() || "";

  if (nextRole === currentRole) {
    return;
  }

  if (role) {
    localStorage.setItem(PI_PREVIEW_ROLE_KEY, role);
  } else {
    localStorage.removeItem(PI_PREVIEW_ROLE_KEY);
  }

  window.dispatchEvent(
    new CustomEvent(PI_PREVIEW_ROLE_EVENT, { detail: role || "" })
  );
}

export function clearDependentFilters(fromKey) {
  const cascade = {
    [SELECTED_INDICATION_KEY]: [
      SELECTED_SPONSOR_KEY,
      SELECTED_CRO_KEY,
      SELECTED_INSTITUTION_KEY,
      SELECTED_SITE_NUMBER_KEY,
      SELECTED_STUDY_FILTER_KEY,
      SELECTED_SUBJECT_KEY
    ],
    [SELECTED_SPONSOR_KEY]: [
      SELECTED_CRO_KEY,
      SELECTED_INSTITUTION_KEY,
      SELECTED_SITE_NUMBER_KEY,
      SELECTED_STUDY_FILTER_KEY,
      SELECTED_SUBJECT_KEY
    ],
    [SELECTED_CRO_KEY]: [
      SELECTED_INSTITUTION_KEY,
      SELECTED_SITE_NUMBER_KEY,
      SELECTED_STUDY_FILTER_KEY,
      SELECTED_SUBJECT_KEY
    ],
    [SELECTED_INSTITUTION_KEY]: [
      SELECTED_SITE_NUMBER_KEY,
      SELECTED_STUDY_FILTER_KEY,
      SELECTED_SUBJECT_KEY
    ],
    [SELECTED_SITE_NUMBER_KEY]: [
      SELECTED_STUDY_FILTER_KEY,
      SELECTED_SUBJECT_KEY
    ],
    [SELECTED_STUDY_FILTER_KEY]: [SELECTED_SUBJECT_KEY]
  };

  (cascade[fromKey] || []).forEach((key) => setStoredValue(key, ""));
}
