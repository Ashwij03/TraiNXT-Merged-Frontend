import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useCROData } from "./CRODATAContext";

const COLORS = ["#ef4444", "#10b981", "#3b82f6", "#94a3b8"];

function QueryStatusChart() {
  const { comments } = useCROData();

  const open = comments.filter((c) => c.status === "Open").length;
  const answered = comments.filter((c) => c.status === "Answered").length;
  const closed = comments.filter((c) => c.status === "Closed").length;

  const data = [
    { name: "Open", value: open },
    { name: "Answered", value: answered },
    { name: "Closed", value: closed },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <>
        <h3>Comments Status</h3>
        <p style={{ textAlign: "center", color: "#94a3b8", padding: "40px 0" }}>
          No comments data available
        </p>
      </>
    );
  }

  return (
    <>
      <h3>Comments Status</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={75}
            label={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{ paddingTop: "15px", fontSize: "14px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}

export default QueryStatusChart;
