import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import "./StudyWorkspace.css";
import "./SponsorShared.css";
import { getPortfolioStudies, getRisks } from "./data/sponsorDataStore";

function StudyWorkspace() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [study, setStudy] = useState(null);
  const [openRisks, setOpenRisks] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const refresh = () => {
      const studies = getPortfolioStudies();
      const match = studies.find((s) => s.studyId === id);
      setStudy(match || null);
      setOpenRisks(getRisks().filter((r) => r.study === id && r.status === "Open").length);
    };
    refresh();
    window.addEventListener("sponsor-data-updated", refresh);
    return () => window.removeEventListener("sponsor-data-updated", refresh);
  }, [id]);

  if (!study) {
    return (
      <AppLayout>
        <div className="page-container">
          <div className="sponsor-page-header">
            <h1>Study Not Found</h1>
            <p>Could not load study {id}.</p>
          </div>
          <button type="button" className="sponsor-btn-primary" onClick={() => navigate("/studies")}>
            Back to Studies
          </button>
        </div>
      </AppLayout>
    );
  }

  const enrollmentRate = study.target
    ? Math.round((study.enrolled / study.target) * 100)
    : 0;

  return (
    <AppLayout>
      <div className="page-container">
        <div className="workspace-header">
          <h1>{study.studyName}</h1>
          <p>Study ID: {study.studyId} · {study.phase} · {study.status}</p>
        </div>

        <div className="study-kpi-container">
          <div className="study-kpi-card">
            <h3>Enrolled</h3>
            <p>{study.enrolled?.toLocaleString() ?? 0}</p>
          </div>
          <div className="study-kpi-card">
            <h3>Target</h3>
            <p>{study.target?.toLocaleString() ?? 0}</p>
          </div>
          <div className="study-kpi-card">
            <h3>Sites</h3>
            <p>{study.sites ?? 0}</p>
          </div>
          <div className="study-kpi-card">
            <h3>Enrollment Rate</h3>
            <p>{enrollmentRate}%</p>
          </div>
        </div>

        <div className="workspace-tabs">
          <button type="button" className={activeTab === "overview" ? "active-tab" : ""} onClick={() => setActiveTab("overview")}>
            Overview
          </button>
          <button type="button" className={activeTab === "details" ? "active-tab" : ""} onClick={() => setActiveTab("details")}>
            Study Details
          </button>
          <button type="button" className={activeTab === "enrollment" ? "active-tab" : ""} onClick={() => setActiveTab("enrollment")}>
            Enrollment
          </button>
        </div>

        {activeTab === "overview" && (
          <div className="workspace-content workspace-card">
            <div className="performance-cards">
              <div className="study-kpi-card">
                <h3>CRO</h3>
                <p>{study.cro || "—"}</p>
              </div>
              <div className="study-kpi-card">
                <h3>Therapeutic Area</h3>
                <p>{study.therapeuticArea || "—"}</p>
              </div>
              <div className="study-kpi-card">
                <h3>Open Risks</h3>
                <p>{openRisks}</p>
              </div>
              <div className="study-kpi-card">
                <h3>Start Date</h3>
                <p>{study.startDate || "—"}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "details" && (
          <div className="workspace-content workspace-card">
            <p><strong>Study ID:</strong> {study.studyId}</p>
            <p><strong>Phase:</strong> {study.phase}</p>
            <p><strong>Status:</strong> {study.status}</p>
            <p><strong>CRO:</strong> {study.cro}</p>
            <p><strong>Sites:</strong> {study.sites}</p>
            <p><strong>Therapeutic Area:</strong> {study.therapeuticArea}</p>
          </div>
        )}

        {activeTab === "enrollment" && (
          <div className="workspace-content workspace-card">
            <p><strong>Enrolled:</strong> {study.enrolled} / {study.target}</p>
            <p><strong>Progress:</strong> {enrollmentRate}%</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default StudyWorkspace;
