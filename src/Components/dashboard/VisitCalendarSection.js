import { useEffect, useMemo, useState } from "react";
import DashboardCard from "./DashboardCard";
import CalendarWidget from "./CalendarWidget";
import DataTable from "./DataTable";
import useVisitSchedules from "../../hooks/useVisitSchedules";
import { mapScheduleToTableRow } from "../../services/visitScheduleService";

const UPCOMING_COLUMNS = [
  { key: "subjectid", label: "Subject ID", width: "16%" },
  { key: "visit", label: "Visit", width: "18%" },
  { key: "date", label: "Date", width: "14%" },
  { key: "study", label: "Study", width: "16%" },
  { key: "site", label: "Site", width: "14%" },
  { key: "status", label: "Status", width: "14%" }
];

function VisitCalendarSection({
  institutionFilter = "",
  studyCode = "",
  daysAhead = 30,
  calendarClassName = "calendar-card-compact",
  tableClassName = "upcoming-visits-full-width"
}) {
  const { schedules, upcomingWindow, getVisitsForDate } = useVisitSchedules({
    institutionFilter,
    studyCode,
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

  const upcomingRows = useMemo(() => {
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

  const tableEmptyMessage = selectedScheduleDate
    ? `No visits on ${selectedScheduleDate}`
    : "No upcoming visits match the current filters";

  const tableTitle = selectedScheduleDate
    ? `Visits on ${selectedScheduleDate}`
    : `Upcoming Visits (Next ${daysAhead} Days)`;

  return (
    <div className="dashboard-grid-calendar-requests">
      <DashboardCard title="Calendar" className={calendarClassName}>
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
      </DashboardCard>

      <DashboardCard
        title={tableTitle}
        className={tableClassName}
      >
        <DataTable
          className="upcoming-visits-table"
          columns={UPCOMING_COLUMNS}
          data={upcomingRows}
          emptyMessage={tableEmptyMessage}
        />
      </DashboardCard>
    </div>
  );
}

export default VisitCalendarSection;
