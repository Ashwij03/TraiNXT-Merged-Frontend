import "../styles/ProgressNotes.css";
import "./ProgressNotes.js";
import React, { useEffect, useMemo, useState } from "react";
import { getStudies } from "../../shared/services/studyService";
import { resolveSiteDisplay } from "../../shared/utils/siteDisplay";
import { useNavigate } from "react-router-dom";

/**
 * Read progress notes from the real localStorage store.
 * Notes are stored under 'progressNotesByStudy', keyed by studyId.
 */
function readProgressNotes() {
  try {
    const allByStudy = JSON.parse(localStorage.getItem("progressNotesByStudy")) || {};
    return Object.entries(allByStudy).flatMap(([studyCode, notes]) =>
      Array.isArray(notes)
        ? notes.map((note) => ({ ...note, study: note.study || studyCode }))
        : []
    );
  } catch {
    return [];
  }
}

function ProgressNotes() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [notesData, setNotesData] = useState(readProgressNotes);

  useEffect(() => {
    const refresh = () => setNotesData(readProgressNotes());
    window.addEventListener("progress-notes-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("progress-notes-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

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
    <div className="pn-page tnxt-compact">

      <h1>Progress Notes</h1>

      <p className="page-subtitle">
        Monitor investigator notes across sponsor studies
      </p>

      <div className="notes-summary">

        <div className="summary-card">
          <h3>Total Notes</h3>
          <p>{notesData.length}</p>
        </div>

        <div className="summary-card">
          <h3>Signed Notes</h3>
          <p>{notesData.filter((n) => n.status === "Signed").length}</p>
        </div>

        <div className="summary-card">
          <h3>Pending Review</h3>
          <p>{notesData.filter((n) => n.status === "Pending").length}</p>
        </div>

        <div className="summary-card">
          <h3>Critical Notes</h3>
          <p>{notesData.filter((n) => n.category === "Safety" || n.category === "Protocol Deviation").length}</p>
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

          Search
        </button>

      </div>

      <div className="notes-table-card">

        <table className="notes-table ctms-standard-table">

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

                    {note.status}
                  </span>
                </td>

                <td>
                  <button
  className="view-btn"
  onClick={() =>
    navigate(`/progress-note-details/${note.id}`)
  }

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