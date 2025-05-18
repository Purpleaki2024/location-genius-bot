
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

// Sample data for location types
const typeData = [
  { name: "Restaurant", count: 42 },
  { name: "Hotel", count: 28 },
  { name: "Attraction", count: 36 },
  { name: "Shopping", count: 22 },
  { name: "Other", count: 15 },
];

const TypesChart = () => {
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={typeData}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" fontSize={12} />
          <YAxis fontSize={12} />
          <Tooltip />
          <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TypesChart;
