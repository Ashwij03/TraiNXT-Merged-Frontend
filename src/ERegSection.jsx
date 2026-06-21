import "./ERegSection.css";
import { useState } from "react";

import DelegationLog from "./Components/DelegationLog";
import TrainingLog from "./Components/TrainingLog";
import ERegComments from "./Components/ERegComments";
import ERegDocuments from "./ERegDocuments";

export default function ERegSection() {

  const [activeTab, setActiveTab] = useState("overview");

  return (

    <div className="ereg-container">

      {/* HEADER */}
      <div className="ereg-header">

        <div className="ereg-left">

          <h2>T-S 123-0001</h2>

          <p>Study Documents</p>

        </div>

        <div className="ereg-right">

          <p>
            <b>Organization:</b> Training
          </p>

          <p>US/Eastern</p>

        </div>

      </div>

      {/* TABS */}
      <div className="ereg-tabs">

        <span
          className={activeTab === "overview" ? "active" : ""}
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </span>

        <span
          className={activeTab === "delegates" ? "active" : ""}
          onClick={() => setActiveTab("delegates")}
        >
          Delegates
        </span>

        <span
          className={activeTab === "duties" ? "active" : ""}
          onClick={() => setActiveTab("duties")}
        >
          Duties
        </span>

        <span
          className={activeTab === "training" ? "active" : ""}
          onClick={() => setActiveTab("training")}
        >
          Training
        </span>

        <span
          className={activeTab === "documents" ? "active" : ""}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </span>

        <span
          className={activeTab === "comments" ? "active" : ""}
          onClick={() => setActiveTab("comments")}
        >
          Comments
        </span>

      </div>

      {/* TOP BAR */}
      <div className="ereg-topbar">

        <div className="comments-bar">

          <span>Comments:</span>

          <button className="plus-btn">
            +
          </button>

        </div>

        <div className="pi-info">

          <span>PI:</span>

          <div className="pi-avatar"></div>

          <span>Maxine Lai</span>

        </div>

      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (

        <section className="ereg-section">

          <h2>A. Overview</h2>

          <table className="overview-table">

            <thead>

              <tr>

                <th>Subject ID</th>

                <th>Sex</th>

                <th>DOB</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td>123-0001</td>

                <td>Female</td>

                <td>04-Mar-1958</td>

                <td>In Screening</td>

              </tr>

            </tbody>

          </table>

        </section>

      )}

      {/* DELEGATION */}
      {activeTab === "delegates" && (

        <section className="ereg-section">

          <DelegationLog />

        </section>

      )}

      {/* DUTIES */}
      {activeTab === "duties" && (

        <section className="ereg-section">

          <h2>C. Duties</h2>

          <table className="overview-table">

            <thead>

              <tr>

                <th>Duty</th>

                <th>Description</th>

                <th>Required Training</th>

              </tr>

            </thead>

            <tbody>

              <tr>

                <td>A2</td>

                <td>Physical Exam</td>

                <td>Physical Exam Training</td>

              </tr>

              <tr>

                <td>A1</td>

                <td>eReg Access</td>

                <td>GCP</td>

              </tr>

            </tbody>

          </table>

        </section>

      )}

      {/* TRAINING */}
      {activeTab === "training" && (

        <section className="ereg-section">

          <h2>D. Training</h2>

          <TrainingLog />

        </section>

      )}

      {/* DOCUMENTS */}
      {activeTab === "documents" && (

        <section className="ereg-section">

          <h2>E. Documents</h2>

          <ERegDocuments />

        </section>

      )}

      {/* COMMENTS */}
      {activeTab === "comments" && (

        <section className="ereg-section">

          <h2>F. Comments</h2>

          <ERegComments />

        </section>

      )}

    </div>

  );

}