import React, { useState } from "react";
import AppLayout from "./AppLayout";
import "./SiteDetails.css";
import { useLocation, useNavigate } from "react-router-dom";

const SiteDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const siteData = location.state;

  const [activeTab, setActiveTab] = useState("overview");

  if (!siteData) {
    return (
      <AppLayout>
        <div className="site-details-page">
          <h2>No Site Selected</h2>

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>
        </div>
      </AppLayout>
    );
  }
  const enrolled = Number(siteData.enrolled ?? 0);
  const target = Number(siteData.target ?? 0);


  return (
    <AppLayout>
      <div className="site-details-page">

        <div className="site-workspace-header">
          <div>
            <button
              type="button"
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>

            <h1>{siteData.name || "Clinical Site"}</h1>

            <p>
              Site ID: {siteData.id || "—"} |{" "}
              {siteData.country || "—"}
            </p>
          </div>

          <span className="site-workspace-status">
            {siteData.status || "—"}
          </span>
        </div>

        <div className="site-workspace-tabs">
          <button
            type="button"
            className={activeTab === "overview" ? "active" : ""}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>

          <button
            type="button"
            className={activeTab === "enrollment" ? "active" : ""}
            onClick={() => setActiveTab("enrollment")}
          >
            Enrollment
          </button>

          <button
            type="button"
            className={activeTab === "status" ? "active" : ""}
            onClick={() => setActiveTab("status")}
          >
            Status
          </button>

          <button
            type="button"
            className={activeTab === "activity" ? "active" : ""}
            onClick={() => setActiveTab("activity")}
          >
            Activity
          </button>
        </div>

        {activeTab === "overview" && (
  <div className="details-card">
    <h2>Site Summary</h2>

    <div className="details-grid">
      <div>
        <strong>Site ID</strong>
        <p>{siteData.id || "—"}</p>
      </div>

      <div>
        <strong>Site Name</strong>
        <p>{siteData.name || "—"}</p>
      </div>

      <div>
        <strong>Country</strong>
        <p>{siteData.country || "—"}</p>
      </div>

      <div>
        <strong>Sponsor</strong>
        <p>{siteData.sponsor || siteData.account || "—"}</p>
      </div>

      <div>
        <strong>Status</strong>
        <p>{siteData.status || "—"}</p>
      </div>

      <div>
        <strong>Enrolled</strong>
        <p>{enrolled}</p>
      </div>

      <div>
        <strong>Target</strong>
        <p>{target}</p>
      </div>

      <div>
        <strong>Performance</strong>
        <p>{siteData.performance ?? 0}%</p>
      </div>
    </div>
  </div>
)}

      </div>
    </AppLayout>
  );
};

export default SiteDetails;