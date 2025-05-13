import Header from "@/components/Header";
import StatCards from "@/components/StatCards";
import LocationMap from "@/components/LocationMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer } from "@/components/ui/chart";
import { 
  ResponsiveContainer,
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar
} from "recharts";

// Sample data for charts
const locationData = [
  {
    id: "1",
    name: "Central Park Café",
    lat: 40.7812,
    lng: -73.9665,
    rating: 4.7,
    type: "restaurant"
  },
  {
    id: "2",
    name: "Ocean View Hotel",
    lat: 40.7609,
    lng: -73.9845,
    rating: 4.5,
    type: "hotel"
  },
  {
    id: "3",
    name: "City Museum",
    lat: 40.7789,
    lng: -73.9675,
    rating: 4.8,
    type: "attraction"
  }
];

// Sample chart data
const chartData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  
  return {
    name: date.toLocaleDateString('en-US', { weekday: 'short' }),
    requests: Math.floor(Math.random() * 500) + 800,
    users: Math.floor(Math.random() * 100) + 200,
  };
});

const locationTypes = [
  { name: "Restaurant", value: 42 },
  { name: "Hotel", value: 28 },
  { name: "Attraction", value: 15 },
  { name: "Park", value: 10 },
  { name: "Shopping", value: 5 }
];

const Dashboard = () => {
  return (
    <div className="space-y-6 p-6">
      <Header title="Dashboard" />
      
      <StatCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Location Map</CardTitle>
            <CardDescription>
              Top rated locations in the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LocationMap locations={locationData} height="300px" />
          </CardContent>
        </Card>
        
        <Card>
          <Tabs defaultValue="requests">
            <CardHeader className="pb-0">
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View request and user statistics
              </CardDescription>
              <TabsList className="mt-2">
                <TabsTrigger value="requests">Requests</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
              </TabsList>
            </CardHeader>
            <CardContent className="pt-4">
              <TabsContent value="requests" className="mt-0">
                <ChartContainer config={{
                  requests: { label: "Requests", color: "#3b82f6" },
                  users: { label: "Users", color: "#22c55e" }
                }}>
                  <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis width={50} />
                    <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                    <Legend />
                    <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} />
                  </RechartsLineChart>
                </ChartContainer>
              </TabsContent>
              <TabsContent value="locations" className="mt-0">
                <ChartContainer config={{
                  value: { label: "Locations", color: "#a855f7" }
                }}>
                  <RechartsBarChart data={locationTypes} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis width={50} />
                    <Tooltip formatter={(value) => `${value} locations`} />
                    <Legend />
                    <Bar dataKey="value" fill="#a855f7" />
                  </RechartsBarChart>
                </ChartContainer>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
