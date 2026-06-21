import "../../../ERegSection.css";

import DelegationLog from "../../../Components/DelegationLog";
import TrainingLog from "../../../Components/TrainingLog";
import ERegComments from "../../../Components/ERegComments";
import ERegDocuments from "../../../ERegDocuments";

export default function SubjectPage() {

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

      {/* OVERVIEW */}
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

      {/* DELEGATION */}
      <section className="ereg-section">

        <DelegationLog />

      </section>

      {/* DUTIES */}
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

      {/* TRAINING */}
      <section className="ereg-section">

        <h2>D. Training</h2>

        <TrainingLog />

      </section>

      {/* DOCUMENTS */}
      <section className="ereg-section">

        <h2>E. Documents</h2>

        <ERegDocuments />

      </section>

      {/* COMMENTS */}
      <section className="ereg-section">

        <h2>F. Comments</h2>

        <ERegComments />

      </section>

    </div>

  );

}