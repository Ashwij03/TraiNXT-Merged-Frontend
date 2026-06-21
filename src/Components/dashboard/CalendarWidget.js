import { useState } from "react";
import "./CalendarWidget.css";

function CalendarWidget({
  schedules = [],
  selectedDate,
  onDateSelect,
}) {
  const initialDate = selectedDate
    ? new Date(selectedDate)
    : new Date();

  const [currentMonth, setCurrentMonth] = useState(
    initialDate.getMonth()
  );

  const [currentYear, setCurrentYear] = useState(
    initialDate.getFullYear()
  );

  const [internalSelectedDate, setInternalSelectedDate] =
    useState(
      selectedDate ??
      new Date().toISOString().split("T")[0]
    );

  const isControlled = typeof onDateSelect === "function";

  const activeDate = isControlled
    ? selectedDate
    : selectedDate || internalSelectedDate;

  const weekDays = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysInMonth = new Date(
    currentYear,
    currentMonth + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentYear,
    currentMonth,
    1
  ).getDay();

  const handleDateSelect = (date) => {
    if (onDateSelect) {
      onDateSelect(date);
    } else {
      setInternalSelectedDate(date);
    }
  };

  const getSchedulesForDate = (date) => {
    if (!date) {
      return [];
    }

    return schedules.filter(
      (schedule) => String(schedule.date || "").slice(0, 10) === date
    );
  };

  const changeMonth = (direction) => {
    if (direction === "prev") {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    }
  };

  const calendarCells = [];

  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  const selectedSchedules =
    getSchedulesForDate(activeDate);

  return (
    <div className="calendar-widget">

      <div className="calendar-header">

        <button
          className="calendar-nav-btn"
          onClick={() => changeMonth("prev")}
        >
          ←
        </button>

        <div>
          <span className="calendar-eyebrow">
            Visit Calendar
          </span>

          <h3 className="calendar-title">
            {monthNames[currentMonth]} {currentYear}
          </h3>
        </div>

        <button
          className="calendar-nav-btn"
          onClick={() => changeMonth("next")}
        >
          →
        </button>

      </div>

      <div className="calendar-weekdays">
        {weekDays.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className="calendar-grid">

        {calendarCells.map((day, index) => {

          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="calendar-empty-cell"
                aria-hidden="true"
              />
            );
          }

          const date =
            `${currentYear}-${String(
              currentMonth + 1
            ).padStart(2, "0")}-${String(day).padStart(
              2,
              "0"
            )}`;

          const daySchedules =
            getSchedulesForDate(date);

          const hasSchedule =
            daySchedules.length > 0;

          const isSelected =
            activeDate === date;

          return (
            <button
              key={date}
              type="button"
              className={[
                "calendar-day",
                hasSchedule
                  ? "has-schedule"
                  : "",
                isSelected
                  ? "selected"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() =>
                handleDateSelect(date)
              }
            >
              <span>{day}</span>

              {hasSchedule && (
                <small>
                  {daySchedules.length}
                </small>
              )}
            </button>
          );
        })}
      </div>

      <div className="calendar-details">

        <div className="calendar-details-title">

          <div>
            <span>
              Schedule Details
            </span>

            <p>
              {selectedSchedules.length}
              {" "}
              item
              {selectedSchedules.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <strong>
            {activeDate || "Select a date"}
          </strong>

        </div>

        {!activeDate ? (
          <div className="calendar-empty">
            Select a date to view schedule details
          </div>
        ) : selectedSchedules.length > 0 ? (

          selectedSchedules.map(
            (schedule, index) => (
              <div
                key={index}
                className="schedule-card"
              >
                <div className="schedule-card-top">

                  <div>
                    <strong>
                      {schedule.visit}
                    </strong>

                    <small>
                      {schedule.time}
                    </small>
                  </div>

                  <span>
                    {schedule.status}
                  </span>

                </div>

                <div className="schedule-meta">

                  <p>
                    <b>Subject:</b>
                    {" "}
                    {schedule.subjectId}
                  </p>

                  <p>
                    <b>Study:</b>
                    {" "}
                    {schedule.study}
                  </p>

                  <p>
                    <b>Site:</b>
                    {" "}
                    {schedule.site}
                  </p>

                </div>
              </div>
            )
          )

        ) : (
          <div className="calendar-empty">
            No schedules on this date
          </div>
        )}

      </div>
    </div>
  );
}

export default CalendarWidget;