import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import { resolveSiteDisplay } from "../../utils/siteDisplay";
import { getStudies } from "../../services/studyService";
import "./VisitDetails.css";

function VisitDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const visitData = {
    "VIS-001": {
      studyId: "TRIA-001",
      subjectId: "SUB-001",
      site: "Hyderabad",
      visitType: "Month 3",
      scheduledDate: "10-Jun-2026",
      actualDate: "10-Jun-2026",
      status: "Completed",
      deviation: "No",
      notes: "Subject completed visit successfully."
    },

    "VIS-002": {
      studyId: "TRIA-001",
      subjectId: "SUB-002",
      site: "Hyderabad",
      visitType: "Baseline",
      scheduledDate: "12-Jun-2026",
      actualDate: "-",
      status: "Upcoming",
      deviation: "No",
      notes: "Visit scheduled."
    },

    "VIS-003": {
      studyId: "TRIA-002",
      subjectId: "SUB-003",
      site: "Bangalore",
      visitType: "Month 1",
      scheduledDate: "08-Jun-2026",
      actualDate: "12-Jun-2026",
      status: "Completed",
      deviation: "Yes",
      notes: "Visit completed with protocol deviation."
    }
  };

  const visit = visitData[id];
  const siteSources = useMemo(() => getStudies(), []);
  const displaySite = (value) =>
    value
      ? resolveSiteDisplay(value, {
          sources: siteSources,
          fallback: value
        })
      : "—";

  if (!visit) {
    return (
      <AppLayout>
        <div className="visit-details-page">
          <h2>Visit Not Found</h2>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="visit-details-page">

        <button
          className="back-btn"
          onClick={() => navigate("/visits")}
        >
          Back to Visits
        </button>

        <h1>Visit Details</h1>

        <div className="details-card">
          <p><strong>Visit ID:</strong> {id}</p>
          <p><strong>Study ID:</strong> {visit.studyId}</p>
          <p><strong>Subject ID:</strong> {visit.subjectId}</p>
          <p><strong>Site:</strong> {displaySite(visit.site)}</p>
          <p><strong>Visit Type:</strong> {visit.visitType}</p>
          <p><strong>Scheduled Date:</strong> {visit.scheduledDate}</p>
          <p><strong>Actual Date:</strong> {visit.actualDate}</p>
          <p><strong>Status:</strong> {visit.status}</p>
          <p><strong>Protocol Deviation:</strong> {visit.deviation}</p>
          <p><strong>Notes:</strong> {visit.notes}</p>
        </div>

      </div>
    </AppLayout>
  );
}

export default VisitDetails;