import React, { useState } from "react";
import "./ERegComments.css";

const ERegComments = () => {

  const [showModal, setShowModal] = useState(false);
  const [comment, setComment] = useState("");

  return (
    <div className="comments-container">

      <h2>D. eReg Comments</h2>

      <p>
        Add eReg specific comments by clicking the plus icon.
      </p>

      {/* Comment Header */}
      <div className="comment-header">

        <h3>Comments:</h3>

        <button
          className="plus-btn"
          onClick={() => setShowModal(true)}
        >
          +
        </button>

      </div>

      {/* Comments List */}
      <div className="comments-box">

        <div className="comment-card">
          <h4>@MeganRichards</h4>

          <p>
            Please upload missing GCP document.
          </p>
        </div>

        <div className="comment-card">
          <h4>@HannahKulkarni</h4>

          <p>
            Training document verified successfully.
          </p>
        </div>

      </div>

      {/* Modal */}
      {showModal && (

        <div className="modal-overlay">

          <div className="modal-box">

            <h3>Add Comment</h3>

            <textarea
              placeholder="Type @username comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <div className="modal-buttons">

              <button
                className="save-btn"
                onClick={() => setShowModal(false)}
              >
                Save
              </button>

              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
};

export default ERegComments;