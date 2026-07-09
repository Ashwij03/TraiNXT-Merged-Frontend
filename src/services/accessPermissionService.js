const REQUESTS_KEY = "accessPermissionRequests";
const HISTORY_KEY = "accessPermissionHistory";
const APPROVED_SCOPES_KEY = "approvedPermissionScopes";

export const PERMISSION_REQUESTS_UPDATED = "permission-requests-updated";
export const PERMISSIONS_UPDATED = "permissions-updated";

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

function notifyPermissionRequestsUpdated() {
  window.dispatchEvent(new Event(PERMISSION_REQUESTS_UPDATED));
  window.dispatchEvent(new Event(PERMISSIONS_UPDATED));
  window.dispatchEvent(new Event("sponsor-data-updated"));
}

function normalizeRequest(request) {
  return {
    id: request.id,
    user: request.user || request.requestedBy || "Unknown User",
    email: request.email || "",
    role: request.role || "",
    action: request.action || request.accessType || "Edit Access",
    module: request.module || "General",
    recordId: request.recordId || "",
    recordName: request.recordName || "",
    studySubject:
      request.studySubject ||
      request.recordName ||
      request.recordId ||
      request.module ||
      "General",
    accessType: request.accessType || request.action || "Edit Access",
    reason: request.reason || request.notes || "",
    notes: request.notes || request.reason || "",
    requestedBy: request.requestedBy || request.user || "Unknown User",
    requestedOn:
      request.requestedOn ||
      request.timestamp?.slice(0, 10) ||
      new Date().toISOString().slice(0, 10),
    timestamp: request.timestamp || new Date().toISOString(),
    status: request.status || "Pending",
    resolvedOn: request.resolvedOn || "",
  };
}

export function getAllAccessRequests() {
  return readJson(REQUESTS_KEY, []).map(normalizeRequest);
}

export function getPendingAccessRequests() {
  return getAllAccessRequests().filter((request) => request.status === "Pending");
}

export function getAccessRequestHistory() {
  const history = readJson(HISTORY_KEY, []).map(normalizeRequest);
  const resolvedFromPending = getAllAccessRequests().filter(
    (request) => request.status !== "Pending",
  );
  return [...history, ...resolvedFromPending].sort((a, b) =>
    String(b.timestamp || b.requestedOn).localeCompare(
      String(a.timestamp || a.requestedOn),
    ),
  );
}

export function getApprovedPermissionScopes(email) {
  const scopes = readJson(APPROVED_SCOPES_KEY, []);
  if (!email) return scopes;
  return scopes.filter(
    (scope) => String(scope.email).toLowerCase() === String(email).toLowerCase(),
  );
}

export function hasApprovedScope(email, action, module, recordId = "") {
  return getApprovedPermissionScopes(email).some((scope) => {
    const actionMatch = scope.action === action || scope.accessType === action;
    const moduleMatch = scope.module === module;
    const recordMatch = !scope.recordId || !recordId || scope.recordId === recordId;
    return actionMatch && moduleMatch && recordMatch;
  });
}

function grantApprovedScope(request) {
  const scopes = readJson(APPROVED_SCOPES_KEY, []);
  scopes.push({
    id: `SCOPE-${Date.now()}`,
    email: request.email,
    role: request.role,
    action: request.action,
    module: request.module,
    recordId: request.recordId,
    recordName: request.recordName,
    accessType: request.accessType,
    grantedOn: new Date().toISOString(),
    requestId: request.id,
  });
  writeJson(APPROVED_SCOPES_KEY, scopes);
}

export function acceptAccessRequest(requestId) {
  const requests = readJson(REQUESTS_KEY, []);
  const index = requests.findIndex((request) => request.id === requestId);

  if (index < 0) {
    return null;
  }

  const updated = normalizeRequest({
    ...requests[index],
    status: "Approved",
    resolvedOn: new Date().toISOString().slice(0, 10),
  });

  requests[index] = updated;
  writeJson(REQUESTS_KEY, requests);
  grantApprovedScope(updated);

  const history = readJson(HISTORY_KEY, []);
  history.unshift(updated);
  writeJson(HISTORY_KEY, history);

  notifyPermissionRequestsUpdated();
  return updated;
}

export function revokeAccessRequest(requestId) {
  const requests = readJson(REQUESTS_KEY, []);
  const index = requests.findIndex((request) => request.id === requestId);

  if (index < 0) {
    return null;
  }

  const updated = normalizeRequest({
    ...requests[index],
    status: "Rejected",
    resolvedOn: new Date().toISOString().slice(0, 10),
  });

  requests[index] = updated;
  writeJson(REQUESTS_KEY, requests);

  const history = readJson(HISTORY_KEY, []);
  history.unshift(updated);
  writeJson(HISTORY_KEY, history);

  notifyPermissionRequestsUpdated();
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
      approvalStatus: "Revoked",
    };
  });

  writeJson("users", updated);

  const scopes = readJson(APPROVED_SCOPES_KEY, []).filter(
    (scope) => String(scope.email).toLowerCase() !== String(userEmail).toLowerCase(),
  );
  writeJson(APPROVED_SCOPES_KEY, scopes);
  notifyPermissionRequestsUpdated();

  return updated.find((user) => user.email === userEmail) || null;
}

export const removeUserPermissions = removeUserPermission;

export function submitAccessRequest(payload, user) {
  const requests = readJson(REQUESTS_KEY, []);
  const nextId = `REQ-${String(requests.length + 1).padStart(3, "0")}`;

  const entry = normalizeRequest({
    id: nextId,
    user: user?.name || "Unknown User",
    email: user?.email || "",
    role: user?.role || "",
    action: payload.action || payload.accessType || "Edit Access",
    module: payload.module || "General",
    recordId: payload.recordId || "",
    recordName: payload.recordName || payload.studySubject || "",
    studySubject: payload.studySubject || payload.recordName || "General",
    accessType: payload.accessType || payload.action || "Edit Access",
    reason: payload.reason || payload.notes || "",
    notes: payload.notes || payload.reason || "",
    requestedBy: user?.name || "Unknown User",
    requestedOn: new Date().toISOString().slice(0, 10),
    timestamp: new Date().toISOString(),
    status: "Pending",
  });

  requests.push(entry);
  writeJson(REQUESTS_KEY, requests);
  notifyPermissionRequestsUpdated();
  return entry;
}
