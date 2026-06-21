import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { initializeAdminData } from "./services/adminService";
import { initializeStudies } from "./services/studyService";

// Friend imports
import { CommentsProvider } from "./CommentsContext";
import { CROProvider } from "./pages/CRO/CRODATAContext";

// UPDATED: seed admin and studies localStorage data on app startup
initializeAdminData();
initializeStudies();

const root = ReactDOM.createRoot(
  document.getElementById("root")
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CommentsProvider>
        <CROProvider>
          <App />
        </CROProvider>
      </CommentsProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app,
// pass a function to log results
// (for example: reportWebVitals(console.log))
// or send to an analytics endpoint.
// Learn more: https://bit.ly/CRA-vitals

reportWebVitals();