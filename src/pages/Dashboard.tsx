
import UserHeader from "@/components/UserHeader";
import StatCards from "@/components/StatCards";
import LocationMap from "@/components/LocationMap";
import { useAuth } from "@/contexts/AuthContext";
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

// Role-specific dashboard components
const AdminOnlySection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Admin Controls</CardTitle>
      <CardDescription>Advanced features only available to administrators</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
          <Settings className="h-6 w-6 mb-1" />
          <span>System Settings</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
          <Shield className="h-6 w-6 mb-1" />
          <span>Security Controls</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
          <Database className="h-6 w-6 mb-1" />
          <span>Database Management</span>
        </Button>
      </div>
    </CardContent>
  </Card>
);

const ManagerSection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Operations Dashboard</CardTitle>
      <CardDescription>Tools for location and user management</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-medium">Pending Reviews</h3>
            <p className="text-3xl font-bold mt-2">24</p>
            <p className="text-sm text-muted-foreground">Awaiting approval</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-medium">New Locations</h3>
            <p className="text-3xl font-bold mt-2">7</p>
            <p className="text-sm text-muted-foreground">Added this week</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const UserSection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Your Activity</CardTitle>
      <CardDescription>Your recent interactions with the system</CardDescription>
    </CardHeader>
    <CardContent>
      <ul className="space-y-3">
        <li className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <p className="font-medium">Viewed location details</p>
            <p className="text-sm text-muted-foreground">Central Park Café</p>
          </div>
          <p className="text-xs text-muted-foreground">5 mins ago</p>
        </li>
        <li className="flex items-center justify-between border-b border-border pb-2">
          <div>
            <p className="font-medium">Searched locations</p>
            <p className="text-sm text-muted-foreground">"restaurants near downtown"</p>
          </div>
          <p className="text-xs text-muted-foreground">Yesterday</p>
        </li>
        <li className="flex items-center justify-between">
          <div>
            <p className="font-medium">Updated profile</p>
            <p className="text-sm text-muted-foreground">Changed notification settings</p>
          </div>
          <p className="text-xs text-muted-foreground">2 days ago</p>
        </li>
      </ul>
    </CardContent>
  </Card>
);

// Import missing components
import { Button } from "@/components/ui/button";
import { Shield, Database } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6 p-6">
      <UserHeader title="Dashboard" />
      
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
      
      {/* Role-specific content */}
      {user?.role === "admin" && <AdminOnlySection />}
      {user?.role === "manager" && <ManagerSection />}
      {user?.role === "user" && <UserSection />}
    </div>
  );
};

export default Dashboard;
