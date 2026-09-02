// NEW FILE (Requirement L1): Subscription data service — localStorage-backed,
// mirrors the exact pattern already used in studyService.js
// (defaultStudies -> STUDIES_STORAGE_KEY -> getStoredStudies/saveStoredStudies).
// No new persistence approach is introduced.

const SUBSCRIPTION_STORAGE_KEY = "trianxtSubscription";

const defaultSubscription = {
  plan: "Professional",
  status: "Active",
  startDate: "2026-01-01",
  endDate: "2026-12-31",
  maxStudies: 10,
  maxUsers: 25,
  // NOTE: no real storage-usage metric exists elsewhere in the codebase yet,
  // so storageLimitGb is mocked here as a default the same way other
  // service defaults (e.g. defaultSettings in adminService.js) are mocked.
  storageLimitGb: 100,
  autoRenewal: true,
  notes: ""
};

function getStoredSubscription() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(
      localStorage.getItem(SUBSCRIPTION_STORAGE_KEY)
    );
  } catch {
    return null;
  }
}

function saveStoredSubscription(subscription) {
  localStorage.setItem(
    SUBSCRIPTION_STORAGE_KEY,
    JSON.stringify(subscription)
  );
}

export function initializeSubscription() {
  if (typeof window === "undefined") {
    return defaultSubscription;
  }

  const stored = getStoredSubscription();

  if (!stored) {
    saveStoredSubscription(defaultSubscription);
    return defaultSubscription;
  }

  return stored;
}

export function getSubscription() {
  return initializeSubscription();
}

export function saveSubscription(updates) {
  const current = getSubscription();

  const updatedSubscription = {
    ...current,
    ...updates
  };

  saveStoredSubscription(updatedSubscription);
  return updatedSubscription;
}