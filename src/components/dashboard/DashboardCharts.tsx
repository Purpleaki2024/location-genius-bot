
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

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

const typeData = [
  { name: "Restaurant", count: 42 },
  { name: "Hotel", count: 28 },
  { name: "Attraction", count: 36 },
  { name: "Shopping", count: 22 },
  { name: "Other", count: 15 },
];

const ratingData = [
  { name: "5 Stars", value: 48 },
  { name: "4 Stars", value: 32 },
  { name: "3 Stars", value: 15 },
  { name: "2 Stars", value: 8 },
  { name: "1 Star", value: 4 },
];

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

const DashboardCharts = () => {
  const [activeTab, setActiveTab] = useState("activity");
  const [dataType, setDataType] = useState("all");
  const [chartType, setChartType] = useState("line");

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Activity metrics and location data
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {activeTab === "activity" && (
              <Select 
                value={chartType} 
                onValueChange={setChartType}
              >
                <SelectTrigger className="w-[130px] h-8">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Line Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Select 
              value={dataType} 
              onValueChange={setDataType}
            >
              <SelectTrigger className="w-[100px] h-8">
                <SelectValue placeholder="Data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="users">Users</SelectItem>
                <SelectItem value="locations">Locations</SelectItem>
                <SelectItem value="reviews">Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="types">Location Types</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="types">
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
          </TabsContent>
          
          <TabsContent value="ratings">
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
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-xs text-muted-foreground text-right">
          <Button variant="ghost" size="sm" className="h-auto p-0">
            <span>Export Data</span>
            <ChevronDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCharts;
