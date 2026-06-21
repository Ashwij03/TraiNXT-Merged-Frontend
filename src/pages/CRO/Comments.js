import React, { useState, useEffect } from "react";
import CROSidebar from "./Components/CROSidebar";
import CRONavbar from "./Components/CRONavbar";
import CommentModal from "./CommentModal";

const initialComments = [
  {
    id: "E1",
    subject: "J-D 77777",
    visit: "Visit 1 - Screening",
    date: "11/12/2019",
    comment: "Kristen Bosse please review...",
    status: "resolved",
  },
  {
    id: "E2",
    subject: "",
    visit: "",
    date: "27/03/2026",
    comment: "Alice TestOne please review...",
    status: "unresolved",
  },
];

export default function CommentsPage() {
	const [comments, setComments] = useState(() => {
	  const savedComments =
	    localStorage.getItem("comments");

	  return savedComments
	    ? JSON.parse(savedComments)
	    : initialComments;
	});
  const [filter, setFilter] = useState("unresolved");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false); // ⭐ NEW
  useEffect(() => {
    localStorage.setItem(
      "comments",
      JSON.stringify(comments)
    );
  }, [comments]);

  // 🔥 Filtering logic
  const filteredComments = comments.filter(
    (c) =>
      (filter === "all"
        ? true
        : c.status === filter) &&
      (
		String(c.id).toLowerCase()
          .includes(search.toLowerCase()) ||
        c.subject
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        c.comment
          .toLowerCase()
          .includes(search.toLowerCase())
      )
  );
  // 🔁 Toggle resolve/unresolve
  const toggleStatus = (id) => {
    setComments((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === "resolved" ? "unresolved" : "resolved",
            }
          : c
      )
    );
  };
  // ⭐ ADD NEW COMMENT
  const addComment = (newComment) => {
    setComments((prev) => [
      newComment,
      ...prev
    ]);
  };

  const handleDelete = (id) => {
    setComments((prev) =>
      prev.filter((c) => c.id !== id)
    );
  };
  return (
    <div className="dashboard-layout">

      <CROSidebar />

      <div className="main-content">

        <CRONavbar />

        <div style={{ padding: "30px" }}>
      <h2>Comments</h2>
	  <input
	    type="text"
	    placeholder="Search Comments..."
	    value={search}
	    onChange={(e) =>
	      setSearch(e.target.value)
	    }
	    style={{
	      width: "350px",
	      padding: "12px",
	      marginBottom: "20px",
	      border: "1px solid #ddd",
	      borderRadius: "8px"
	    }}
	  />

      {/* ⭐ ADD BUTTON */}
	  <button
	    onClick={() => {
	      alert("Button Working");
	      setShowModal(true);
	    }}
	  >
	    ➕ Add Comment
	  </button>

      {/* 🔥 Tabs */}
      <div style={{ marginBottom: "20px", marginTop: "10px" }}>
        <button onClick={() => setFilter("unresolved")}>
          Unresolved Comments
        </button>
        <button onClick={() => setFilter("resolved")}>
          Resolved Comments
        </button>
        <button onClick={() => setFilter("all")}>All</button>
      </div>

      {/* 🔥 Table */}
      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>ID</th>
            <th>Subject</th>
            <th>Visit / Procedure</th>
            <th>Date</th>
            <th>Comment</th>
            <th>Status</th>
			<th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredComments.length === 0 ? (
            <tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                No Comments Found
              </td>
            </tr>
          ) : (
            filteredComments.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.subject}</td>
				<td>
				  Visit {c.visitNumber} - Week {c.week}
				  <br />
				  <small>{c.visitName}</small>
				</td>
                <td>{c.date}</td>
                <td>{c.comment}</td>

                {/* ✅ Status Toggle */}
				<td>
				  <button
				    onClick={() => toggleStatus(c.id)}
				    style={{
				      background: c.status === "resolved" ? "#d4edda" : "#fff3cd",
				      border: "1px solid #ccc",
				      padding: "5px 10px",
				      borderRadius: "5px",
				    }}
				  >
				    {c.status === "resolved" ? "✅ Resolved" : "❗ Unresolved"}
				  </button>
				</td>
				<td>

				  <button
				    onClick={() =>
				      alert(
				        `Comment ID: ${c.id}
				Subject: ${c.subject}
				Comment: ${c.comment}
				Status: ${c.status}`
				      )
				    }
				  >
				    View
				  </button>

				  <button
				    onClick={() =>
				      handleDelete(c.id)
				    }
				    style={{
				      marginLeft: "8px",
				      background: "red",
				      color: "white"
				    }}
				  >
				    Delete
				  </button>

				</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* ⭐ POPUP MODAL */}

    </div>
	    </div>
		
		{showModal && (
		  <CommentModal
		    onClose={() => setShowModal(false)}
		    onSubmit={addComment}
		  />
		)}
		
	  </div>

  );
}