import { useEffect, useMemo, useState } from "react";
import DashboardCard from "./DashboardCard";
import CalendarWidget from "./CalendarWidget";
import DataTable from "./DataTable";
import { mapScheduleToTableRow } from "../../../services/visitScheduleService";
import useVisitSchedules from "../../../hooks/useVisitSchedules";
import { resolveSiteDisplay } from "../../../utils/siteDisplay";
import { getStudies } from "../../../services/studyService";
import "./VisitCalendarSection.css";

const UPCOMING_COLUMNS = [
  { key: "subjectid", label: "Subject ID", width: "18%" },
  { key: "visit", label: "Visit", width: "20%" },
  { key: "date", label: "Date", width: "16%" },
  { key: "study", label: "Study", width: "18%" },
  { key: "site", label: "Site", width: "14%" },
  { key: "status", label: "Status", width: "14%" }
];

/*
  Unified Calendar + Table card.
  Task 1 & 4: Both Calendar and Table live in ONE card, table sits BESIDE the
  calendar, is reduced in size, and has consistent borders and spacing.
  Task 2 & 3: Clicking a calendar date filters the adjacent table to only show
  events belonging to that date. Any newly-created study, subject, enrollment,
  screening, visit or follow-up date automatically appears in the calendar
  because `useVisitSchedules` reads from the same live services and re-emits
  on `SCHEDULES_EVENT`.
*/
function VisitCalendarSection({
  institutionFilter = "",
  studyCode = "",
  daysAhead = 30,
  cardClassName = "calendar-table-unified-card"
}) {
  const { schedules, upcomingWindow, getVisitsForDate } = useVisitSchedules({
    studyCode,
    institutionFilter,
    daysAhead
  });

  const [selectedScheduleDate, setSelectedScheduleDate] = useState(null);

  useEffect(() => {
    setSelectedScheduleDate(null);
  }, [institutionFilter, studyCode]);

  const handleDateSelect = (date) => {
    setSelectedScheduleDate((current) => (current === date ? null : date));
  };

  const selectedDaySchedules = useMemo(
    () =>
      selectedScheduleDate
        ? getVisitsForDate(selectedScheduleDate).map((item) => ({
            ...item,
            subjectid: item.subjectid || item.subjectId || item.subject
          }))
        : [],
    [getVisitsForDate, selectedScheduleDate]
  );

  const baseRows = useMemo(() => {
    if (selectedScheduleDate) {
      return selectedDaySchedules;
    }

    if (upcomingWindow.length) {
      return upcomingWindow;
    }

    return schedules
      .filter((item) => item.status !== "Completed")
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 12)
      .map(mapScheduleToTableRow);
  }, [schedules, selectedDaySchedules, selectedScheduleDate, upcomingWindow]);

  // Item 17 — Site column renders resolved Site Number (not stored Site Name).
  // Authoritative schedule/site data is left untouched; this is display only.
  const siteResolutionSources = useMemo(() => getStudies(), []);
  const upcomingRows = useMemo(
    () =>
      baseRows.map((row) => ({
        ...row,
        site: row?.site
          ? resolveSiteDisplay(row.site, {
              sources: siteResolutionSources,
              fallback: row.site || "—"
            })
          : "—"
      })),
    [baseRows, siteResolutionSources]
  );

  const tableEmptyMessage = selectedScheduleDate
    ? `No visits on ${selectedScheduleDate}`
    : "No upcoming visits match the current filters";

  const tableTitle = selectedScheduleDate
    ? `Visits on ${selectedScheduleDate}`
    : `Upcoming Visits (Next ${daysAhead} Days)`;

  return (
    <DashboardCard
      title="Visit Calendar & Upcoming Visits"
      className={cardClassName}
    >
      <div className="calendar-table-unified">
        <div className="calendar-table-unified__calendar">
          <CalendarWidget
            schedules={schedules}
            selectedDate={selectedScheduleDate}
            onDateSelect={handleDateSelect}
          />
          {selectedScheduleDate && selectedDaySchedules.length > 0 && (
            <p className="visit-calendar-day-summary">
              {selectedDaySchedules.length} visit
              {selectedDaySchedules.length !== 1 ? "s" : ""} on {selectedScheduleDate}
            </p>
          )}
        </div>

        <div className="calendar-table-unified__table">
          <div className="calendar-table-unified__table-title">
            {tableTitle}
          </div>
          <DataTable
            className="upcoming-visits-table ctms-standard-table"
            columns={UPCOMING_COLUMNS}
            data={upcomingRows}
            emptyMessage={tableEmptyMessage}
          />
        </div>
      </div>
    </DashboardCard>
  );
}

export default VisitCalendarSection;
