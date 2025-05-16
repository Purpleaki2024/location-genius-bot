
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import TopRequestedLocations from "@/components/dashboard/TopRequestedLocations";

// Sample data for the charts
const requestVolumeData = [
  { name: "Mon", totalRequests: 122, successfulRequests: 118 },
  { name: "Tue", totalRequests: 145, successfulRequests: 140 },
  { name: "Wed", totalRequests: 165, successfulRequests: 160 },
  { name: "Thu", totalRequests: 185, successfulRequests: 178 },
  { name: "Fri", totalRequests: 220, successfulRequests: 214 },
  { name: "Sat", totalRequests: 175, successfulRequests: 170 },
  { name: "Sun", totalRequests: 150, successfulRequests: 146 },
];

const locationPopularityData = [
  { name: "London", requests: 420, successRate: 98 },
  { name: "Manchester", requests: 380, successRate: 97 },
  { name: "Birmingham", requests: 310, successRate: 98 },
  { name: "Leeds", requests: 275, successRate: 99 },
  { name: "Liverpool", requests: 260, successRate: 98 },
];

const ChartsSection = () => {
  const [chartType, setChartType] = useState<"locations" | "requests">("locations");

  return (
    <div className="space-y-6">
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "requests" ? (
            <LineChart data={requestVolumeData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="totalRequests" 
                stroke="#8884d8" 
                strokeWidth={2}
                name="Total Requests"
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="successfulRequests" 
                stroke="#82ca9d" 
                strokeWidth={2}
                name="Successful Requests"
              />
            </LineChart>
          ) : (
            <BarChart data={locationPopularityData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="requests" fill="#8884d8" name="Requests" />
              <Bar dataKey="successRate" fill="#82ca9d" name="Success Rate (%)" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopRequestedLocations />
      </div>
    </div>
  );
};

export default ChartsSection;
