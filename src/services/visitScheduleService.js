
import { readJson } from "../utils/storageHelpers";
// Dynamic visit schedules from subject data, folder workflows, and header filters.

import { getStudies } from "./studyService";
import {
  filterBySite,
  getCurrentUser,
  isAdmin
} from "./roleService";
import { getFilterState } from "./filterService";
import ROLES from "../constants/roles";
import {
  notifyUpcomingVisitReminder,
  notifyVisitCreated,
  notifyVisitUpdated
} from "./notificationService";

export const VISIT_STAGES = [
  "Screening",
  "Enrollment",
  "Visit 1",
  "Visit 2",
  "Visit 3",
  "Completed"
];

export const SCHEDULES_EVENT = "visitSchedulesChange";
export const VISIT_PROGRESS_KEY = "subjectVisitProgress";
export const VISIT_STATUS_COMPLETED = "Completed";
const SCHEDULES_STORAGE_KEY = "adminSchedules";
const SUBJECT_DETAILS_KEY = "subjectDetailsByStudy";
const UPCOMING_VISIT_REMINDER_ROLES = [ROLES.SITE_STAFF, ROLES.PI];
let upcomingVisitReminderSyncInitialized = false;

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function dispatchSchedulesChange() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new CustomEvent(SCHEDULES_EVENT));
}

export function isCompletedVisitStatus(status) {
  return (
    String(status || "").trim().toLowerCase() ===
    VISIT_STATUS_COMPLETED.toLowerCase()
  );
}

export function isCompletedVisitSchedule(schedule) {
  return isCompletedVisitStatus(schedule?.status);
}

export function toLocalDateKey(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

export function getCalendarDateKey(value) {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? "" : toLocalDateKey(value);
  }

  const raw = String(value).trim();
  const isoDateMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (isoDateMatch) {
    return `${isoDateMatch[1]}-${isoDateMatch[2]}-${isoDateMatch[3]}`;
  }

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? "" : toLocalDateKey(parsed);
}

function getCalendarDateSortValue(value) {
  const dateKey = getCalendarDateKey(value);

  if (!dateKey) {
    return Number.POSITIVE_INFINITY;
  }

  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day).getTime();
}

export function compareScheduleDates(first, second) {
  return (
    getCalendarDateSortValue(first?.date ?? first) -
    getCalendarDateSortValue(second?.date ?? second)
  );
}

export function isPastCalendarDate(value, referenceDate = new Date()) {
  const visitSortValue = getCalendarDateSortValue(value);
  const referenceSortValue = getCalendarDateSortValue(referenceDate);

  if (
    !Number.isFinite(visitSortValue) ||
    !Number.isFinite(referenceSortValue)
  ) {
    return false;
  }

  return visitSortValue < referenceSortValue;
}

export function isUpcomingVisitSchedule(item, referenceDate = new Date()) {
  return Boolean(
    item?.date &&
      !isCompletedVisitSchedule(item) &&
      !isPastCalendarDate(item.date, referenceDate)
  );
}

function addCalendarDays(dateKey, days) {
  const parts = String(dateKey || "")
    .split("-")
    .map((part) => Number(part));

  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return "";
  }

  const date = new Date(parts[0], parts[1] - 1, parts[2]);
  date.setDate(date.getDate() + days);
  return toLocalDateKey(date);
}

function isOneCalendarDayBefore(visitDateValue, referenceDate = new Date()) {
  const visitDateKey = getCalendarDateKey(visitDateValue);
  const referenceDateKey = getCalendarDateKey(referenceDate);

  if (!visitDateKey || !referenceDateKey) {
    return false;
  }

  return addCalendarDays(referenceDateKey, 1) === visitDateKey;
}

function resolveReminderRecipient(schedule) {
  const studyCode = String(schedule?.study || schedule?.studyKey || "").trim();

  if (!studyCode) {
    return null;
  }

  return {
    studyCode,
    targetRoles: UPCOMING_VISIT_REMINDER_ROLES,
    recipientKey: `${studyCode}:${UPCOMING_VISIT_REMINDER_ROLES.join("+")}`
  };
}

export function synchronizeUpcomingVisitReminders(referenceDate = new Date()) {
  if (typeof window === "undefined") {
    return {
      scanned: 0,
      eligible: 0,
      created: 0,
      skippedCompleted: 0,
      skippedInvalidDate: 0,
      skippedRecipient: 0
    };
  }

  const schedules = filterCalendarSchedules(readJson(SCHEDULES_STORAGE_KEY, []));
  const result = {
    scanned: schedules.length,
    eligible: 0,
    created: 0,
    skippedCompleted: 0,
    skippedInvalidDate: 0,
    skippedRecipient: 0
  };

  schedules.forEach((schedule) => {
    if (!schedule?.id) {
      return;
    }

    if (isCompletedVisitSchedule(schedule)) {
      result.skippedCompleted += 1;
      return;
    }

    const occurrenceDate = getCalendarDateKey(schedule.date);

    if (!occurrenceDate) {
      result.skippedInvalidDate += 1;
      return;
    }

    if (!isOneCalendarDayBefore(schedule.date, referenceDate)) {
      return;
    }

    const recipient = resolveReminderRecipient(schedule);

    if (!recipient) {
      result.skippedRecipient += 1;
      return;
    }

    result.eligible += 1;

    const notification = notifyUpcomingVisitReminder({
      schedule,
      occurrenceDate: schedule.date,
      ...recipient
    });

    if (notification) {
      result.created += 1;
    }
  });

  return result;
}

export function initializeUpcomingVisitReminderSynchronization() {
  if (typeof window === "undefined" || upcomingVisitReminderSyncInitialized) {
    return;
  }

  upcomingVisitReminderSyncInitialized = true;
  const sync = () => synchronizeUpcomingVisitReminders();

  sync();
  window.addEventListener(SCHEDULES_EVENT, sync);
}

function normalizeStudy(study) {
  return {
    ...study,
    indication: study.indication || "General",
    sponsor: study.sponsor || "TriaNXT Research",
    cro: study.cro || "TriaNXT CRO",
    site: study.site || study.location || ""
  };
}

function getStudyMap() {
  const map = new Map();

  getStudies().forEach((study) => {
    const normalized = normalizeStudy(study);
    map.set(String(study.code || study.id), normalized);
  });

  return map;
}

function readSubjectDetails(studyId, subjectId) {
  const all = readJson(SUBJECT_DETAILS_KEY, {});
  return all[`${studyId}::${subjectId}`] || {};
}

function readSubjectVisits(subjectId) {
  return readJson(`subject_${subjectId}_visits`, []);
}

function buildScheduleId(studyKey, subjectId, visit) {
  return `${studyKey}::${subjectId}::${visit}`;
}

const CALENDAR_EXCLUDED_VISITS = new Set(["Enrollment"]);

function isCalendarScheduleEntry(entry) {
  return entry && !CALENDAR_EXCLUDED_VISITS.has(String(entry.visit || ""));
}

function filterCalendarSchedules(schedules) {
  return schedules.filter(isCalendarScheduleEntry);
}

function createScheduleEntry({
  studyKey,
  subject,
  visit,
  date,
  status = "Scheduled",
  time = "09:00 AM",
  source = "subject"
}) {
  if (!date || !visit) {
    return null;
  }

  const subjectId = String(subject.subjectId || subject.id);
  const studyMeta = getStudyMap().get(String(studyKey)) || {};

  return {
    id: buildScheduleId(studyKey, subjectId, visit),
    date,
    subjectId,
    subjectName:
      subject.initials ||
      subject.name ||
      readSubjectDetails(studyKey, subjectId).initials ||
      subjectId,
    visit,
    status,
    study: studyKey,
    site:
      subject.site ||
      readSubjectDetails(studyKey, subjectId).site ||
      studyMeta.site ||
      "—",
    time,
    studyKey,
    source
  };
}

export function getNextVisitStage(completedStage) {
  const index = VISIT_STAGES.indexOf(completedStage);

  if (index === -1 || index >= VISIT_STAGES.length - 1) {
    return null;
  }

  return VISIT_STAGES[index + 1];
}

export function getVisitProgress(studyId, subjectId) {
  const all = readJson(VISIT_PROGRESS_KEY, {});
  return (
    all[`${studyId}::${subjectId}`] || {
      completedStages: [],
      pendingNextVisitPrompt: false,
      lastCompletedStage: ""
    }
  );
}

export function saveVisitProgress(studyId, subjectId, progress) {
  const all = readJson(VISIT_PROGRESS_KEY, {});
  all[`${studyId}::${subjectId}`] = {
    ...getVisitProgress(studyId, subjectId),
    ...progress
  };
  writeJson(VISIT_PROGRESS_KEY, all);
  dispatchSchedulesChange();
}

export function markVisitStageCompleted(studyId, subjectId, stageName) {
  const progress = getVisitProgress(studyId, subjectId);
  const completedStages = progress.completedStages.includes(stageName)
    ? progress.completedStages
    : [...progress.completedStages, stageName];

  saveVisitProgress(studyId, subjectId, {
    completedStages,
    lastCompletedStage: stageName,
    pendingNextVisitPrompt: Boolean(getNextVisitStage(stageName))
  });
}

export function clearNextVisitPrompt(studyId, subjectId) {
  saveVisitProgress(studyId, subjectId, {
    pendingNextVisitPrompt: false
  });
}

export function shouldPromptNextVisit(studyId, subjectId) {
  const progress = getVisitProgress(studyId, subjectId);
  return Boolean(progress.pendingNextVisitPrompt && progress.lastCompletedStage);
}

export function buildSchedulesFromSubjects() {
  const subjectsByStudy = readJson("subjectsByStudy", {});
  const generated = [];

  Object.entries(subjectsByStudy).forEach(([studyKey, subjects]) => {
    (Array.isArray(subjects) ? subjects : []).forEach((subject) => {
      const subjectId = String(subject.subjectId || subject.id);
      const details = readSubjectDetails(studyKey, subjectId);

      if (details.screeningDate || subject.screeningDate) {
        const entry = createScheduleEntry({
          studyKey,
          subject: { ...subject, ...details },
          visit: "Screening",
          date: details.screeningDate || subject.screeningDate,
          status: String(subject.status || details.status || "")
            .toLowerCase()
            .includes("screen")
            ? "Scheduled"
            : "Completed"
        });

        if (entry) {
          generated.push(entry);
        }
      }

      if (details.enrollmentDate || subject.enrollmentDate) {
        const entry = createScheduleEntry({
          studyKey,
          subject: { ...subject, ...details },
          visit: "Enrollment",
          date: details.enrollmentDate || subject.enrollmentDate,
          status: "Completed",
          source: "subject"
        });

        if (entry) {
          generated.push(entry);
        }
      }

      readSubjectVisits(subjectId).forEach((visit) => {
        const entry = createScheduleEntry({
          studyKey,
          subject: { ...subject, ...details },
          visit: visit.name,
          date: visit.plannedDate || visit.actualDate,
          status: visit.status || "Scheduled",
          time: visit.time || "09:00 AM",
          source: "visit-record"
        });

        if (entry) {
          generated.push(entry);
        }
      });
    });
  });

  return generated;
}

export function saveSchedules(schedules) {
  writeJson(SCHEDULES_STORAGE_KEY, schedules);
  dispatchSchedulesChange();
}

export function syncSubjectSchedules(studyId, subjectId, subject = {}) {
  const details = readSubjectDetails(studyId, subjectId);
  const mergedSubject = { ...subject, ...details, id: subjectId };
  const generated = [];

  if (mergedSubject.screeningDate) {
    const entry = createScheduleEntry({
      studyKey: studyId,
      subject: mergedSubject,
      visit: mergedSubject.currentVisit || "Screening",
      date: mergedSubject.screeningDate
    });

    if (entry) {
      generated.push(entry);
    }
  }

  if (mergedSubject.enrollmentDate) {
    const entry = createScheduleEntry({
      studyKey: studyId,
      subject: mergedSubject,
      visit: "Enrollment",
      date: mergedSubject.enrollmentDate,
      status: "Completed",
      source: "subject"
    });

    if (entry) {
      generated.push(entry);
    }
  }

  readSubjectVisits(subjectId).forEach((visit) => {
    const entry = createScheduleEntry({
      studyKey: studyId,
      subject: mergedSubject,
      visit: visit.name,
      date: visit.plannedDate || visit.actualDate,
      status: visit.status || "Scheduled",
      time: visit.time || "09:00 AM",
      source: "visit-record"
    });

    if (entry) {
      generated.push(entry);
    }
  });

  const existing = readJson(SCHEDULES_STORAGE_KEY, []);
  const subjectPrefix = `${studyId}::${subjectId}::`;
  const manualEntries = existing.filter(
    (item) =>
      !String(item.id || "").startsWith(subjectPrefix) &&
      !(
        String(item.subjectId) === String(subjectId) &&
        String(item.study || item.studyKey) === String(studyId) &&
        item.source !== "manual"
      )
  );

  saveSchedules([...manualEntries, ...generated]);
}

export function addOrUpdateVisitSchedule({
  studyId,
  subjectId,
  subject = {},
  visitName,
  date,
  time = "09:00 AM",
  status = "Scheduled"
}) {
  const entry = createScheduleEntry({
    studyKey: studyId,
    subject,
    visit: visitName,
    date,
    time,
    status,
    source: "manual"
  });

  if (!entry) {
    return null;
  }

  const existing = readJson(SCHEDULES_STORAGE_KEY, []);
  const wasExisting = existing.some((item) => item.id === entry.id);
  const withoutDuplicate = existing.filter((item) => item.id !== entry.id);
  saveSchedules([...withoutDuplicate, entry]);
  clearNextVisitPrompt(studyId, subjectId);

  // "manual" is the one source that represents a real, user-driven
  // create/update action (visit-plan sync and the next-visit form both
  // funnel through here) — this is the single choke point for the B10
  // "visit created/updated" notification triggers.
  const notifyPayload = { studyCode: studyId, subjectId, date, status };
  if (wasExisting) {
    notifyVisitUpdated(notifyPayload);
  } else {
    notifyVisitCreated(notifyPayload);
  }

  return entry;
}

export function saveNextVisitDetails(studyId, subjectId, details, subject = {}) {
  const nextStage =
    details.visitName ||
    getNextVisitStage(getVisitProgress(studyId, subjectId).lastCompletedStage);

  if (!nextStage) {
    clearNextVisitPrompt(studyId, subjectId);
    return null;
  }

  const visitRecord = {
    id: Date.now(),
    name: nextStage,
    plannedDate: details.date,
    actualDate: "",
    status: details.status || "Scheduled",
    time: details.time || "09:00 AM"
  };

  const visits = readSubjectVisits(subjectId);
  const updatedVisits = [...visits, visitRecord];
  writeJson(`subject_${subjectId}_visits`, updatedVisits);

  return addOrUpdateVisitSchedule({
    studyId,
    subjectId,
    subject,
    visitName: nextStage,
    date: details.date,
    time: details.time,
    status: details.status
  });
}

export function rebuildSchedulesFromSubjects() {
  const generated = buildSchedulesFromSubjects();
  const existing = readJson(SCHEDULES_STORAGE_KEY, []);
  const generatedIds = new Set(generated.map((item) => item.id));
  const legacyManual = existing.filter(
    (item) => !item.id || !generatedIds.has(item.id)
  );

  const merged = [...legacyManual];

  generated.forEach((entry) => {
    const index = merged.findIndex((item) => item.id === entry.id);

    if (index >= 0) {
      merged[index] = { ...merged[index], ...entry };
    } else {
      merged.push(entry);
    }
  });

  writeJson(SCHEDULES_STORAGE_KEY, merged);
  dispatchSchedulesChange();
  return merged;
}

function matchesHeaderFilters(schedule, filters, studyMap) {
  const studyMeta = studyMap.get(String(schedule.study || schedule.studyKey));

  if (filters.indication && studyMeta?.indication !== filters.indication) {
    return false;
  }

  if (filters.sponsor && studyMeta?.sponsor !== filters.sponsor) {
    return false;
  }

  if (filters.cro && studyMeta?.cro !== filters.cro) {
    return false;
  }

  if (filters.studyCode) {
    const scheduleStudy = String(schedule.study || schedule.studyKey || "");
    if (scheduleStudy !== String(filters.studyCode)) {
      return false;
    }
  }

  if (filters.institution) {
    const site = schedule.site || studyMeta?.site || "";
    if (
      site !== filters.institution &&
      !String(site).includes(filters.institution) &&
      !filters.institution.includes(String(site))
    ) {
      return false;
    }
  }

  if (filters.siteNumber) {
    const siteNumber = studyMeta?.siteNumber || "";
    if (
      String(siteNumber) !== String(filters.siteNumber) &&
      !String(schedule.site).includes(String(filters.siteNumber))
    ) {
      return false;
    }
  }

  if (filters.subject) {
    if (String(schedule.subjectId) !== String(filters.subject)) {
      return false;
    }
  }

  return true;
}

export function getMergedSchedules(user = getCurrentUser()) {
  const schedules = filterCalendarSchedules(readJson(SCHEDULES_STORAGE_KEY, []));
  return isAdmin(user)
    ? schedules
    : filterBySite(schedules, "site", user);
}

export function getFilteredSchedules(
  user = getCurrentUser(),
  options = {}
) {
  const schedules = getMergedSchedules(user);
  const filters = {
    ...getFilterState(),
    ...options
  };
  const studyMap = getStudyMap();

  return schedules.filter((schedule) =>
    matchesHeaderFilters(schedule, filters, studyMap)
  );
}

export function getUpcomingVisitsForDate(schedules, date) {
  const targetDate = getCalendarDateKey(date);

  if (!targetDate) {
    return [];
  }

  return schedules
    .filter(
      (item) =>
        !isCompletedVisitSchedule(item) &&
        getCalendarDateKey(item.date) === targetDate
    )
    .sort(compareScheduleDates)
    .map((item) => ({
      subjectid: item.subjectId,
      subject: item.subjectId,
      visit: item.visit,
      date: item.date,
      status: item.status,
      study: item.study,
      site: item.site
    }));
}

export function mapScheduleToTableRow(item) {
  return {
    id: item.id,
    subjectid: item.subjectId,
    subjectId: item.subjectId,
    subject: item.subjectId,
    subjectName: item.subjectName || item.subjectId,
    visit: item.visit,
    date: item.date,
    status: item.status || "Scheduled",
    study: item.study || item.studyKey || "—",
    site: item.site || "—"
  };
}

export function getUpcomingVisitsWindow(
  schedules,
  daysAhead = 7,
  referenceDate = new Date()
) {
  const startKey = getCalendarDateKey(referenceDate);

  if (!startKey) {
    return [];
  }

  const endKey = addCalendarDays(startKey, daysAhead);
  const startValue = getCalendarDateSortValue(startKey);
  const endValue = getCalendarDateSortValue(endKey);

  return schedules
    .filter((item) => {
      const visitValue = getCalendarDateSortValue(item.date);
      if (!Number.isFinite(visitValue) || isCompletedVisitSchedule(item)) {
        return false;
      }

      return (
        visitValue >= startValue &&
        visitValue <= endValue
      );
    })
    .sort(compareScheduleDates)
    .map(mapScheduleToTableRow);
}
