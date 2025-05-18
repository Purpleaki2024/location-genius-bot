
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// Sample data for the charts
const activityData = [
  { name: "Mon", users: 25, locations: 5, reviews: 12 },
  { name: "Tue", users: 30, locations: 8, reviews: 18 },
  { name: "Wed", users: 22, locations: 7, reviews: 15 },
  { name: "Thu", users: 38, locations: 10, reviews: 22 },
  { name: "Fri", users: 42, locations: 12, reviews: 28 },
  { name: "Sat", users: 35, locations: 9, reviews: 20 },
  { name: "Sun", users: 28, locations: 6, reviews: 17 },
];

interface ActivityChartProps {
  chartType: "line" | "bar";
  dataType: "all" | "users" | "locations" | "reviews";
}

const ActivityChart = ({ chartType, dataType }: ActivityChartProps) => {
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "line" ? (
          <LineChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            {(dataType === "all" || dataType === "users") && (
              <Line 
                type="monotone" 
                dataKey="users" 
                stroke="#8884d8" 
                strokeWidth={2}
                activeDot={{ r: 6 }}
              />
            )}
            {(dataType === "all" || dataType === "locations") && (
              <Line 
                type="monotone" 
                dataKey="locations" 
                stroke="#82ca9d" 
                strokeWidth={2}
              />
            )}
            {(dataType === "all" || dataType === "reviews") && (
              <Line 
                type="monotone" 
                dataKey="reviews" 
                stroke="#ffc658" 
                strokeWidth={2}
              />
            )}
          </LineChart>
        ) : (
          <BarChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="name" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            {(dataType === "all" || dataType === "users") && (
              <Bar dataKey="users" fill="#8884d8" radius={[4, 4, 0, 0]} />
            )}
            {(dataType === "all" || dataType === "locations") && (
              <Bar dataKey="locations" fill="#82ca9d" radius={[4, 4, 0, 0]} />
            )}
            {(dataType === "all" || dataType === "reviews") && (
              <Bar dataKey="reviews" fill="#ffc658" radius={[4, 4, 0, 0]} />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
