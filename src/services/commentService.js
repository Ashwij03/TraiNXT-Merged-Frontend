import ROLES from "../constants/roles";
import { getComments, saveComments } from "./adminService";
import {
  getCurrentUser,
  getEffectiveRole,
  hasPermission
} from "./roleService";
import PERMISSIONS from "../constants/permissions";

const FINAL_STAGES = ["Final", "Closeout", "Completed"];

export function canWriteComments(user = getCurrentUser()) {
  const role = getEffectiveRole(user);
  return (
    hasPermission(PERMISSIONS.CREATE_COMMENT, user) ||
    [ROLES.SITE_STAFF, ROLES.PI, ROLES.CRO].includes(role)
  );
}

export function canResolveComments(user = getCurrentUser()) {
  const role = getEffectiveRole(user);
  return (
    hasPermission(PERMISSIONS.RESOLVE_COMMENT, user) &&
    [ROLES.ADMIN, ROLES.SITE_STAFF, ROLES.PI].includes(role)
  );
}

export function canViewComment(comment, user = getCurrentUser(), studyStage) {
  const role = getEffectiveRole(user);

  if (role === ROLES.SPONSOR) {
    const stage = comment.stage || studyStage || "";
    return FINAL_STAGES.includes(stage);
  }

  return hasPermission(PERMISSIONS.VIEW_COMMENTS, user);
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

export function addCommentRecord(payload, user = getCurrentUser()) {
  if (!canWriteComments(user)) {
    return null;
  }

  const comments = getComments(user);
  const newComment = {
    id: `C-${Date.now()}`,
    subjectId: payload.subjectId || "",
    document: payload.document || payload.documentName || "",
    documentId: payload.documentId || "",
    documentDeleted: false,
    study: payload.study || "",
    site: payload.site || user?.assignedSite || "",
    status: "Open",
    priority: payload.priority || "Medium",
    stage: payload.stage || "Monitoring",
    createdAt: new Date().toISOString().slice(0, 10),
    createdBy: user?.name || "Unknown",
    description: payload.description || payload.text || "",
    createdRole: getEffectiveRole(user)
  };

  saveComments([newComment, ...comments]);
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
}
