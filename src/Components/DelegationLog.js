import React, { useState } from "react";
import "./DelegationLog.css";

const DelegationLog = () => {

  const [showModal, setShowModal] = useState(false);

  const [tab, setTab] = useState("active");

  return (

    <div className="delegation-container">

      <h2 className="delegation-title">
        B. Electronic Delegation Log
      </h2>

      {/* CARD */}

      <div className="delegate-card">

        <div className="delegate-user">

          <div className="delegate-image">

            <img
              src="https://randomuser.me/api/portraits/women/44.jpg"
              alt=""
            />

          </div>

          <div className="delegate-info">

            <h3>Megan Richards</h3>

            <p>Investigator</p>

          </div>

        </div>

        <div className="delegate-actions">

          {/* DUTY */}

          <div className="duty-box">

            A2

            <div className="tooltip-box">

              <p>
                <strong>Description:</strong> Physical Exam
              </p>

              <p>
                <strong>Training:</strong> Physical Exam
              </p>

            </div>

          </div>

          {/* SEARCH */}

          <div
            className="search-icon"
            onClick={() => setShowModal(true)}
          >
            🔍
          </div>

        </div>

      </div>

      {/* MODAL */}

      {showModal && (

        <div className="modal-overlay">

          <div className="modal-box">

            {/* HEADER */}

            <div className="modal-header">

              <div className="modal-user">

                <img
                  src="https://randomuser.me/api/portraits/women/44.jpg"
                  alt=""
                />

                <div>

                  <h3>Megan Richards</h3>

                  <p>Investigator</p>

                </div>

              </div>

              <span
                className="close-btn"
                onClick={() => setShowModal(false)}
              >
                ✖
              </span>

            </div>

            {/* TABS */}

            <div className="modal-tabs">

              <button
                className={tab === "active" ? "tab active" : "tab"}
                onClick={() => setTab("active")}
              >
                Active
              </button>

              <button
                className={tab === "inactive" ? "tab active" : "tab"}
                onClick={() => setTab("inactive")}
              >
                Inactive
              </button>

            </div>

            {/* TABLE */}

            <table className="delegation-table">

              <thead>

                <tr>

                  <th>Duty</th>

                  <th>Description</th>

                  <th>Effective Period</th>

                  <th>PI Signature</th>

                  <th>User Signature</th>

                </tr>

              </thead>

              <tbody>

                {/* ACTIVE */}

                {tab === "active" && (
                  <>
                    <tr>
                      <td>A2</td>
                      <td>Physical Exam</td>
                      <td>1/27/2020 - Present</td>
                      <td>1/27/2020</td>
                      <td>1/27/2020</td>
                    </tr>

                    <tr>
                      <td>A3</td>
                      <td>Medical Review</td>
                      <td>2/10/2020 - Present</td>
                      <td>2/10/2020</td>
                      <td>2/10/2020</td>
                    </tr>
                  </>
                )}

                {/* INACTIVE */}

                {tab === "inactive" && (
                  <>
                    <tr>
                      <td>2</td>
                      <td>eReg Access</td>
                      <td>1/27/2020 - 4/13/2020</td>
                      <td>1/27/2020</td>
                      <td>1/27/2020</td>
                    </tr>

                    <tr>
                      <td>5</td>
                      <td>Data Verification</td>
                      <td>3/01/2020 - 6/20/2020</td>
                      <td>3/01/2020</td>
                      <td>3/01/2020</td>
                    </tr>
                  </>
                )}

              </tbody>

            </table>

          </div>

        </div>

      )}

    </div>

  );

};

export default DelegationLog;