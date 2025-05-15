
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Sample data for the charts
const activityData = [
  { name: "Mon", users: 25, locations: 5 },
  { name: "Tue", users: 30, locations: 8 },
  { name: "Wed", users: 22, locations: 7 },
  { name: "Thu", users: 38, locations: 10 },
  { name: "Fri", users: 42, locations: 12 },
  { name: "Sat", users: 35, locations: 9 },
  { name: "Sun", users: 28, locations: 6 },
];

const typeData = [
  { name: "Restaurant", count: 42 },
  { name: "Hotel", count: 28 },
  { name: "Attraction", count: 36 },
  { name: "Shopping", count: 22 },
  { name: "Other", count: 15 },
];

const DashboardCharts = () => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Analytics</CardTitle>
        <CardDescription>
          Activity metrics and location data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity">
          <TabsList className="mb-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="types">Location Types</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="space-y-4">
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="locations" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                  />
                </LineChart>
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
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DashboardCharts;
