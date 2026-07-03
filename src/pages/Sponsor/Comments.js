import React from "react";
import AppLayout from "./AppLayout";
import RoleCommentsView from "../../Components/common/RoleCommentsView";

export default function CommentsPage() {
  return (
    <AppLayout>
      <RoleCommentsView embedded />
    </AppLayout>
  );
}
