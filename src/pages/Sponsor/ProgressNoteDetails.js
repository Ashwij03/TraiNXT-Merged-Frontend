import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import "./ProgressNoteDetails.css";

function ProgressNoteDetails() {

  const { id } = useParams();
  const navigate = useNavigate();

  const notesData = {
    "NOTE-001": {
      study: "TRIA-001",
      subjectId: "SUB-001",
      site: "Hyderabad",
      visit: "Visit 3",
      category: "Safety",
      createdBy: "Dr Rao",
      date: "10-Jun-2026",
      status: "Signed",
      note:
        "Subject completed Visit 3 successfully. No adverse events reported. Vitals within normal range."
    },

    "NOTE-002": {
      study: "TRIA-001",
      subjectId: "SUB-002",
      site: "Hyderabad",
      visit: "Baseline",
      category: "Visit Assessment",
      createdBy: "Dr Rao",
      date: "12-Jun-2026",
      status: "Pending",
      note:
        "Baseline assessment completed. Awaiting investigator review."
    },

    "NOTE-003": {
      study: "TRIA-002",
      subjectId: "SUB-003",
      site: "Bangalore",
      visit: "Month 1",
      category: "Protocol Deviation",
      createdBy: "Dr Kumar",
      date: "15-Jun-2026",
      status: "Signed",
      note:
        "Visit completed with protocol deviation. Deviation documented and reviewed."
    }
  };

  const note = notesData[id];

  if (!note) {
    return (
      <AppLayout>
        <h2>Progress Note Not Found</h2>
      </AppLayout>
    );
  }

  return (
    <AppLayout>

      <button
  className="back-btn"
  onClick={() => navigate("/progress-notes")}
>
   Back to Progress Notes
</button>


      <div className="details-card">

        <p><strong>Note ID:</strong> {id}</p>
        <p><strong>Study:</strong> {note.study}</p>
        <p><strong>Subject ID:</strong> {note.subjectId}</p>
        <p><strong>Site:</strong> {note.site}</p>
        <p><strong>Visit:</strong> {note.visit}</p>
        <p><strong>Category:</strong> {note.category}</p>
        <p><strong>Created By:</strong> {note.createdBy}</p>
        <p><strong>Date:</strong> {note.date}</p>
        <p><strong>Status:</strong> {note.status}</p>

        <hr />

        <h3>Progress Note</h3>

        <p>{note.note}</p>

      </div>

    </AppLayout>
  );
}

export default ProgressNoteDetails;