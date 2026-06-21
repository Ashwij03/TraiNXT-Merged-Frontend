// UPDATED: Dashboard service now sources dynamic comment data from adminService/studyService
// TODO: Comments code is yet to be completed — pendingQueries key kept for studies dashboard compatibility

import { getStudies, getRecentActivityLogs } from "./studyService";
import {
  getComments,
  getSchedules,
  getSites,
  initializeAdminData
} from "./adminService";
import { getUpcomingVisitsWindow } from "./visitScheduleService";

export const getStudiesDashboard = async () => {
  initializeAdminData();

  const studies = getStudies();
  const comments = getComments();
  const schedules = getSchedules();
  const sites = getSites();
  const totalSubjects = studies.reduce(
    (sum, study) => sum + Number(study.enrolled || 0),
    0
  );
  const openComments = comments.filter((c) => c.status === "Open");

  return {
    kpis: {
      studies: studies.length,
      subjects: totalSubjects,
      comments: openComments.length,
      visits: schedules.length
    },

    enrollmentTrend:
      studies.length > 0
        ? studies.slice(0, 6).map((study, index) => ({
            name: study.code || study.name || `Study ${index + 1}`,
            value: Number(study.enrolled || index + 4)
          }))
        : [
            { name: "Jan", value: 12 },
            { name: "Feb", value: 18 },
            { name: "Mar", value: 25 },
            { name: "Apr", value: 32 },
            { name: "May", value: 41 },
            { name: "Jun", value: 55 }
          ],

    studyDistribution: studies.map((study) => ({
      name: study.name,
      value: Number(study.enrolled || 0)
    })),

    recentSubjects: Object.entries(
      JSON.parse(localStorage.getItem("subjectsByStudy") || "{}")
    )
      .flatMap(([, subjects]) => (Array.isArray(subjects) ? subjects : []))
      .slice(0, 5)
      .map((subject) => ({
        id: subject.subjectId || subject.id,
        study: subject.study || "N/A",
        status: subject.status || "Unknown"
      })),

    upcomingVisits: getUpcomingVisitsWindow(schedules, 30).slice(0, 8).map((item) => ({
      subject: item.subjectId,
      subjectId: item.subjectId,
      visit: item.visit,
      date: item.date,
      study: item.study,
      studyCode: item.study,
      status: item.status
    })),

    pendingComments: openComments.slice(0, 5).map((comment) => ({
      id: comment.id,
      subject: comment.subjectId,
      status: comment.status
    })),
    // UPDATED: legacy key retained for StudyDashboard (studies folder — not modified)
    pendingQueries: openComments.slice(0, 5).map((comment) => ({
      id: comment.id,
      subject: comment.subjectId,
      status: comment.status
    })),

    calendarSchedules: schedules,

    alerts: [
      ...(openComments.length > 0
        ? [
            {
              type: "danger",
              title: "Open Comments",
              message: `${openComments.length} comments require resolution`
            }
          ]
        : []),
      ...(schedules.find((s) => s.status === "Due")
        ? [
            {
              type: "warning",
              title: "Visit Window",
              message: `${schedules.find((s) => s.status === "Due").subjectId} visit is due`
            }
          ]
        : []),
      ...(sites.length > 0
        ? [
            {
              type: "info",
              title: "Site Network",
              message: `${sites.filter((s) => s.status === "Active").length} active sites`
            }
          ]
        : [])
    ],

    studies: studies.map((study) => ({
      studyId: study.code,
      protocol: study.protocol || study.name,
      site: study.site || study.location,
      subjects: study.enrolled,
      status: study.status
    }))
  };
};

export const getRecentActivities = () => {
  initializeAdminData();

  const auditLogs = getRecentActivityLogs(5).map((log) => ({
    id: log.id,
    type: log.action || "System",
    title: log.action || "System activity",
    site: log.studyName || log.studyCode || log.subjectId || "System",
    time: log.timestamp
      ? new Date(log.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit"
        })
      : "Recently"
  }));

  if (auditLogs.length > 0) {
    return auditLogs;
  }

  const schedules = getSchedules().slice(0, 3);

  return schedules.map((item, index) => ({
    id: `schedule-activity-${index}`,
    type: "Visit",
    title: `${item.visit} for ${item.subjectName}`,
    site: item.site,
    time: item.time
  }));
};
