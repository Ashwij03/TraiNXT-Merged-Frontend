import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";


function ScreeningDetails() {
	const navigate = useNavigate();

  const { id } = useParams();

  const screeningData = {
    id: id,
    subjectId: "SUB-001",
    study: "Diabetes Study",
    site: "Hyderabad",
    pi: "Dr Rao",
    status: "Completed",
    screeningDate: "10-May-2026",
    eligibility: "Eligible",

    ageCriteria: "Passed",
    consent: "Passed",
    medicalHistory: "Passed",
    labResults: "Passed",

    comments: "Subject meets all inclusion criteria.",

    reviewedBy: "Dr Rao",
    reviewedOn: "11-May-2026"
  };

  return (
    <AppLayout>

      <div className="screening-details-page">
	  
	  <button
	    className="back-btn"
	    onClick={() => navigate("/screening")}
	  >
	    ← Back to Screening
	  </button>

        <h1>Screening Details</h1>

        <div className="details-card">
		<div className="details-grid">

		  <div>
		    <p><strong>Screening ID:</strong> {screeningData.id}</p>
		    <p><strong>Subject ID:</strong> {screeningData.subjectId}</p>
		    <p><strong>Study:</strong> {screeningData.study}</p>
		    <p><strong>Site:</strong> {screeningData.site}</p>
		  </div>

		  <div>
		    <p><strong>PI:</strong> {screeningData.pi}</p>
		    <p><strong>Status:</strong> {screeningData.status}</p>
		    <p><strong>Date:</strong> {screeningData.screeningDate}</p>
		    <p><strong>Eligibility:</strong> {screeningData.eligibility}</p>
		  </div>

		</div>

          <h3>General Information</h3>

          <p><strong>Screening ID:</strong> {screeningData.id}</p>
          <p><strong>Subject ID:</strong> {screeningData.subjectId}</p>
          <p><strong>Study:</strong> {screeningData.study}</p>
          <p><strong>Site:</strong> {screeningData.site}</p>
          <p><strong>PI:</strong> {screeningData.pi}</p>
		  <p>
		    <strong>Status:</strong>

		    <span
		      className={`status-badge ${screeningData.status.toLowerCase()}`}
		    >
		      {screeningData.status}
		    </span>
		  </p>
          <p><strong>Screening Date:</strong> {screeningData.screeningDate}</p>
          <p><strong>Eligibility:</strong> {screeningData.eligibility}</p>

          <hr />

          <h3>Eligibility Review</h3>
		  {screeningData.failureReason && (
		    <>
		      <hr />

		      <h3>Failure Reason</h3>

		      <p>{screeningData.failureReason}</p>
		    </>
		  )}

          <p><strong>Age Criteria:</strong> {screeningData.ageCriteria}</p>
          <p><strong>Consent:</strong> {screeningData.consent}</p>
          <p><strong>Medical History:</strong> {screeningData.medicalHistory}</p>
          <p><strong>Lab Results:</strong> {screeningData.labResults}</p>

          <hr />

          <h3>Comments</h3>

          <p>{screeningData.comments}</p>

          <hr />

          <h3>Audit Information</h3>

          <p><strong>Reviewed By:</strong> {screeningData.reviewedBy}</p>
          <p><strong>Reviewed On:</strong> {screeningData.reviewedOn}</p>

        </div>

      </div>

    </AppLayout>
  );
}

export default ScreeningDetails;