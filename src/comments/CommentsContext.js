import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getComments } from "../services/adminService";
import {
  addCommentRecord,
  deleteCommentRecord,
  isOpenComment,
  reopenCommentRecord,
  resolveCommentRecord,
  updateCommentRecord,
} from "../services/commentService";
import { getCurrentUser } from "../services/roleService";

const CommentsContext = createContext();

export { isOpenComment };

export function CommentsProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [comments, setComments] = useState(() => getComments(currentUser));

  const refreshComments = useCallback(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setComments(getComments(user));
  }, []);

  useEffect(() => {
    refreshComments();

    window.addEventListener("comments-updated", refreshComments);
    window.addEventListener("sponsor-data-updated", refreshComments);

    return () => {
      window.removeEventListener("comments-updated", refreshComments);
      window.removeEventListener("sponsor-data-updated", refreshComments);
    };
  }, [refreshComments]);

  const pendingCount = useMemo(
    () => comments.filter(isOpenComment).length,
    [comments]
  );

  const addComment = useCallback(
    (visitId, data = {}) => {
      const record = addCommentRecord(
        {
          visitId,
          description: data.text || data.description || "",
          subjectId: data.subjectId || data.subject || "",
          study: data.study || data.studyCode || "",
          site: data.site || currentUser?.assignedSite || "",
          stage: data.visitName || data.stage || "General",
        },
        currentUser
      );

      refreshComments();
      return record;
    },
    [currentUser, refreshComments]
  );

  const resolveComment = useCallback(
    (id) => {
      resolveCommentRecord(id, currentUser);
      refreshComments();
    },
    [currentUser, refreshComments]
  );

  const reopenComment = useCallback(
    (id) => {
      reopenCommentRecord(id, currentUser);
      refreshComments();
    },
    [currentUser, refreshComments]
  );

  // Phase-7 Subject Comments: expose edit/delete on the shared context so
  // the SubjectComments modal doesn't have to reach into commentService
  // directly and can reuse the same refresh flow every other consumer
  // subscribes to.
  const updateComment = useCallback(
    (id, updates) => {
      const record = updateCommentRecord(id, updates, currentUser);
      refreshComments();
      return record;
    },
    [currentUser, refreshComments]
  );

  const deleteComment = useCallback(
    (id) => {
      const ok = deleteCommentRecord(id, currentUser);
      refreshComments();
      return ok;
    },
    [currentUser, refreshComments]
  );

  return (
    <CommentsContext.Provider
      value={{
        comments,
        pendingCount,
        addComment,
        resolveComment,
        reopenComment,
        updateComment,
        deleteComment,
        refreshComments,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

export const useComments = () => useContext(CommentsContext);