import React, { useState } from "react";
import AppLayout from "./AppLayout";
import "./SiteDetails.css";
import { useLocation, useNavigate } from "react-router-dom";
import { getStudyByCode } from "../../services/studyService";
import {
  getStudyTeam,
  getRegulatoryChecklist,
} from "../../services/planningService";
import {
  getAllSubjectsFromStorage,
  getSubjectStatusAnalytics,
} from "../../utils/subjectStatusAnalytics";
import {
  getEssentialDocumentsCompletion,
  getStudyScopedSitePerformance,
  getStudyHealthSummary,
} from "../../services/studyOverviewService";
import { getStudyLogs } from "../../services/adminService";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const SiteDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const siteData = location.state;

  const studyData = siteData
    ? getStudyByCode(siteData.id)
    : null;

  const studyTeam = siteData
    ? getStudyTeam(siteData.id)
    : [];

  const regulatoryChecklist = siteData
    ? getRegulatoryChecklist(siteData.id)
    : [];

  const allSubjects = getAllSubjectsFromStorage();

  const essentialDocumentMetrics = siteData
    ? getEssentialDocumentsCompletion(siteData.id)
    : {
        uploaded: 0,
        expected: 0,
        percent: 0,
        complete: false,
      };

  const sitePerformanceMetrics = siteData
    ? getStudyScopedSitePerformance(siteData.id)
    : [];

  const studyHealthMetrics = siteData
    ? getStudyHealthSummary(siteData.id)
    : {
        score: 0,
        status: "",
        factors: [],
      };

  const studyLogs = siteData
    ? getStudyLogs(siteData.id)
    : [];

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

  const normalizeValue = (value) =>
    String(value ?? "").trim().toLowerCase();

  const siteSubjects = allSubjects.filter((subject) => {
    const sameStudy =
      normalizeValue(subject.studyKey) ===
      normalizeValue(siteData.id);

    const sameSite =
      normalizeValue(subject.site) ===
      normalizeValue(siteData.name);

    return sameStudy && sameSite;
  });

  const subjectStatusAnalytics =
    getSubjectStatusAnalytics(siteSubjects);

  const getStatusCount = (status) =>
    subjectStatusAnalytics.find(
      (item) => item.name === status
    )?.value ?? 0;

  const enrollmentAnalytics = {
    planned: 0,
    screened: getStatusCount("Screening"),
    randomized: 0,
    completed: getStatusCount("Completed"),
    earlyTermination:
      getStatusCount("Withdrawn") +
      getStatusCount("Dropout"),
  };

  const enrolled = Number(siteData.enrolled ?? 0);
  const target = Number(siteData.target ?? 0);

  const enrollmentProgress =
    target > 0
      ? Math.min(
          Math.round((enrolled / target) * 100),
          100
        )
      : 0;

  const enrollmentChartData = [
    {
      name: "Current Enrollment",
      subjects: enrolled,
    },
    {
      name: "Target Enrollment",
      subjects: target,
    },
  ];

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

            <h1>
              {siteData.siteNumber || siteData.id || "Clinical Site"}
            </h1>

            <p>
              Site Name: {siteData.name || "—"} |{" "}
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
            className={
              activeTab === "overview" ? "active" : ""
            }
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>

          <button
            type="button"
            className={
              activeTab === "enrollment" ? "active" : ""
            }
            onClick={() => setActiveTab("enrollment")}
          >
            Enrollment
          </button>

          <button
            type="button"
            className={
              activeTab === "status" ? "active" : ""
            }
            onClick={() => setActiveTab("status")}
          >
            Status
          </button>

          <button
            type="button"
            className={
              activeTab === "activity" ? "active" : ""
            }
            onClick={() => setActiveTab("activity")}
          >
            Activity
          </button>

          <button
            type="button"
            className={
              activeTab === "details" ? "active" : ""
            }
            onClick={() => setActiveTab("details")}
          >
            Detailed Site Info
          </button>

          <button
            type="button"
            className={
              activeTab === "analytics" ? "active" : ""
            }
            onClick={() => setActiveTab("analytics")}
          >
            Enrollment Analytics
          </button>

          <button
            type="button"
            className={
              activeTab === "metrics" ? "active" : ""
            }
            onClick={() => setActiveTab("metrics")}
          >
            Dashboard Metrics
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
                <p>
                  {siteData.sponsor ||
                    siteData.account ||
                    "—"}
                </p>
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

        {activeTab === "enrollment" && (
          <div className="details-card">
            <h2>Enrollment Projection Chart</h2>

            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={enrollmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="subjects"
                  fill="#082b3d"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeTab === "status" && (
          <div className="details-card">
            <h2>Status Progress</h2>

            <div className="details-grid">
              <div>
                <strong>Current Status</strong>
                <p>{siteData.status || "—"}</p>
              </div>

              <div>
                <strong>Subjects Enrolled</strong>
                <p>{enrolled}</p>
              </div>

              <div>
                <strong>Target Subjects</strong>
                <p>{target}</p>
              </div>

              <div>
                <strong>Enrollment Progress</strong>
                <p>{enrollmentProgress}%</p>
              </div>
            </div>

            <div className="site-progress-section">
              <div className="site-progress-header">
                <span>Enrollment Progress</span>

                <strong>
                  {enrolled} / {target}
                </strong>
              </div>

              <div className="site-progress-track">
                <div
                  className="site-progress-fill"
                  style={{
                    width: `${enrollmentProgress}%`,
                  }}
                />
              </div>

              <p className="site-progress-text">
                {enrollmentProgress}% of target enrolled
              </p>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="site-empty-state">
            <h4>No Activity Available</h4>

            <p>
              There are currently no activity records for this site.
            </p>

            <button
              type="button"
              className="site-empty-btn"
            >
              + Add Activity
            </button>
          </div>
        )}

        {activeTab === "details" && (
          <div className="details-card">
            <h2>Detailed Site Info</h2>

            <section className="site-info-section">
              <h3>General Information</h3>

              <div className="details-grid">
                <div>
                  <strong>Study Code</strong>
                  <p>{studyData?.code || "—"}</p>
                </div>

                <div>
                  <strong>Study Name</strong>
                  <p>{studyData?.name || "—"}</p>
                </div>

                <div>
                  <strong>Protocol</strong>
                  <p>{studyData?.protocol || "—"}</p>
                </div>

                <div>
                  <strong>Indication</strong>
                  <p>{studyData?.indication || "—"}</p>
                </div>

                <div>
                  <strong>Country</strong>
                  <p>{studyData?.country || "—"}</p>
                </div>

                <div>
                  <strong>Site</strong>
                  <p>
                    {studyData?.site ||
                      studyData?.location ||
                      "—"}
                  </p>
                </div>

                <div>
                  <strong>Sponsor</strong>
                  <p>{studyData?.sponsor || "—"}</p>
                </div>

                <div>
                  <strong>CRO</strong>
                  <p>{studyData?.cro || "—"}</p>
                </div>

                <div>
                  <strong>Status</strong>
                  <p>{studyData?.status || "—"}</p>
                </div>

                <div>
                  <strong>
                    Principal Investigator
                  </strong>
                  <p>
                    {studyData?.principalInvestigator ||
                      "—"}
                  </p>
                </div>

                <div>
                  <strong>Start Date</strong>
                  <p>{studyData?.startDate || "—"}</p>
                </div>

                <div>
                  <strong>Description</strong>
                  <p>{studyData?.description || "—"}</p>
                </div>
              </div>
            </section>

            <section className="site-info-section">
              <h3>Assignments</h3>

              <div className="site-empty-state">
                <h4>No Assignments</h4>

                <p>
                  No assignments have been created for this site.
                </p>

                <button
                  type="button"
                  className="site-empty-btn"
                >
                  + Create Assignment
                </button>
              </div>
            </section>

            <section className="site-info-section">
              <h3>Study Team</h3>

              {studyTeam.length === 0 ? (
                <div className="site-empty-state">
                  <h4>No Study Team</h4>

                  <p>
                    No study team members have been assigned.
                  </p>

                  <button
                    type="button"
                    className="site-empty-btn"
                  >
                    + Add Team Member
                  </button>
                </div>
              ) : (
                <div className="site-team-grid">
                  {studyTeam.map((member) => (
                    <div
                      className="site-team-card"
                      key={member.id}
                    >
                      <strong>
                        {member.name || "—"}
                      </strong>

                      <p>
                        <span>Role</span>
                        {member.role || "—"}
                      </p>

                      <p>
                        <span>Organization</span>
                        {member.organization || "—"}
                      </p>

                      <p>
                        <span>Start Date</span>
                        {member.startDate || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="site-info-section">
              <h3>Contact Info</h3>

              {studyTeam.length === 0 ? (
              <div className="site-empty-state">
                  <h4>No Contact Information</h4>

                  <p>
                    No contact information has been added.
                  </p>

                  <button
                    type="button"
                    className="site-empty-btn"
                  >
                    + Add Contact
                  </button>
                </div>
              ) : (
                <div className="site-team-grid">
                  {studyTeam.map((member) => (
                    <div
                      className="site-team-card"
                      key={`contact-${member.id}`}
                    >
                      <strong>
                        {member.name || "—"}
                      </strong>

                      <p>
                        <span>Email</span>
                        {member.email || "—"}
                      </p>

                      <p>
                        <span>Phone</span>
                        {member.phone || "—"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="site-info-section">
              <h3>Site Activation Details</h3>

              <div className="site-empty-state">
                <h4>No Activation Details</h4>

                <p>
                  No activation milestones have been recorded.
                </p>

                <button
                  type="button"
                  className="site-empty-btn"
                >
                  + Add Activation
                </button>
              </div>
            </section>

            <section className="site-info-section">
              <h3>Regulatory Info</h3>

              {regulatoryChecklist.length === 0 ? (
                <div className="site-empty-state">
                  <h4>No Regulatory Information</h4>

                  <p>
                    Regulatory records are not available.
                  </p>

                  <button
                    type="button"
                    className="site-empty-btn"
                  >
                    + Add Regulatory Record
                  </button>
                </div>
              ) : (
                <div className="site-regulatory-list">
                  {regulatoryChecklist.map(
                    (item, index) => (
                      <div
                        className="site-regulatory-item"
                        key={item.id || index}
                      >
                        {Object.entries(item).map(
                          ([key, value]) => (
                            <p key={key}>
                              <span>{key}</span>

                              {value === null ||
                              value === undefined ||
                              value === ""
                                ? "—"
                                : String(value)}
                            </p>
                          )
                        )}
                      </div>
                    )
                  )}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="analytics-section">
            <div className="details-card">
              <h2>Site Enrollment Analytics</h2>

              <div className="site-enrollment-analytics-grid">
                <div className="site-enrollment-analytics-card">
                  <span>Planned</span>
                  <strong>
                    {enrollmentAnalytics.planned}
                  </strong>
                </div>

                <div className="site-enrollment-analytics-card">
                  <span>Screened</span>
                  <strong>
                    {enrollmentAnalytics.screened}
                  </strong>
                </div>

                <div className="site-enrollment-analytics-card">
                  <span>Randomized</span>
                  <strong>
                    {enrollmentAnalytics.randomized}
                  </strong>
                </div>

                <div className="site-enrollment-analytics-card">
                  <span>Completed</span>
                  <strong>
                    {enrollmentAnalytics.completed}
                  </strong>
                </div>

                <div className="site-enrollment-analytics-card">
                  <span>Early Termination</span>
                  <strong>
                    {enrollmentAnalytics.earlyTermination}
                  </strong>
                </div>
              </div>

              <div className="site-enrollment-statistics">
                <h3>Enrollment Statistics</h3>

                <div className="details-grid">
                  <div>
                    <strong>Current Enrollment</strong>
                    <p>{enrolled}</p>
                  </div>

                  <div>
                    <strong>Target Enrollment</strong>
                    <p>{target}</p>
                  </div>

                  <div>
                    <strong>Enrollment Progress</strong>
                    <p>{enrollmentProgress}%</p>
                  </div>

                  <div>
                    <strong>Site Subject Records</strong>
                    <p>{siteSubjects.length}</p>
                  </div>
                </div>

                <div className="clinical-site-enrollment-section">
                  <div className="clinical-site-enrollment-header">
                    <span>Enrollment Progress</span>

                    <strong>
                      {enrolled} / {target}
                    </strong>
                  </div>

                  <div className="clinical-site-enrollment-track">
                    <div
                      className="clinical-site-enrollment-fill"
                      style={{
                        width: `${enrollmentProgress}%`,
                      }}
                    />
                  </div>

                  <p>
                    {enrollmentProgress}% of target enrolled
                  </p>
                </div>
              </div>

              <div className="site-subject-status-analytics">
                <h3>Subject Status Analytics</h3>

                <ResponsiveContainer
                  width="100%"
                  height={320}
                >
                  <BarChart data={subjectStatusAnalytics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />

                    <Bar
                      dataKey="value"
                      fill="#082b3d"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "metrics" && (
          <div className="details-card">
            <h2>Site Dashboard Metrics</h2>

            <div className="details-grid">
              <div>
                <strong>
                  Essential Document Status
                </strong>

                <p>
                  {essentialDocumentMetrics.complete
                    ? "Complete"
                    : "Incomplete"}
                </p>
              </div>

              <div>
                <strong>Document Completion</strong>
                <p>
                  {essentialDocumentMetrics.percent}%
                </p>
              </div>

              <div>
                <strong>Documents Uploaded</strong>
                <p>
                  {essentialDocumentMetrics.uploaded}
                </p>
              </div>

              <div>
                <strong>Expected Documents</strong>
                <p>
                  {essentialDocumentMetrics.expected}
                </p>
              </div>
            </div>

            <div className="site-progress-section">
              <div className="site-progress-header">
                <span>
                  Essential Document Completion
                </span>

                <strong>
                  {essentialDocumentMetrics.uploaded} /{" "}
                  {essentialDocumentMetrics.expected}
                </strong>
              </div>

              <div className="site-progress-track">
                <div
                  className="site-progress-fill"
                  style={{
                    width: `${essentialDocumentMetrics.percent}%`,
                  }}
                />
              </div>

              <p className="site-progress-text">
                {essentialDocumentMetrics.percent}% complete
              </p>
            </div>

            <section className="site-info-section">
              <h3>Key Risk Indicators</h3>

              <div className="details-grid">
                <div>
                  <strong>Study Health Score</strong>
                  <p>{studyHealthMetrics.score}</p>
                </div>

                <div>
                  <strong>Study Health Status</strong>
                  <p>
                    {studyHealthMetrics.status || "—"}
                  </p>
                </div>

                <div>
                  <strong>Total Risk Indicators</strong>
                  <p>
                    {studyHealthMetrics.factors.length}
                  </p>
                </div>
              </div>

              <div className="site-regulatory-list">
                {studyHealthMetrics.factors.length > 0 ? (
                  studyHealthMetrics.factors.map(
                    (factor, index) => (
                      <div
                        className="site-regulatory-item"
                        key={`${factor.label}-${index}`}
                      >
                        <p>
                          <span>Risk Indicator</span>
                          {factor.label}
                        </p>

                        <p>
                          <span>Impact</span>
                          {factor.impact}
                        </p>
                      </div>
                    )
                  )
                ) : (
                    <div className="site-empty-state">
                      <h4>No Risk Indicators</h4>

                      <p>
                        There are currently no risk indicators for this site.
                      </p>

                      <button
                        type="button"
                        className="site-empty-btn"
                      >
                        + Add Risk Indicator
                      </button>
                    </div>
                )}
              </div>
            </section>

            <section className="site-info-section">
              <h3>Site KPIs</h3>

              {sitePerformanceMetrics.length > 0 ? (
                <div className="site-regulatory-list">
                  {sitePerformanceMetrics.map(
                    (metric, index) => (
                      <div
                        className="site-regulatory-item"
                        key={index}
                      >
                        <pre>
                          {JSON.stringify(
                            metric,
                            null,
                            2
                          )}
                        </pre>
                      </div>
                    )
                  )}
                </div>
              ) : (
                  <div className="site-empty-state">
                    <h4>No KPI Records</h4>

                    <p>
                      Site KPIs have not been configured.
                    </p>

                    <button
                      type="button"
                      className="site-empty-btn"
                    >
                      + Add KPI
                    </button>
                  </div>
              )}
            </section>

            <section className="site-info-section">
              <h3>System / Audit Info</h3>

              {studyLogs.length > 0 ? (
                <div className="site-regulatory-list">
                  {studyLogs.map((log, index) => (
                    <div
                      className="site-regulatory-item"
                      key={index}
                    >
                      {Object.entries(log).map(
                        ([key, value]) => (
                          <p key={key}>
                            <span>{key}</span>

                            {value === null ||
                            value === undefined ||
                            value === ""
                              ? "—"
                              : String(value)}
                          </p>
                        )
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                  <div className="site-empty-state">
                    <h4>No Audit Logs</h4>

                    <p>
                      No audit records are available for this site.
                    </p>

                    <button
                      type="button"
                      className="site-empty-btn"
                    >
                      + Add Audit Entry
                    </button>
                  </div>
              )}
            </section>

            <section className="site-info-section">
              <h3>Last Modified</h3>

              <div className="details-grid">
                <div>
                  <strong>Last Modified Record</strong>

                  <p>
                    {studyLogs.length > 0
                      ? JSON.stringify(
                          studyLogs[studyLogs.length - 1]
                        )
                      : "Not available"}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SiteDetails;
