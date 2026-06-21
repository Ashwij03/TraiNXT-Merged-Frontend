import React, { useState } from "react";
import AppLayout from "./AppLayout";
import "./Screening.css";
import { useNavigate } from "react-router-dom";

function Screening() {
	const navigate = useNavigate();
	const [inputValue, setInputValue] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedScreening, setSelectedScreening] = useState(null);
	const [selectedSite, setSelectedSite] = useState("All Sites");
	const [selectedStatus, setSelectedStatus] = useState("All Status");

	const screenings = [
	  {
	    id: "SCR-001",
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
	  },

	  {
	    id: "SCR-003",
	    subjectId: "SUB-003",
	    study: "Cardio Study",
	    site: "Chennai",
	    pi: "Dr Sharma",
	    status: "Failed",
	    screeningDate: "14-May-2026",
	    eligibility: "Not Eligible",

	    ageCriteria: "Failed",
	    consent: "Passed",
	    medicalHistory: "Passed",
	    labResults: "Passed",

	    failureReason: "Age Criteria Failed",

	    comments: "Subject age outside protocol range.",

	    reviewedBy: "Dr Sharma",
	    reviewedOn: "15-May-2026"
	  },
	  {
	    id: "SCR-002",
	    subjectId: "SUB-002",
	    study: "Oncology Trial",
	    site: "Bangalore",
	    pi: "Dr Kumar",
	    status: "Pending",
	    screeningDate: "12-May-2026",
	    eligibility: "Under Review",
	    ageCriteria: "Passed",
	    consent: "Passed",
	    medicalHistory: "Pending",
	    labResults: "Pending",
	    comments: "Awaiting lab results.",
	    reviewedBy: "Dr Kumar",
	    reviewedOn: "13-May-2026"
	  },

	  {
	    id: "SCR-004",
	    subjectId: "SUB-004",
	    study: "Asthma Study",
	    site: "Mumbai",
	    pi: "Dr Patel",
	    status: "Completed",
	    screeningDate: "18-May-2026",
	    eligibility: "Eligible",
	    ageCriteria: "Passed",
	    consent: "Passed",
	    medicalHistory: "Passed",
	    labResults: "Passed",
	    comments: "Eligible for enrollment.",
	    reviewedBy: "Dr Patel",
	    reviewedOn: "19-May-2026"
	  },

	  {
	    id: "SCR-005",
	    subjectId: "SUB-005",
	    study: "Hypertension Study",
	    site: "Delhi",
	    pi: "Dr Mehta",
	    status: "Completed",
	    screeningDate: "20-May-2026",
	    eligibility: "Eligible",
	    ageCriteria: "Passed",
	    consent: "Passed",
	    medicalHistory: "Passed",
	    labResults: "Passed",
	    comments: "All criteria satisfied.",
	    reviewedBy: "Dr Mehta",
	    reviewedOn: "21-May-2026"
	  },

	  {
	    id: "SCR-006",
	    subjectId: "SUB-006",
	    study: "Kidney Disease Study",
	    site: "Pune",
	    pi: "Dr Singh",
	    status: "Failed",
	    screeningDate: "22-May-2026",
	    eligibility: "Not Eligible",
	    ageCriteria: "Passed",
	    consent: "Passed",
	    medicalHistory: "Failed",
	    labResults: "Passed",
	    failureReason: "Medical History Exclusion",
	    comments: "Excluded due to prior condition.",
	    reviewedBy: "Dr Singh",
	    reviewedOn: "23-May-2026"
	  },

	  {
	    id: "SCR-007",
	    subjectId: "SUB-007",
	    study: "Neurology Study",
	    site: "Kolkata",
	    pi: "Dr Roy",
	    status: "Pending",
	    screeningDate: "25-May-2026",
	    eligibility: "Under Review",
	    ageCriteria: "Passed",
	    consent: "Passed",
	    medicalHistory: "Passed",
	    labResults: "Pending",
	    comments: "Awaiting MRI report.",
	    reviewedBy: "Dr Roy",
	    reviewedOn: "26-May-2026"
	  },

	  {
	    id: "SCR-008",
	    subjectId: "SUB-008",
	    study: "COVID Vaccine Trial",
	    site: "Hyderabad",
	    pi: "Dr Rao",
	    status: "Completed",
	    screeningDate: "27-May-2026",
	    eligibility: "Eligible",
	    ageCriteria: "Passed",
	    consent: "Passed",
	    medicalHistory: "Passed",
	    labResults: "Passed",
	    comments: "Eligible for randomization.",
	    reviewedBy: "Dr Rao",
	    reviewedOn: "28-May-2026"
	  },

	  {
	    id: "SCR-009",
	    subjectId: "SUB-009",
	    study: "Dermatology Study",
	    site: "Chennai",
	    pi: "Dr Sharma",
	    status: "Failed",
	    screeningDate: "29-May-2026",
	    eligibility: "Not Eligible",
	    ageCriteria: "Failed",
	    consent: "Passed",
	    medicalHistory: "Passed",
	    labResults: "Passed",
	    failureReason: "Age Criteria Failed",
	    comments: "Outside protocol age range.",
	    reviewedBy: "Dr Sharma",
	    reviewedOn: "30-May-2026"
	  },

	  {
	    id: "SCR-010",
	    subjectId: "SUB-010",
	    study: "Arthritis Study",
	    site: "Ahmedabad",
	    pi: "Dr Desai",
	    status: "Completed",
	    screeningDate: "01-Jun-2026",
	    eligibility: "Eligible",
	    ageCriteria: "Passed",
	    consent: "Passed",
	    medicalHistory: "Passed",
	    labResults: "Passed",
	    comments: "Screening completed successfully.",
	    reviewedBy: "Dr Desai",
	    reviewedOn: "02-Jun-2026"
	  }
	];
	const filteredScreenings = screenings.filter((screening) => {

	  const matchesSearch =
	    screening.id.toLowerCase().includes(
	      searchTerm.toLowerCase()
	    );

	  const matchesSite =
	    selectedSite === "All Sites" ||
	    screening.site === selectedSite;

	  const matchesStatus =
	    selectedStatus === "All Status" ||
	    screening.status === selectedStatus;

	  return (
	    matchesSearch &&
	    matchesSite &&
	    matchesStatus
	  );
	});
  return (
    <AppLayout>

      <div className="screening-page">

        <div className="page-header">
		
          <h1>Screening Management</h1>
        </div>
		<div className="search-container">
		<input
		  type="text"
		  placeholder="Search Screening ID..."
		  className="search-input"
		  value={inputValue}
		  onChange={(e) => setInputValue(e.target.value)}
		  onKeyDown={(e) => {
		    if (e.key === "Enter") {
		      setSearchTerm(inputValue);
		    }
		  }}
		/>
		</div>
		<select
		  value={selectedSite}
		  onChange={(e) => setSelectedSite(e.target.value)}
		>
		  <option>All Sites</option>
		  <option>Hyderabad</option>
		  <option>Bangalore</option>
		  <option>Chennai</option>
		  <option>Mumbai</option>
		  <option>Delhi</option>
		  <option>Pune</option>
		  <option>Kolkata</option>
		</select>

		<select
		  value={selectedStatus}
		  onChange={(e) => setSelectedStatus(e.target.value)}
		>
		  <option>All Status</option>
		  <option>Completed</option>
		  <option>Pending</option>
		  <option>Failed</option>
		</select>
		

        <div className="screening-card">
		<p>
		  Total Records: {filteredScreenings.length}
		</p>

          <table className="screening-table">

		  <thead>
		    <tr>
		      <th>Screening ID</th>
		      <th>Study</th>
		      <th>Site</th>
		      <th>PI</th>
		      <th>Status</th>
		      <th>Screening Date</th>
		      <th>Eligibility</th>
		      <th>Action</th>
		    </tr>
		  </thead>

            <tbody>

             {filteredScreenings.map((screening) => (

                <tr key={screening.id}>
				<td>{screening.id}</td>
				<td>{screening.study}</td>
				<td>{screening.site}</td>
				<td>{screening.pi}</td>
				<td>{screening.status}</td>
				<td>{screening.screeningDate}</td>
				<td>{screening.eligibility}</td>

				<td>
				<button
  className="view-btn"
  onClick={() => {
    localStorage.setItem(
      "selectedStudy",
      JSON.stringify(screening)
    );

    navigate(`/study/${screening.id}`);
  }}
>
  View
</button>
				</td>
                </tr>

              ))}

            </tbody>

          </table>

        </div>
		{selectedScreening && (
		  <div className="modal-overlay">

		    <div className="modal-content">

			<div className="details-card">

			  

			</div>

			<p>
			  Age Criteria: {selectedScreening.ageCriteria}
			</p>

			<p>
			  Consent Signed: {selectedScreening.consent}
			</p>

			<p>
			  Medical History: {selectedScreening.medicalHistory}
			</p>

			<p>
			  Lab Results: {selectedScreening.labResults}
			</p>
			{selectedScreening.failureReason && (
			  <>
			    <hr />

			    <h3>Failure Reason</h3>

			    <p>{selectedScreening.failureReason}</p>
			  </>
			)}
			<hr />

			<h3>Comments</h3>

			<p>{selectedScreening.comments}</p>

			<hr />

			<h3>Audit Information</h3>

			<p>
			  <strong>Reviewed By:</strong> {selectedScreening.reviewedBy}
			</p>

			<p>
			  <strong>Reviewed On:</strong> {selectedScreening.reviewedOn}
			</p>
		      <button
		        onClick={() => setSelectedScreening(null)}
		      >
		        Close
		      </button>

		    </div>

		  </div>
		)}

      </div>

    </AppLayout>
  );
}

export default Screening;