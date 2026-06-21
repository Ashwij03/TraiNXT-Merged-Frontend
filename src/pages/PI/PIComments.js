import React, { useMemo, useState } from "react";
import "./PIComments.css";
import {
  getCommentsData,
  saveCommentsData,
  getSettingsData,
  collectAllStudies,
} from "./piDashboardService";

const SORT_FIELDS = {
  id: "id",
  subjectId: "subjectId",
  visit: "visit",
  type: "type",
  date: "date",
  status: "status",
};

export default function PIComments({ embedded = false }) {
  const settings = getSettingsData();
  const availableStudies = collectAllStudies().filter((s) => s !== "All Studies");
  const [comments, setComments] = useState(getCommentsData);
  const [filter, setFilter] = useState("unresolved");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSite, setSelectedSite] = useState(
    settings.profile?.siteName || settings.profile?.institute || "Apollo Hospital"
  );
  const [selectedStudy, setSelectedStudy] = useState(
    availableStudies[0] || "747-303"
  );
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [selectedVisit, setSelectedVisit] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedComment, setSelectedComment] = useState(null);
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  const persistComments = (updated) => {
    setComments(updated);
    saveCommentsData(updated);
    window.dispatchEvent(new CustomEvent("pi-comments-updated"));
  };

  const searchSuggestions = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q || q.length < 2) return [];
    const matches = new Set();
    comments.forEach((c) => {
      if (c.subjectId?.toLowerCase().includes(q)) matches.add(c.subjectId);
      if (c.visit?.toLowerCase().includes(q)) matches.add(c.visit);
      if (c.comment?.toLowerCase().includes(q)) {
        matches.add(c.comment.slice(0, 48) + (c.comment.length > 48 ? "…" : ""));
      }
    });
    return Array.from(matches).slice(0, 5);
  }, [comments, searchQuery]);

  const filteredComments = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let result = comments.filter((c) => {
      const statusMatch = filter === "all" || c.status === filter;
      const subjectMatch =
        selectedSubject === "All" || c.subjectId === selectedSubject;
      const visitMatch = selectedVisit === "All" || c.visit === selectedVisit;
      const typeMatch = selectedType === "All" || c.type === selectedType;
      const searchMatch =
        !q ||
        c.subjectId?.toLowerCase().includes(q) ||
        c.visit?.toLowerCase().includes(q) ||
        c.comment?.toLowerCase().includes(q) ||
        c.type?.toLowerCase().includes(q) ||
        c.createdBy?.toLowerCase().includes(q);

      return (
        statusMatch && subjectMatch && visitMatch && typeMatch && searchMatch
      );
    });

    result = [...result].sort((a, b) => {
      const field = SORT_FIELDS[sortField] || sortField;
      const av = (a[field] || "").toString().toLowerCase();
      const bv = (b[field] || "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [
    comments,
    filter,
    searchQuery,
    selectedSubject,
    selectedVisit,
    selectedType,
    sortField,
    sortDir,
  ]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const toggleStatus = (id) => {
    persistComments(
      comments.map((c) =>
        c.id === id
          ? {
              ...c,
              status: c.status === "resolved" ? "unresolved" : "resolved",
            }
          : c
      )
    );
  };

  const addComment = () => {
    const text = prompt("Enter comment");
    if (!text) return;

    const newComment = {
      id: `COM-${Date.now()}`,
      subjectId: "SUB-NEW",
      visit: "Visit 1",
      type: "General",
      comment: text,
      createdBy: settings.profile?.name || "Dr. PI",
      date: new Date().toLocaleDateString(),
      status: "unresolved",
      study: selectedStudy,
      site: selectedSite,
    };

    persistComments([newComment, ...comments]);
  };

  const totalComments = comments.length;
  const openComments = comments.filter((c) => c.status === "unresolved").length;
  const resolvedComments = comments.filter((c) => c.status === "resolved").length;
  const pendingReviewComments = comments.filter(
    (c) => c.status === "pending-review"
  ).length;

  const sortIndicator = (field) =>
    sortField === field ? (sortDir === "asc" ? " ↑" : " ↓") : "";

  return (
    <div className={`pi-page-content comments-content${embedded ? " embedded" : ""}`}>
      <div className="comments-header">
        <div>
          <h2>Comments</h2>
          <p className="comments-subtitle">
            View and manage all comments for subjects and visits.
          </p>
        </div>
        <div className="header-actions">
          <button type="button">Copy</button>
          <button type="button">Excel</button>
          <button type="button">CSV</button>
          <button type="button">PDF</button>
        </div>
      </div>

      <div className="top-filters">
        <div className="assigned-info">
          <label>Assigned Site</label>
          <select
            value={selectedSite}
            onChange={(e) => setSelectedSite(e.target.value)}
          >
            <option value={settings.profile?.siteName || settings.profile?.institute}>
              {settings.profile?.siteName || settings.profile?.institute}
            </option>
            {(settings.profile?.siteName
              ? [settings.profile.siteName]
              : [settings.profile?.institute]
            )
              .filter(Boolean)
              .map((site) => (
                <option key={site} value={site}>
                  {site}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label>Study</label>
          <select
            value={selectedStudy}
            onChange={(e) => setSelectedStudy(e.target.value)}
          >
            {availableStudies.map((study) => (
              <option key={study} value={study}>
                {study}
              </option>
            ))}
          </select>
        </div>
        <div className="global-search pi-comments-search-wrap">
          <input
            type="text"
            placeholder="Search by Subject ID, Visit, Type, or Comment..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search comments"
          />
          {searchSuggestions.length > 0 && (
            <ul className="pi-search-suggestions">
              {searchSuggestions.map((suggestion) => (
                <li key={suggestion}>
                  <button
                    type="button"
                    onClick={() => setSearchQuery(suggestion.replace("…", ""))}
                  >
                    {suggestion}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="pi-kpi-cards-grid comments-kpi-grid">
        <div className="pi-enterprise-kpi blue">
          <span className="pi-enterprise-kpi-label">Total Comments</span>
          <span className="pi-enterprise-kpi-value">{totalComments}</span>
        </div>
        <div className="pi-enterprise-kpi orange">
          <span className="pi-enterprise-kpi-label">Open Comments</span>
          <span className="pi-enterprise-kpi-value">{openComments}</span>
        </div>
        <div className="pi-enterprise-kpi green">
          <span className="pi-enterprise-kpi-label">Resolved Comments</span>
          <span className="pi-enterprise-kpi-value">{resolvedComments}</span>
        </div>
        <div className="pi-enterprise-kpi purple">
          <span className="pi-enterprise-kpi-label">Pending Review</span>
          <span className="pi-enterprise-kpi-value">{pendingReviewComments}</span>
        </div>
      </div>

      <button type="button" className="add-comment-btn" onClick={addComment}>
        ➕ Add Comment
      </button>

      <div className="comments-filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="unresolved">Open</option>
          <option value="resolved">Resolved</option>
          <option value="pending-review">Pending Review</option>
        </select>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="All">All Subjects</option>
          {[...new Set(comments.map((c) => c.subjectId))].map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </select>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
        >
          <option value="All">All Types</option>
          {[...new Set(comments.map((c) => c.type))].map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <select
          value={selectedVisit}
          onChange={(e) => setSelectedVisit(e.target.value)}
        >
          <option value="All">All Visits</option>
          {[...new Set(comments.map((c) => c.visit))].map((visit) => (
            <option key={visit} value={visit}>
              {visit}
            </option>
          ))}
        </select>
      </div>

      <div className="table-container">
        <table className="pi-table comments-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("id")} className="pi-sortable-th">
                Comment ID{sortIndicator("id")}
              </th>
              <th onClick={() => handleSort("subjectId")} className="pi-sortable-th">
                Subject ID{sortIndicator("subjectId")}
              </th>
              <th onClick={() => handleSort("visit")} className="pi-sortable-th">
                Visit{sortIndicator("visit")}
              </th>
              <th onClick={() => handleSort("type")} className="pi-sortable-th">
                Type{sortIndicator("type")}
              </th>
              <th>Comment</th>
              <th>Created By</th>
              <th onClick={() => handleSort("date")} className="pi-sortable-th">
                Date{sortIndicator("date")}
              </th>
              <th onClick={() => handleSort("status")} className="pi-sortable-th">
                Status{sortIndicator("status")}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: "center" }}>
                  No Comments Found
                </td>
              </tr>
            ) : (
              filteredComments.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.subjectId || c.subject}</td>
                  <td>{c.visit}</td>
                  <td>{c.type || "-"}</td>
                  <td>{c.comment}</td>
                  <td>{c.createdBy || "-"}</td>
                  <td>{c.date}</td>
                  <td>
                    <button
                      type="button"
                      onClick={() => toggleStatus(c.id)}
                      className={`status-badge status-${
                        c.status === "resolved"
                          ? "resolved"
                          : c.status === "pending-review"
                          ? "pending"
                          : "open"
                      }`}
                    >
                      {c.status === "resolved"
                        ? "Resolved"
                        : c.status === "unresolved"
                        ? "Open"
                        : "Pending Review"}
                    </button>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="view-btn"
                      onClick={() => setSelectedComment(c)}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="resolve-btn"
                      onClick={() => toggleStatus(c.id)}
                    >
                      {c.status === "resolved" ? "Reopen" : "Resolve"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedComment && (
        <div className="modal-overlay">
          <div className="comment-modal">
            <h2>Comment Details</h2>
            <p>
              <strong>Comment ID:</strong> {selectedComment.id}
            </p>
            <p>
              <strong>Subject ID:</strong> {selectedComment.subjectId}
            </p>
            <p>
              <strong>Visit:</strong> {selectedComment.visit}
            </p>
            <p>
              <strong>Type:</strong> {selectedComment.type}
            </p>
            <p>
              <strong>Comment:</strong> {selectedComment.comment}
            </p>
            <p>
              <strong>Created By:</strong> {selectedComment.createdBy}
            </p>
            <p>
              <strong>Date:</strong> {selectedComment.date}
            </p>
            <button
              type="button"
              className="close-btn"
              onClick={() => setSelectedComment(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
