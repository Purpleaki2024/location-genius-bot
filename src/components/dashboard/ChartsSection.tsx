
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import TopRequestedLocations from "@/components/dashboard/TopRequestedLocations";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLocations } from "@/hooks/use-locations";
import { useNavigate } from "react-router-dom";

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

const ChartsSection = () => {
  const [chartType, setChartType] = useState<"locations" | "requests">("locations");
  const { locations } = useLocations();
  const navigate = useNavigate();

  // Transform locations data for the bar chart if we have real data
  const locationPopularityData = locations && locations.length > 0
    ? locations.slice(0, 5).map(loc => ({
        name: loc.name,
        requests: Math.floor(Math.random() * 400) + 100, // Placeholder for request data
        successRate: Math.floor(Math.random() * 5) + 95 // Placeholder for success rate
      }))
    : [
        { name: "London", requests: 420, successRate: 98 },
        { name: "Manchester", requests: 380, successRate: 97 },
        { name: "Birmingham", requests: 310, successRate: 98 },
        { name: "Leeds", requests: 275, successRate: 99 },
        { name: "Liverpool", requests: 260, successRate: 98 },
      ];
      
  const handleViewAllAnalytics = () => {
    navigate("/locations");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Location Analytics</h2>
          <p className="text-muted-foreground">Monitor location requests and performance</p>
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant={chartType === "locations" ? "default" : "outline"}
            onClick={() => setChartType("locations")}
          >
            Locations
          </Button>
          <Button 
            size="sm" 
            variant={chartType === "requests" ? "default" : "outline"}
            onClick={() => setChartType("requests")}
          >
            Requests
          </Button>
        </div>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="pt-6">
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
        </CardContent>
      </Card>
      
      <div className="mt-4">
        <TopRequestedLocations />
      </div>

      <div className="flex justify-end mt-2">
        <Button className="flex items-center" variant="outline" onClick={handleViewAllAnalytics}>
          View All Analytics <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChartsSection;
