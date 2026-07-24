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
  isOpenComment,
  reopenCommentRecord,
  resolveCommentRecord,
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

  return (
    <CommentsContext.Provider
      value={{
        comments,
        pendingCount,
        addComment,
        resolveComment,
        reopenComment,
        refreshComments,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

export const useComments = () => useContext(CommentsContext);