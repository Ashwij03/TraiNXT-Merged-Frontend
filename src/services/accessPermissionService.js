const REQUESTS_KEY = "accessPermissionRequests";
const HISTORY_KEY = "accessPermissionHistory";

function readJson(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function seedRequestsIfEmpty() {
  const existing = readJson(REQUESTS_KEY, null);

  if (Array.isArray(existing) && existing.length > 0) {
    return existing;
  }

  const defaults = [
    {
      id: "REQ-001",
      user: "ClinTech CRO",
      email: "cro@clintech.com",
      studySubject: "STUDY-2025-001",
      accessType: "Edit Access",
      requestedOn: "2025-05-20",
      status: "Pending"
    },
    {
      id: "REQ-002",
      user: "MedPharm Sponsor",
      email: "sponsor@medpharm.com",
      studySubject: "SUB-001 / STUDY-747-303",
      accessType: "Restricted Content",
      requestedOn: "2025-05-22",
      status: "Pending"
    },
    {
      id: "REQ-003",
      user: "Global CRO Monitor",
      email: "monitor@globalcro.com",
      studySubject: "STUDY-05151",
      accessType: "Document Owner Access",
      requestedOn: "2025-05-24",
      status: "Pending"
    }
  ];

  writeJson(REQUESTS_KEY, defaults);
  return defaults;
}

export function getPendingAccessRequests() {
  seedRequestsIfEmpty();
  return readJson(REQUESTS_KEY, []).filter(
    (request) => request.status === "Pending"
  );
}

export function getAccessRequestHistory() {
  seedRequestsIfEmpty();
  const history = readJson(HISTORY_KEY, []);
  const resolvedFromPending = readJson(REQUESTS_KEY, []).filter(
    (request) => request.status !== "Pending"
  );
  return [...history, ...resolvedFromPending].sort((a, b) =>
    String(b.requestedOn).localeCompare(String(a.requestedOn))
  );
}

export function acceptAccessRequest(requestId) {
  const requests = readJson(REQUESTS_KEY, []);
  const index = requests.findIndex((request) => request.id === requestId);

  if (index < 0) {
    return null;
  }

  const updated = {
    ...requests[index],
    status: "Accepted",
    resolvedOn: new Date().toISOString().slice(0, 10)
  };

  requests[index] = updated;
  writeJson(REQUESTS_KEY, requests);

  const history = readJson(HISTORY_KEY, []);
  history.unshift(updated);
  writeJson(HISTORY_KEY, history);

  return updated;
}

export function revokeAccessRequest(requestId) {
  const requests = readJson(REQUESTS_KEY, []);
  const index = requests.findIndex((request) => request.id === requestId);

  if (index < 0) {
    return null;
  }

  const updated = {
    ...requests[index],
    status: "Revoked",
    resolvedOn: new Date().toISOString().slice(0, 10)
  };

  requests[index] = updated;
  writeJson(REQUESTS_KEY, requests);

  const history = readJson(HISTORY_KEY, []);
  history.unshift(updated);
  writeJson(HISTORY_KEY, history);

  return updated;
}

export function removeUserPermission(userEmail) {
  const users = readJson("users", []);
  const updated = users.map((user) => {
    if (user.email !== userEmail) {
      return user;
    }

    return {
      ...user,
      permissions: [],
      requestedPermissions: [],
      approvalStatus: "Revoked"
    };
  });

  writeJson("users", updated);
  return updated.find((user) => user.email === userEmail) || null;
}

export const removeUserPermissions = removeUserPermission;

export function submitAccessRequest(payload, user) {
  const requests = readJson(REQUESTS_KEY, []);
  const nextId = `REQ-${String(requests.length + 1).padStart(3, "0")}`;

  const entry = {
    id: nextId,
    user: user?.name || "Unknown User",
    email: user?.email || "",
    studySubject: payload.studySubject || "General",
    accessType: payload.accessType || "Edit Access",
    requestedOn: new Date().toISOString().slice(0, 10),
    status: "Pending"
  };

  requests.push(entry);
  writeJson(REQUESTS_KEY, requests);
  return entry;
}
