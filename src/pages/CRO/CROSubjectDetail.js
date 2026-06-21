import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import CROLayout from "./CROLayout";
import { useCROData } from "./CRODATAContext";
import CROStatusBadge from "./CROStatusBadge";
import EmptyState from "./EmptyState";

function CROSubjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { subjects } = useCROData();

  const subject = subjects.find((s) => s.id === id);

  if (!subject) {
    return (
      <CROLayout>
        <EmptyState
          title="No Subject Found"
          message={`Subject ${id} was not found.`}
        />
        <button
          type="button"
          onClick={() => navigate("/cro-subject-management")}
          style={{
            marginTop: 16,
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Back to Subject Management
        </button>
      </CROLayout>
    );
  }

  return (
    <CROLayout>
      <div className="cro-subject-detail">
        <button
          type="button"
          className="cro-back-btn"
          onClick={() => navigate("/cro-subject-management")}
        >
          ← Back to Subjects
        </button>

        <h1>{subject.id}</h1>
        <p className="cro-subject-detail-subtitle">Complete Subject Information</p>

        <div className="cro-subject-detail-grid">
          <div className="dashboard-card">
            <h3>Study</h3>
            <p>{subject.study}</p>
          </div>
          <div className="dashboard-card">
            <h3>Site</h3>
            <p>{subject.site}</p>
          </div>
          <div className="dashboard-card">
            <h3>Status</h3>
            <CROStatusBadge status={subject.status} />
          </div>
          <div className="dashboard-card">
            <h3>Enrollment Date</h3>
            <p>{subject.enrollment}</p>
          </div>
          <div className="dashboard-card">
            <h3>Current Visit</h3>
            <p>{subject.visit}</p>
          </div>
        </div>
      </div>
    </CROLayout>
  );
}

export default CROSubjectDetail;
