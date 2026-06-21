import React from "react";
import AppLayout from "./AppLayout";
import "./SiteDetails.css";
import { useLocation, useNavigate } from "react-router-dom";
import KpiCard from "./KpiCard";

import {
  FiUsers,
  FiTrendingUp,
  FiShield,
} from "react-icons/fi";

const SiteDetails = () => {
    
  const navigate = useNavigate();
  const location = useLocation();

  const siteData = location.state;

  // ❗ SAFETY CHECK (IMPORTANT)
  if (!siteData) {
    return (
      <AppLayout>
        <div style={{ padding: "24px" }}>
          <h2>No Site Selected</h2>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="page-container">

        <div style={{ marginBottom: "20px" }}>
  <button
    className="back-btn"
    onClick={() => navigate(-1)}
  >
    ← Back
  </button>
</div>

        {/* HEADER */}
        <h1>{siteData.siteName}</h1>

        {/* KPI CARDS */}
        <div className="sponsor-kpi-grid">

 <KpiCard
  title="Enrollment"
  value={siteData.enrollment}
  subtitle="Subjects"
  icon={<FiUsers size={24} />}
  iconBg="#eff6ff"
  iconColor="#2563eb"
  onClick={() =>
    document
      .getElementById("recruitment-section")
      ?.scrollIntoView({ behavior: "smooth" })
  }
/>

  <KpiCard
  title="Performance"
  value="89%"
  subtitle="Site Score"
  icon={<FiTrendingUp size={24} />}
  iconBg="#ecfdf5"
  iconColor="#16a34a"
  onClick={() =>
    document
      .getElementById("performance-section")
      ?.scrollIntoView({ behavior: "smooth" })
  }
/>
<KpiCard
  title="Compliance"
  value={siteData.compliance}
  subtitle="Audit Ready"
  icon={<FiShield size={24} />}
  iconBg="#ede9fe"
  iconColor="#7c3aed"
  onClick={() =>
    document
      .getElementById("compliance-section")
      ?.scrollIntoView({ behavior: "smooth" })
  }
/>

<KpiCard
  title="Compliance"
  value={siteData.compliance}
  subtitle="Audit Ready"
  icon={<FiShield size={24} />}
  iconBg="#ede9fe"
  iconColor="#7c3aed"
  onClick={() =>
    document
      .getElementById("compliance-section")
      ?.scrollIntoView({ behavior: "smooth" })
  }
/>

</div>

        {/* SITE INFO */}
        <div className="details-card">

          <h2>Site Information</h2>

          <div className="details-grid">

            <div>
              <strong>Site Name</strong>
              <p>{siteData.siteName}</p>
            </div>

            <div>
              <strong>Enrollment</strong>
              <p>{siteData.enrollment}</p>
            </div>

            <div>
              <strong>Compliance</strong>
              <p>{siteData.compliance}</p>
            </div>

            <div>
              <strong>Status</strong>
              <p>{siteData.status}</p>
            </div>

          </div>

        </div>
        
       <div
  id="performance-section"
  className="details-card"
>
  <h2>Performance Metrics</h2>

  <table className="sponsor-table">

    <thead>
      <tr>
        <th>Metric</th>
        <th>Value</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>Target Enrollment</td>
        <td>250</td>
      </tr>

      <tr>
        <td>Actual Enrollment</td>
        <td>{siteData.enrollment}</td>
      </tr>

      <tr>
        <td>Completed Visits</td>
        <td>95%</td>
      </tr>

      <tr>
        <td>Open Queries</td>
        <td>8</td>
      </tr>

      <tr>
        <td>Closed Queries</td>
        <td>42</td>
      </tr>

      <tr>
        <td>Protocol Deviations</td>
        <td>3</td>
      </tr>

    </tbody>

  </table>

</div>

<div
  id="compliance-section"
  className="details-card"
>
  <h2>Compliance Overview</h2>

  <div className="details-grid">

    <div>
      <strong>Audit Status</strong>
      <p>Passed</p>
    </div>

    <div>
      <strong>Last Audit</strong>
      <p>2026-05-15</p>
    </div>

    <div>
      <strong>CAPA Status</strong>
      <p>Closed</p>
    </div>

    <div>
      <strong>Inspection Readiness</strong>
      <p>96%</p>
    </div>

  </div>

</div>
<div
  id="risk-section"
  className="details-card"
>
  <h2>Risk Assessment</h2>

  <div className="details-grid">

    <div>
      <strong>Current Risk</strong>
      <p>Low</p>
    </div>

    <div>
      <strong>Risk Score</strong>
      <p>18/100</p>
    </div>

    <div>
      <strong>Open Issues</strong>
      <p>2</p>
    </div>

    <div>
      <strong>Escalations</strong>
      <p>0</p>
    </div>

  </div>

</div>
<div
  id="recruitment-section"
  className="details-card"
>
  <h2>Recruitment Summary</h2>

  <table className="sponsor-table">

    <thead>
      <tr>
        <th>Metric</th>
        <th>Count</th>
      </tr>
    </thead>

    <tbody>

      <tr>
        <td>Screened Subjects</td>
        <td>320</td>
      </tr>

      <tr>
        <td>Randomized Subjects</td>
        <td>250</td>
      </tr>

      <tr>
        <td>Completed Subjects</td>
        <td>198</td>
      </tr>

      <tr>
        <td>Dropouts</td>
        <td>12</td>
      </tr>

    </tbody>

  </table>

</div>

      </div>
    </AppLayout>
  );
};

export default SiteDetails;