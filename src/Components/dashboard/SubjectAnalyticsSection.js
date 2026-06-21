import DashboardCard from "./DashboardCard";
import DashboardPieChart from "./DashboardPieChart";
import DashboardBarChart from "./DashboardBarChart";
import { getSubjectStatusAnalytics } from "../../utils/contentAccess";
import { getEnrollmentStatusAnalytics } from "../../utils/enrollmentStatusAnalytics";
import "./SubjectAnalyticsSection.css";

function SubjectAnalyticsSection({
  subjects = [],
  studies = [],
  studyCode = null,
  compactKpis = false
}) {
  const subjectStatusData = getSubjectStatusAnalytics(subjects);
  const enrollmentStatusData = getEnrollmentStatusAnalytics(subjects, {
    studyCode,
    studies
  });

  const compactClass = compactKpis
    ? " subject-analytics-section--compact"
    : "";

  return (
    <div className={`subject-analytics-section${compactClass}`}>
      <div className="subject-analytics-pair-grid">
        <DashboardCard title="Subject Status Analytics">
          <div className="subject-status-kpi-grid">
            {subjectStatusData.map((item) => (
              <div key={item.name} className="subject-status-kpi">
                <strong>{item.value}</strong>
                <span>{item.name}</span>
              </div>
            ))}
          </div>
          <DashboardPieChart data={subjectStatusData} />
        </DashboardCard>

        <DashboardCard title="Enrollment Status">
          <DashboardBarChart
            data={enrollmentStatusData}
            dataKey="value"
            fill="#2563eb"
          />
        </DashboardCard>
      </div>
    </div>
  );
}

export default SubjectAnalyticsSection;
