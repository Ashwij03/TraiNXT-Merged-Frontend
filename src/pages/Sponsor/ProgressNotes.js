import React, { useMemo, useState } from "react";
import "./ProgressNotes.css";
import { useNavigate } from "react-router-dom";
import { resolveSiteDisplay } from "../../utils/siteDisplay";
import { getStudies } from "../../services/studyService";


function ProgressNotes() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const siteSources = useMemo(() => getStudies(), []);
  const displaySite = (value) =>
    value
      ? resolveSiteDisplay(value, {
          sources: siteSources,
          fallback: value
        })
      : "—";

  const notesData = [
    {
      id: "NOTE-001",
      subjectId: "SUB-001",
      study: "TRIA-001",
      site: "Hyderabad",
      visit: "Visit 3",
      category: "Safety",
      createdBy: "Dr Rao",
      date: "10-Jun-2026",
      status: "Signed"
    },
    {
      id: "NOTE-002",
      subjectId: "SUB-002",
      study: "TRIA-001",
      site: "Hyderabad",
      visit: "Baseline",
      category: "Visit Assessment",
      createdBy: "Dr Rao",
      date: "12-Jun-2026",
      status: "Pending"
    },
    {
      id: "NOTE-003",
      subjectId: "SUB-003",
      study: "TRIA-002",
      site: "Bangalore",
      visit: "Month 1",
      category: "Protocol Deviation",
      createdBy: "Dr Kumar",
      date: "15-Jun-2026",
      status: "Signed"
    }
  ];

  const filteredNotes = notesData.filter((note) =>
    note.subjectId
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pn-page">

      <h1>Progress Notes</h1>

      <p className="page-subtitle">
        Monitor investigator notes across sponsor studies
      </p>

      <div className="notes-summary">

        <div className="summary-card">
          <h3>Total Notes</h3>
          <p>245</p>
        </div>

        <div className="summary-card">
          <h3>Signed Notes</h3>
          <p>210</p>
        </div>

        <div className="summary-card">
          <h3>Pending Review</h3>
          <p>25</p>
        </div>

        <div className="summary-card">
          <h3>Critical Notes</h3>
          <p>10</p>
        </div>

      </div>

      <div className="notes-filters">

        <input
          type="text"
          placeholder="Search Subject ID..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              setSearchTerm(inputValue);
            }
          }}
        />

        <button
          className="search-btn"
          onClick={() => setSearchTerm(inputValue)}
        >
          Search
        </button>

      </div>

      <div className="notes-table-card">

        <table className="notes-table">

          <thead>
            <tr>
              <th>Note ID</th>
              <th>Subject ID</th>
              <th>Study</th>
              <th>Site</th>
              <th>Visit</th>
              <th>Category</th>
              <th>Created By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredNotes.map((note) => (

              <tr key={note.id}>

                <td>{note.id}</td>
                <td>{note.subjectId}</td>
                <td>{note.study}</td>
                <td>{displaySite(note.site)}</td>
                <td>{note.visit}</td>
                <td>{note.category}</td>
                <td>{note.createdBy}</td>
                <td>{note.date}</td>

                <td>
                  <span
                    className={`status-badge ${note.status}`}
                  >
                    {note.status}
                  </span>
                </td>

                <td>
                  <button
  className="view-btn"
  onClick={() =>
    navigate(`/progress-note-details/${note.id}`)
  }
>
  View
</button>
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default ProgressNotes;