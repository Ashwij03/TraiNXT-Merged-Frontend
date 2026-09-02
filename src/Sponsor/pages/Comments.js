import React from "react";
import AppLayout from "./AppLayout";
import RoleCommentsView from "../../shared/components/RoleCommentsView";
import "../../shared/pages/operations/Comments.css";

export default function CommentsPage() {
  return (
    <AppLayout>
      <RoleCommentsView embedded />
    </AppLayout>
  );
}
