import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import { initializeAdminData } from "./services/adminService";
import { initializeStudies } from "./services/studyService";
import { initializeUpcomingVisitReminderSynchronization } from "./services/visitScheduleService";

// Friend imports
import { CommentsProvider } from "./comments/CommentsContext";
import { CROProvider } from "./pages/CRO/CRODATAContext";
import { FolderProvider } from "./context/FolderContext";

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
      <CommentsProvider>
        <CROProvider>
          <FolderProvider>
            <App />
          </FolderProvider>
        </CROProvider>
      </CommentsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
