// Shared notifications data service.
//
// Single localStorage key ("notifications") holds every notification record
// across every study — this is the same key CRODATAContext.getSharedNotifications()
// and Sponsor's sponsorDataStore already read from and listen for
// ("notifications-updated"), so this service is the missing writer they were
// built to expect (see the "notification service" comments already left in
// reportService.js and commentService.js).
//
// There is no seeding/default data here on purpose (B10 requires no static
// notifications when storage is empty). Records are only ever created by an
// explicit action (subject/visit/document/report/comment/permission event),
// via the notify* helpers below.
import ROLES from "../constants/roles";
import { getCurrentUser, getEffectiveRole, getAccessibleStudies } from "./roleService";

const NOTIFICATIONS_KEY = "notifications";
const NOTIFICATIONS_UPDATED_EVENT = "notifications-updated";
// Keep unbounded growth in check so metadata-only records never approach a
// localStorage quota limit on their own.
const MAX_STORED_NOTIFICATIONS = 500;

function readNotifications() {
  try {
    const parsed = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeNotifications(notifications) {
  try {
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    return true;
  } catch (error) {
    if (error?.name === "QuotaExceededError") {
      // Notification metadata is tiny, but fail safely rather than crash if
      // storage is already full from something else.
      window.alert("Storage limit reached. Unable to save this notification.");
      return false;
    }

    throw error;
  }
}

function notifyNotificationsUpdated() {
  window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
  window.dispatchEvent(new Event("sponsor-data-updated"));
}

function accessibleStudyCodeSet(user) {
  return new Set(
    getAccessibleStudies(user)
      .map((study) => String(study?.code || ""))
      .filter(Boolean),
  );
}

function isVisibleToUser(notification, user) {
  const role = getEffectiveRole(user);
  const targetRoles = Array.isArray(notification.targetRoles)
    ? notification.targetRoles
    : [];

  // Empty targetRoles means "everyone" (used for study-wide system events).
  if (targetRoles.length && !targetRoles.includes(role)) {
    return false;
  }

  // No studyCode means a global/system notification, visible to anyone who
  // matches the role filter above.
  if (!notification.studyCode) {
    return true;
  }

  if (role === ROLES.ADMIN) {
    return true;
  }

  return accessibleStudyCodeSet(user).has(String(notification.studyCode));
}

// Generic writer — every public notify* helper below funnels through here so
// storage shape and the "only dispatch when something actually changed"
// rule stay in one place. `eventId` is an optional stable identity for
// transition/reminder events that must never duplicate on navigation/remount.
export function createNotification({
  title,
  message,
  studyCode = "",
  targetRoles = [],
  type = "",
  eventId = "",
  metadata = {},
  createdAt = "",
}) {
  const cleanTitle = String(title || "").trim();
  const cleanMessage = String(message || "").trim();
  const cleanEventId = String(eventId || "").trim();

  if (!cleanTitle || !cleanMessage) {
    return null;
  }

  const existing = readNotifications();

  if (cleanEventId) {
    const duplicate = existing.find(
      (notification) => notification.eventId === cleanEventId,
    );

    if (duplicate) {
      return duplicate;
    }
  }

  const record = {
    id: `NOTIF-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: cleanTitle,
    message: cleanMessage,
    studyCode: studyCode ? String(studyCode) : "",
    targetRoles: Array.isArray(targetRoles) ? targetRoles : [],
    type: String(type || "").trim(),
    eventId: cleanEventId,
    metadata: metadata && typeof metadata === "object" ? metadata : {},
    createdAt: createdAt ? String(createdAt) : new Date().toISOString(),
    read: false,
  };

  const next = [record, ...existing].slice(0, MAX_STORED_NOTIFICATIONS);

  if (!writeNotifications(next)) {
    return null;
  }

  notifyNotificationsUpdated();
  return record;
}

// Every read is scoped to the requesting user on purpose — there is no
// unscoped "get all notifications" export, so a caller can never
// accidentally render notifications from a study/role the user can't see.
export function getNotificationsForUser(user = getCurrentUser()) {
  if (!user) {
    return [];
  }

  return readNotifications()
    .filter((notification) => isVisibleToUser(notification, user))
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
}

export function getUnreadCountForUser(user = getCurrentUser()) {
  return getNotificationsForUser(user).filter((item) => !item.read).length;
}

export function markNotificationRead(notificationId, user = getCurrentUser()) {
  const visibleIds = new Set(
    getNotificationsForUser(user).map((item) => item.id),
  );

  if (!visibleIds.has(notificationId)) {
    return getNotificationsForUser(user);
  }

  const all = readNotifications();
  const target = all.find((item) => item.id === notificationId);

  if (!target || target.read) {
    return getNotificationsForUser(user);
  }

  const updated = all.map((item) =>
    item.id === notificationId ? { ...item, read: true } : item,
  );

  if (!writeNotifications(updated)) {
    return getNotificationsForUser(user);
  }

  notifyNotificationsUpdated();
  return getNotificationsForUser(user);
}

export function markAllNotificationsReadForUser(user = getCurrentUser()) {
  const visibleIds = new Set(
    getNotificationsForUser(user).map((item) => item.id),
  );

  if (!visibleIds.size) {
    return [];
  }

  const all = readNotifications();
  let changed = false;

  const updated = all.map((item) => {
    if (visibleIds.has(item.id) && !item.read) {
      changed = true;
      return { ...item, read: true };
    }

    return item;
  });

  if (!changed) {
    return getNotificationsForUser(user);
  }

  if (!writeNotifications(updated)) {
    return getNotificationsForUser(user);
  }

  notifyNotificationsUpdated();
  return getNotificationsForUser(user);
}

// ---------------------------------------------------------------------------
// Event-specific helpers. Each wraps createNotification with a sensible
// title/message/target for one meaningful action from the B10 list. Callers
// (subject/visit/document/report/comment/permission services) call these
// once the underlying record is actually saved — never during render.
// ---------------------------------------------------------------------------

const OPERATIONAL_ROLES = [ROLES.ADMIN, ROLES.SITE_STAFF, ROLES.PI];

export function notifySubjectCreated(subject) {
  return createNotification({
    title: "Subject added",
    message: `Subject ${subject?.subjectId || subject?.id || ""} was added to ${subject?.studyCode || "the study"}${
      subject?.addedByRole ? ` by ${subject.addedByRole}` : ""
    }.`,
    studyCode: subject?.studyCode,
    targetRoles: OPERATIONAL_ROLES,
  });
}

export function notifySubjectUpdated(subject) {
  return createNotification({
    title: "Subject updated",
    message: `Subject ${subject?.subjectId || subject?.id || ""} was updated in ${subject?.studyCode || "the study"}.`,
    studyCode: subject?.studyCode,
    targetRoles: OPERATIONAL_ROLES,
  });
}

export function notifyVisitCreated(visit) {
  return createNotification({
    title: "Visit scheduled",
    message: `A visit was scheduled for subject ${visit?.subjectId || ""} on ${visit?.date || "an upcoming date"}.`,
    studyCode: visit?.studyCode,
    targetRoles: OPERATIONAL_ROLES,
  });
}

export function notifyVisitUpdated(visit) {
  return createNotification({
    title: "Visit updated",
    message: `The visit for subject ${visit?.subjectId || ""} was updated (status: ${visit?.status || "unknown"}).`,
    studyCode: visit?.studyCode,
    targetRoles: OPERATIONAL_ROLES,
  });
}

export function notifyDocumentAdded(document) {
  const byClause = document?.addedByRole ? ` by ${document.addedByRole}` : "";
  const sectionClause = document?.sectionLabel
    ? ` in ${document.sectionLabel}`
    : "";

  return createNotification({
    title: "Document added",
    message: `${document?.name || "A document"} was added to ${document?.studyCode || "the study"}${byClause}${sectionClause}.`,
    studyCode: document?.studyCode,
    targetRoles: OPERATIONAL_ROLES,
  });
}

export function notifyReportCreated(report) {
  return createNotification({
    title: "Report created",
    message: `Report "${report?.name || ""}" was created for ${report?.studyCode || "the study"}.`,
    studyCode: report?.studyCode,
    targetRoles: [...OPERATIONAL_ROLES, ROLES.SPONSOR],
  });
}

export function notifyReportUpdated(report) {
  return createNotification({
    title: "Report updated",
    message: `Report "${report?.name || ""}" was updated (status: ${report?.status || "unknown"}).`,
    studyCode: report?.studyCode,
    targetRoles: [...OPERATIONAL_ROLES, ROLES.SPONSOR],
  });
}

export function notifyCommentAdded(comment) {
  return createNotification({
    title: "New comment",
    message: `${comment?.authorRole || "Someone"} added a comment on ${comment?.studyCode || "a study"}.`,
    studyCode: comment?.studyCode,
    targetRoles: OPERATIONAL_ROLES,
  });
}

export function notifyPermissionRequestCreated(request) {
  return createNotification({
    title: "Permission request submitted",
    message: `${request?.role || "A user"} requested "${request?.action || "access"}" on ${request?.studyCode || "a study"}.`,
    studyCode: request?.studyCode,
    targetRoles: [ROLES.ADMIN, ROLES.SITE_STAFF],
  });
}

export function notifyPermissionRequestApproved(request) {
  return createNotification({
    title: "Permission request approved",
    message: `Your request for "${request?.action || "access"}" on ${request?.studyCode || "a study"} was approved.`,
    studyCode: request?.studyCode,
    targetRoles: [request?.role].filter(Boolean),
  });
}

export function notifyPermissionRequestRejected(request) {
  return createNotification({
    title: "Permission request rejected",
    message: `Your request for "${request?.action || "access"}" on ${request?.studyCode || "a study"} was rejected.`,
    studyCode: request?.studyCode,
    targetRoles: [request?.role].filter(Boolean),
  });
}

export function notifyStudyCompleted(study) {
  const studyCode = study?.code || study?.studyCode || study?.id || "";
  const completedDate = study?.completedDate || "";
  const eventId = `study_completed:${studyCode}:${completedDate}`;
  const studyName =
    study?.name ||
    study?.studyName ||
    study?.protocol ||
    studyCode ||
    "the study";

  if (!studyCode || !completedDate) {
    return null;
  }

  return createNotification({
    title: "Study Completed",
    message: `Study ${studyName} has been completed.`,
    studyCode,
    targetRoles: [ROLES.SITE_STAFF, ROLES.PI],
    type: "study_completed",
    eventId,
    metadata: {
      studyCode,
      studyName,
      completedDate,
    },
    createdAt: completedDate,
  });
}

export function notifyUpcomingVisitReminder({
  schedule,
  studyCode = "",
  targetRoles = [ROLES.SITE_STAFF, ROLES.PI],
  recipientKey = "",
  occurrenceDate = "",
}) {
  const visitId = schedule?.id || "";
  const scheduledDate = schedule?.date || "";
  const visitName = schedule?.visit || "Scheduled visit";
  const subjectId = schedule?.subjectId || schedule?.subject || "";
  const resolvedStudyCode =
    studyCode || schedule?.study || schedule?.studyKey || "";
  const resolvedOccurrenceDate = occurrenceDate || scheduledDate;
  const resolvedRecipientKey =
    recipientKey ||
    (Array.isArray(targetRoles) ? targetRoles.join("+") : String(targetRoles || ""));
  const eventId = [
    "upcoming_visit_reminder",
    visitId,
    resolvedOccurrenceDate,
    resolvedStudyCode,
    resolvedRecipientKey,
  ]
    .map((part) => String(part || "").trim())
    .join(":");

  if (!visitId || !scheduledDate || !resolvedStudyCode || !resolvedRecipientKey) {
    return null;
  }

  return createNotification({
    title: "Upcoming Visit Reminder",
    message: `Visit ${visitName} for Subject ${subjectId || "—"} is scheduled for tomorrow.`,
    studyCode: resolvedStudyCode,
    targetRoles,
    type: "upcoming_visit_reminder",
    eventId,
    metadata: {
      visitId,
      visitName,
      subjectId,
      studyCode: resolvedStudyCode,
      site: schedule?.site || "",
      scheduledDate,
      occurrenceDate: resolvedOccurrenceDate,
    },
  });
}

export const NOTIFICATIONS_UPDATED = NOTIFICATIONS_UPDATED_EVENT;
