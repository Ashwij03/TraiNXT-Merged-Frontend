import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const data = [
  { visit: "Screening", value: 95 },
  { visit: "Visit1", value: 90 },
  { visit: "Visit2", value: 85 },
  { visit: "Visit3", value: 80 }
];

function VisitCompletionChart() {
  return (
    <>
      <h3>Visit Completion</h3>

      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="visit" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#10b981" />
        </BarChart>
      </ResponsiveContainer>
    </>
  );
}

export default VisitCompletionChart;