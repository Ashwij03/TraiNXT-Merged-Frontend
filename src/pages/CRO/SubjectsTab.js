// SubjectsTab.js
import { useState } from "react";
import "./SubjectsTab.css";
import { Link } from "react-router-dom";
export default function SubjectsTab() {
  const [openPopup, setOpenPopup] = useState(null);

  return (
    <div className="subjects-wrapper">

      {/* LEGEND */}
      <div className="legend-row">
        <span className="lg scheduled">Scheduled</span>
        <span className="lg partial">Partial</span>
        <span className="lg fail">Screen Fail</span>
        <span className="lg completed">Completed</span>
        <span className="lg paused">Paused</span>
        <span className="lg progress">In Progress</span>
        <span className="lg cancelled">Cancelled</span>
      </div>

      {/* TIMELINE */}
      <div className="timeline-scroll">
        <table className="timeline-table">

          <colgroup>
            <col className="col-subject" />
            <col className="col-status" />
            <col className="col-prescreen" />
            <col className="col-screening" />
            <col className="col-screening" />
            <col className="col-day" />
            <col className="col-month" />
            <col className="col-month" />
            <col className="col-month" />
            <col className="col-month" />
            <col className="col-month" />
            <col className="col-month" />
          </colgroup>

          <thead>
            <tr className="group-header">
              <th rowSpan="2" className="subject-col">Subject ID</th>
              <th rowSpan="2" className="status-col">Status</th>
              <th className="pre">Pre</th>
              <th colSpan="2" className="screening">Screening</th>
              <th className="day">Day</th>
              <th colSpan="6" className="followup">Follow-up</th>
            </tr>

            <tr className="column-header">
              <th><span>Prescreen</span></th>
              <th><span>Screening 1</span></th>
              <th><span>Screening 2</span></th>
              <th><span>Day 1</span></th>
              <th><span>Month 1</span></th>
              <th><span>Month 3</span></th>
              <th><span>Month 6</span></th>
              <th><span>Month 9</span></th>
              <th><span>Month 12</span></th>
              <th><span>Month 15</span></th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td className="subject-col">B-B</td>
              <td className="status-text fail-text">Screen Fail</td>

              <td className="cell">✔</td>
              <td className="cell">✖</td>
              <td className="cell"></td>
              <td className="cell"></td>
              <td className="cell"></td>
              <td className="cell"></td>
              <td className="cell"></td>
              <td className="cell"></td>
              <td className="cell"></td>
              <td className="cell"></td>
            </tr>

            <tr>
              <td className="subject-col">A-T</td>
              <td className="status-text progress-text">In Screening</td>

              <td className="cell">✔</td>

              {/* CLICK POPUP CELL */}
              <td className="cell">
                <div
                  className="visit-cell"
                  onClick={() =>
                    setOpenPopup(openPopup === "screening1" ? null : "screening1")
                  }
                >
                  ✔

                  {openPopup === "screening1" && (
                    <div className="visit-popup">
                      <div className="popup-title">
                        Visit 1 – Screening 1
                      </div>

                      <div className="popup-date">
                        Partially completed on<br />
                        <strong>24-FEB-2022</strong>
                      </div>

					 <Link
  to="/visit/1"
  className="popup-link"
  onClick={(e) => e.stopPropagation()}
>
  View Visit Details
</Link>

                    </div>
                  )}
                </div>
              </td>

              <td className="cell">✔</td>
              <td className="cell"></td>
              <td className="cell"></td>
              <td className="cell"></td>
              <td className="cell"></td>
              <td className="cell"></td>
              <td className="cell"></td>
              <td className="cell"></td>
            </tr>
          </tbody>

        </table>
      </div>
    </div>
  );
}
