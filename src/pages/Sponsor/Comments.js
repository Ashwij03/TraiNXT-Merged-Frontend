import React from "react";
import AppLayout from "./AppLayout";
import RoleCommentsView from "../../components/common/RoleCommentsView";
import "../shared/operations/Comments.css";

export default function CommentsPage() {
  return (
    <AppLayout>
      <RoleCommentsView embedded />
    </AppLayout>
  );
}
