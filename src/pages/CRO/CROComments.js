import React, { useState } from "react";

import CROLayout from "./CROLayout";

import { useCROData } from "./CRODATAContext";

import CROStatusBadge from "./CROStatusBadge";

import EmptyState from "./EmptyState";

import CROModal from "./CROModal";



function CROComments() {

  const { comments, addComment, replyToComment, showAlert } = useCROData();

  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);

  const [replyModal, setReplyModal] = useState(null);

  const [newComment, setNewComment] = useState({

    subject: "",

    site: "",

    author: "",

    message: "",

    status: "Open",

    date: new Date().toISOString().split("T")[0],

  });

  const [replyText, setReplyText] = useState("");



  const filteredComments = comments.filter(

    (c) =>

      c.message.toLowerCase().includes(searchTerm.toLowerCase()) ||

      c.subject?.toLowerCase().includes(searchTerm.toLowerCase())

  );



  const handleAddComment = () => {

    if (!newComment.message.trim()) {

      showAlert("Validation", "Please enter a comment message.");

      return;

    }

    addComment(newComment);

    setNewComment({

      subject: "",

      site: "",

      author: "",

      message: "",

      status: "Open",

      date: new Date().toISOString().split("T")[0],

    });

    setShowAddModal(false);

    showAlert("Success", "Comment added successfully.");

  };



  const handleReply = () => {

    if (replyModal && replyText.trim()) {

      replyToComment(replyModal.id, {

        id: `RPL-${Date.now()}`,

        author: "CRO User",

        message: replyText,

        date: new Date().toISOString().split("T")[0],

      });

      setReplyText("");

      setReplyModal(null);

      showAlert("Success", "Reply posted successfully.");

    }

  };



  return (

    <CROLayout>

      <h1 style={{ marginBottom: "25px" }}>Comments</h1>



      <div className="cro-summary-cards">

        <div className="dashboard-card">

          <h3>Total Comments</h3>

          <h1>{comments.length}</h1>

        </div>

        <div className="dashboard-card">

          <h3>Open</h3>

          <h1>{comments.filter((c) => c.status === "Open").length}</h1>

        </div>

        <div className="dashboard-card">

          <h3>Answered</h3>

          <h1>{comments.filter((c) => c.status === "Answered").length}</h1>

        </div>

        <div className="dashboard-card">

          <h3>Closed</h3>

          <h1>{comments.filter((c) => c.status === "Closed").length}</h1>

        </div>

      </div>



      <div className="cro-panel">

        <div className="cro-panel-header">

          <input

            type="text"

            placeholder="Search Comments..."

            value={searchTerm}

            onChange={(e) => setSearchTerm(e.target.value)}

            className="cro-input"

          />

          <h2>Comments List</h2>

          <button

            type="button"

            className="cro-btn-primary"

            onClick={() => setShowAddModal(true)}

          >

            + Add Comment

          </button>

        </div>



        {filteredComments.length === 0 ? (

          <EmptyState title="No Comments Found" />

        ) : (

          <div className="cro-table-wrap">

            <table className="cro-data-table">

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Subject</th>

                  <th>Site</th>

                  <th>Author</th>

                  <th>Message</th>

                  <th>Status</th>

                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                {filteredComments.map((comment) => (

                  <tr key={comment.id}>

                    <td>{comment.id}</td>

                    <td>{comment.subject}</td>

                    <td>{comment.site}</td>

                    <td>{comment.author}</td>

                    <td>{comment.message.substring(0, 40)}...</td>

                    <td>

                      <CROStatusBadge status={comment.status} />

                    </td>

                    <td>

                      <button

                        type="button"

                        className="cro-btn-sm"

                        onClick={() =>

                          showAlert(

                            comment.id,

                            `${comment.message}\n\nReplies: ${(comment.replies || []).length}`

                          )

                        }

                      >

                        View

                      </button>

                      <button

                        type="button"

                        className="cro-btn-sm"

                        onClick={() => setReplyModal(comment)}

                        style={{ marginLeft: 8 }}

                      >

                        Reply

                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>



      <CROModal

        isOpen={showAddModal}

        onClose={() => setShowAddModal(false)}

        title="Add Comment"

        footer={

          <>

            <button type="button" className="cro-btn cro-btn-secondary" onClick={() => setShowAddModal(false)}>

              Cancel

            </button>

            <button type="button" className="cro-btn cro-btn-primary" onClick={handleAddComment}>

              Save

            </button>

          </>

        }

      >

        <input

          className="cro-input"

          placeholder="Subject ID"

          value={newComment.subject}

          onChange={(e) => setNewComment({ ...newComment, subject: e.target.value })}

        />

        <input

          className="cro-input"

          placeholder="Site"

          value={newComment.site}

          onChange={(e) => setNewComment({ ...newComment, site: e.target.value })}

        />

        <input

          className="cro-input"

          placeholder="Author"

          value={newComment.author}

          onChange={(e) => setNewComment({ ...newComment, author: e.target.value })}

        />

        <textarea

          placeholder="Message"

          value={newComment.message}

          onChange={(e) => setNewComment({ ...newComment, message: e.target.value })}

          rows={4}

          style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d1d5db" }}

        />

      </CROModal>



      <CROModal

        isOpen={Boolean(replyModal)}

        onClose={() => setReplyModal(null)}

        title={replyModal ? `Reply to ${replyModal.id}` : "Reply"}

        footer={

          <>

            <button type="button" className="cro-btn cro-btn-secondary" onClick={() => setReplyModal(null)}>

              Cancel

            </button>

            <button type="button" className="cro-btn cro-btn-primary" onClick={handleReply}>

              Send Reply

            </button>

          </>

        }

      >

        <textarea

          placeholder="Your reply..."

          value={replyText}

          onChange={(e) => setReplyText(e.target.value)}

          rows={4}

          style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #d1d5db" }}

        />

      </CROModal>

    </CROLayout>

  );

}



export default CROComments;

