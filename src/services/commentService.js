import ROLES from "../constants/roles";
import { getComments, saveComments } from "./adminService";
import {
  getCurrentUser,
  getEffectiveRole,
  hasPermission,
  getAccessibleStudies
} from "./roleService";
import PERMISSIONS from "../constants/permissions";
import { notifyCommentAdded } from "./notificationService";

// Two different features share this one comment store:
// 1. Document/subject-level QC comments (DocumentFolderManager, StudyComments)
//    — these carry a documentId/subjectId and, for Sponsor, stay hidden
//    until the document/study reaches a final stage. This is pre-existing
//    behavior and is preserved as-is.
// 2. Top-level per-study Comments (RoleCommentsView, used by the Sponsor
//    and Admin "Comments" tab) — these never carry a documentId/subjectId
//    and must be visible to every permitted role immediately, scoped only
//    by study (B7). They were incorrectly falling through to the same
//    Sponsor stage-gate below, which hid a Sponsor's own comment from
//    them and from every other role right after posting it.
const FINAL_STAGES = ["Final", "Closeout", "Completed"];
const RESTRICTED_ROLES = [ROLES.CRO, ROLES.SPONSOR];

export function isOpenComment(comment) {
  const status = String(comment?.status || "").toLowerCase();
  return status === "open" || status === "unresolved";
}

function isDocumentScopedComment(comment) {
  return Boolean(comment.documentId || comment.subjectId);
}

function accessibleStudyCodeSet(user) {
  return new Set(
    getAccessibleStudies(user)
      .map((study) => String(study?.code || ""))
      .filter(Boolean)
  );
}

export function canWriteComments(user = getCurrentUser()) {
  return hasPermission(PERMISSIONS.CREATE_COMMENT, user);
}

export function canResolveComments(user = getCurrentUser()) {
  const role = getEffectiveRole(user);
  return (
    hasPermission(PERMISSIONS.RESOLVE_COMMENT, user) &&
    [ROLES.ADMIN, ROLES.SITE_STAFF, ROLES.PI].includes(role)
  );
}

// CRO/Sponsor may only ever post a top-level comment — they can never
// reply to an existing one.
export function canReplyToComments(user = getCurrentUser()) {
  const role = getEffectiveRole(user);
  return !RESTRICTED_ROLES.includes(role);
}

export function canViewComment(comment, user = getCurrentUser(), studyStage) {
  if (!hasPermission(PERMISSIONS.VIEW_COMMENTS, user)) {
    return false;
  }

  const role = getEffectiveRole(user);

  if (role === ROLES.SPONSOR && isDocumentScopedComment(comment)) {
    const stage = comment.stage || studyStage || "";
    return FINAL_STAGES.includes(stage);
  }

  // CRO/Sponsor must never see comments from a study they don't have
  // access to (applies to both document-scoped and top-level comments).
  if (RESTRICTED_ROLES.includes(role)) {
    const studyCode = String(comment.study || comment.studyCode || "");
    return studyCode ? accessibleStudyCodeSet(user).has(studyCode) : false;
  }

  return true;
}

export function getVisibleComments(options = {}, user = getCurrentUser()) {
  const { studyCode, subjectId, documentId, studyStage } = options;
  let comments = getComments(user);

  if (studyCode) {
    comments = comments.filter(
      (item) => String(item.study) === String(studyCode)
    );
  }

  if (subjectId) {
    comments = comments.filter(
      (item) => String(item.subjectId) === String(subjectId)
    );
  }

  if (documentId) {
    comments = comments.filter(
      (item) =>
        String(item.documentId) === String(documentId) ||
        String(item.document) === String(documentId)
    );
  }

  return comments.filter((comment) =>
    canViewComment(comment, user, studyStage)
  );
}

function notifyCommentsUpdated() {
  window.dispatchEvent(new Event("comments-updated"));
  window.dispatchEvent(new Event("sponsor-data-updated"));
  // "notifications-updated" is dispatched separately, only when
  // notifyCommentAdded below actually creates a notification record
  // (see B10) — never fired unconditionally from here.
}

export function addCommentRecord(payload, user = getCurrentUser()) {
  if (!canWriteComments(user)) {
    return null;
  }

  const role = getEffectiveRole(user);
  const requestedParentId = payload.parentId || null;

  // CRO/Sponsor can only ever create a top-level comment — silently force
  // parentId to null instead of trusting a caller-supplied value.
  const parentId = RESTRICTED_ROLES.includes(role) ? null : requestedParentId;

  const comments = getComments(user);
  const newComment = {
    id: `C-${Date.now()}`,
    visitId: payload.visitId || "",
    parentId,
    subjectId: payload.subjectId || "",
    document: payload.document || payload.documentName || "",
    documentId: payload.documentId || "",
    documentDeleted: false,
    study: payload.study || payload.studyCode || "",
    site: payload.site || user?.assignedSite || "",
    status: "Open",
    priority: payload.priority || "Medium",
    stage: payload.stage || "Monitoring",
    createdAt: new Date().toISOString().slice(0, 10),
    createdBy: user?.name || "Unknown",
    description: payload.description || payload.text || "",
    createdRole: role
  };

  saveComments([newComment, ...comments]);
  notifyCommentsUpdated();
  // notifyCommentAdded expects { studyCode, authorRole }, while this
  // record's own schema (shared with the document-scoped QC comment
  // feature above) uses { study, createdRole } — adapt the field names
  // here rather than renaming the stored record shape everywhere else.
  notifyCommentAdded({
    studyCode: newComment.study,
    authorRole: newComment.createdRole,
  });
  return newComment;
}

export function resolveCommentRecord(commentId, user = getCurrentUser()) {
  if (!canResolveComments(user)) {
    return false;
  }

  const comments = getComments(user).map((item) =>
    item.id === commentId
      ? {
          ...item,
          status: "Resolved",
          resolvedAt: new Date().toISOString(),
          resolvedBy: user?.name || "Unknown"
        }
      : item
  );

  saveComments(comments);
  notifyCommentsUpdated();
  return true;
}

// Canonical reopen: mirrors resolveCommentRecord so a "Reopen" action from
// any consumer flows through the same access checks and fires the same
// comments-updated / sponsor-data-updated events every other view listens
// for. Previously reopens were performed by writing via saveComments
// directly, which only dispatched admin-data-updated — CommentsContext
// (and every consumer that subscribes to it) would not refresh until the
// next reload.
export function reopenCommentRecord(commentId, user = getCurrentUser()) {
  if (!canResolveComments(user)) {
    return false;
  }

  const comments = getComments(user).map((item) => {
    if (item.id !== commentId) {
      return item;
    }

    // Preserve the rest of the record; just clear resolution metadata and
    // restore canonical Open status.
    const { resolvedAt, resolvedBy, ...rest } = item;
    void resolvedAt;
    void resolvedBy;
    return {
      ...rest,
      status: "Open"
    };
  });

  saveComments(comments);
  notifyCommentsUpdated();
  return true;
}

export function markCommentsDocumentDeleted(documentId, documentName) {
  const comments = getComments().map((item) => {
    const matches =
      String(item.documentId) === String(documentId) ||
      (documentName && item.document === documentName);

    if (!matches) {
      return item;
    }

    return {
      ...item,
      documentDeleted: true,
      document: documentName || item.document
    };
  });

  saveComments(comments);
  notifyCommentsUpdated();
}