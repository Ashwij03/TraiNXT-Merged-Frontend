import React, { useMemo, useState } from "react";
import AppLayout from "./AppLayout";
import "./Visits.css";
import { useNavigate } from "react-router-dom";
import { resolveSiteDisplay } from "../../utils/siteDisplay";
import { getStudies } from "../../services/studyService";
import useVisitSchedules from "../../hooks/useVisitSchedules";
import {
  isCompletedVisitSchedule,
  isPastCalendarDate
} from "../../services/visitScheduleService";
import { formatScheduleDisplayDate } from "../../utils/formatScheduleDisplayDate";

function Visits() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const { schedules, upcomingWindow } = useVisitSchedules({ daysAhead: 365 });
  const siteSources = useMemo(() => getStudies(), []);

  const displaySite = (value) =>
    value
      ? resolveSiteDisplay(value, {
          sources: siteSources,
          fallback: value
        })
      : "—";

  const visits = useMemo(
    () =>
      schedules.map((schedule) => ({
        visitId: schedule.id,
        studyId: schedule.study || schedule.studyKey || "—",
        subject: schedule.subjectId || "—",
        site: schedule.site || "—",
        visit: schedule.visit || "—",
        scheduledDate: schedule.date,
        actualDate: isCompletedVisitSchedule(schedule) ? schedule.date : "",
        status: schedule.status || "Scheduled",
        deviation: schedule.deviation || "—"
      })),
    [schedules]
  );

  const completedCount = schedules.filter(isCompletedVisitSchedule).length;
  const missedCount = schedules.filter(
    (schedule) =>
      !isCompletedVisitSchedule(schedule) &&
      (String(schedule.status || "").toLowerCase() === "missed" ||
        isPastCalendarDate(schedule.date))
  ).length;
  const deviationCount = schedules.filter((schedule) =>
    Boolean(schedule.deviation)
  ).length;

  const filteredVisits = visits.filter((item) =>
    String(item.visitId || "")
      .toLowerCase()
      .includes(inputValue.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="visits-page">
        <h1>Visit Tracking</h1>

        <div className="visit-summary">
          <div className="summary-card">
            <h3>Completed Visits</h3>
            <p>{completedCount}</p>
          </div>

          <div className="summary-card">
            <h3>Upcoming Visits</h3>
            <p>{upcomingWindow.length}</p>
          </div>

          <div className="summary-card">
            <h3>Missed Visits</h3>
            <p>{missedCount}</p>
          </div>

          <div className="summary-card">
            <h3>Protocol Deviations</h3>
            <p>{deviationCount}</p>
          </div>
        </div>

        <div className="visits-filters">
          <input
            type="text"
            placeholder="Search Visit ID..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>

        <div className="visits-table-card">
          <table className="subjects-table">
            <thead>
              <tr>
                <th>Visit ID</th>
                <th>Study</th>
                <th>Subject</th>
                <th>Site</th>
                <th>Visit Type</th>
                <th>Scheduled Date</th>
                <th>Actual Date</th>
                <th>Status</th>
                <th>Deviation</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan="10">No visits found.</td>
                </tr>
              ) : (
                filteredVisits.map((item) => (
                  <tr key={item.visitId}>
                    <td>{item.visitId}</td>
                    <td>{item.studyId}</td>
                    <td>{item.subject}</td>
                    <td>{displaySite(item.site)}</td>
                    <td>{item.visit}</td>
                    <td>{formatScheduleDisplayDate(item.scheduledDate)}</td>
                    <td>
                      {item.actualDate
                        ? formatScheduleDisplayDate(item.actualDate)
                        : "-"}
                    </td>
                    <td>
                      <span className={`status-badge ${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>{item.deviation}</td>
                    <td>
                      <button
                        className="view-btn"
                        onClick={() =>
                          navigate(
                            `/visit-details/${encodeURIComponent(item.visitId)}`
                          )
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}

export default Visits;
