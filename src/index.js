import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import { initializeAdminData } from "./shared/services/adminService";
import { initializeStudies } from "./shared/services/studyService";
import { initializeUpcomingVisitReminderSynchronization } from "./shared/services/visitScheduleService";

// Friend imports
import { CommentsProvider } from "./shared/comments/CommentsContext";
import { CROProvider } from "./CRO/pages/CRODATAContext";
import { FolderProvider } from "./shared/context/FolderContext";
import { AuthProvider } from "./shared/context/AuthContext";

// UPDATED: seed admin and studies localStorage data on app startup
initializeAdminData();
initializeStudies();
initializeUpcomingVisitReminderSynchronization();

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CommentsProvider>
          <CROProvider>
            <FolderProvider>
              <App />
            </FolderProvider>
          </CROProvider>
        </CommentsProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);