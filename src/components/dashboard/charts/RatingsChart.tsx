
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// Sample data for ratings
const ratingData = [
  { name: "5 Stars", value: 48 },
  { name: "4 Stars", value: 32 },
  { name: "3 Stars", value: 15 },
  { name: "2 Stars", value: 8 },
  { name: "1 Star", value: 4 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

const RatingsChart = () => {
  return (
    <div className="h-[250px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={ratingData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {ratingData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} reviews`, 'Count']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RatingsChart;
