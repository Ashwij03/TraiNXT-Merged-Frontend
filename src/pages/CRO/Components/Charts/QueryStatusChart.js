import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

const data = [
  { name: "Open", value: 40 },
  { name: "Answered", value: 45 },
  { name: "Closed", value: 15 }
];

const COLORS = ["#ef4444", "#10b981", "#3b82f6"];

function QueryStatusChart() {
  return (
    <>
      <h3>Query Status</h3>
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
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index]}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend
            verticalAlign="bottom"
            align="center"
            iconType="circle"
            wrapperStyle={{
              paddingTop: "15px",
              fontSize: "14px"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </>
  );
}

export default QueryStatusChart;