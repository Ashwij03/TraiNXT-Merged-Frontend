import React, { createContext, useContext, useState } from "react";

const CommentsContext = createContext();

export function CommentsProvider({ children }) {
  const [comments, setComments] = useState([
    {
      id: "E1",
      subject: "J-D 77777",
      visitId: "unscheduled-1",
      visitNumber: 3,
      week: 24,
      visitName: "Screening",
      procedure: "Full Physical Exam",
      author: "Kristen Bosse",
      text: "testing",
      date: "11/12/2019",
      status: "resolved", // ✅ use status (not resolved:true)
    },
  ]);

  // ✅ ADD COMMENT
  const addComment = (visitId, data) => {
    const newComment = {
      id: "E" + Math.floor(Math.random() * 1000),
      visitId,
      subject: "J-D 77777",
      visitNumber: data.visitNumber || 1,
      week: data.week || 1,
      visitName: data.visitName || "Screening",
      procedure: data.visitName || "Procedure",
      author: "Alice TestOne",
      text: data.text,
      status: data.status,
      date: new Date().toLocaleDateString(),
    };

    setComments((prev) => [newComment, ...prev]);
  };

  // ✅ RESOLVE COMMENT (optional)
  const resolveComment = (id) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "resolved" } : c
      )
    );
  };

  // ✅ RETURN MUST BE INSIDE FUNCTION
  return (
    <CommentsContext.Provider
      value={{ comments, addComment, resolveComment }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

// ✅ CUSTOM HOOK
export const useComments = () => useContext(CommentsContext);