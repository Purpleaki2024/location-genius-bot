
import { useAuth } from "@/contexts/AuthContext";
import StatCards from "@/components/StatCards";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ChartsSection from "@/components/dashboard/ChartsSection";
import RoleBasedContent from "@/components/dashboard/RoleBasedContent";
import { useDashboardTimeframe } from "@/hooks/useDashboardTimeframe";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Users, BarChart } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    date, 
    setDate, 
    selectedTimeframe, 
    setSelectedTimeframe 
  } = useDashboardTimeframe();
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
        </div>
        
        <DashboardHeader 
          date={date}
          setDate={setDate}
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={setSelectedTimeframe}
        />
      </div>
      
      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Requests</span>
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>Locations</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="requests" className="space-y-6">
          <div className="rounded-lg border border-border bg-card/30 p-6">
            <h2 className="text-lg font-semibold mb-4">Request Volume</h2>
            <div className="h-[350px]">
              <StatCards />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Requests</h3>
              <p className="text-3xl font-bold text-blue-500">1,245</p>
              <p className="text-sm text-green-600 mt-1">+12% from last week</p>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg. Response Time</h3>
              <p className="text-3xl font-bold text-green-500">1.2s</p>
              <p className="text-sm text-green-600 mt-1">-0.3s from last week</p>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Success Rate</h3>
              <p className="text-3xl font-bold text-amber-500">98.3%</p>
              <p className="text-sm text-green-600 mt-1">+1.2% from last week</p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="locations" className="space-y-6">
          <div className="rounded-lg border border-border bg-card/30 p-6">
            <h2 className="text-lg font-semibold mb-4">Location Popularity</h2>
            <div className="h-[350px]">
              <ChartsSection />
            </div>
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Top Locations</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Location</th>
                    <th className="text-left py-3 px-4 font-medium">Requests</th>
                    <th className="text-left py-3 px-4 font-medium">Success Rate</th>
                    <th className="text-left py-3 px-4 font-medium">Avg. Response Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">London</td>
                    <td className="py-3 px-4">420</td>
                    <td className="py-3 px-4">98.2%</td>
                    <td className="py-3 px-4">1.03s</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">Manchester</td>
                    <td className="py-3 px-4">380</td>
                    <td className="py-3 px-4">97.8%</td>
                    <td className="py-3 px-4">2.29s</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">Birmingham</td>
                    <td className="py-3 px-4">310</td>
                    <td className="py-3 px-4">98.5%</td>
                    <td className="py-3 px-4">0.81s</td>
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">Leeds</td>
                    <td className="py-3 px-4">275</td>
                    <td className="py-3 px-4">99.1%</td>
                    <td className="py-3 px-4">0.93s</td>
                  </tr>
                  <tr className="hover:bg-muted/50">
                    <td className="py-3 px-4">Liverpool</td>
                    <td className="py-3 px-4">260</td>
                    <td className="py-3 px-4">98.7%</td>
                    <td className="py-3 px-4">2.34s</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-blue-500 mr-2" />
                <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
              </div>
              <p className="text-3xl font-bold text-blue-500">3,452</p>
              <p className="text-sm text-green-600 mt-1">+86 from last week</p>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 text-green-500 mr-2" />
                <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
              </div>
              <p className="text-3xl font-bold text-green-500">1,845</p>
              <p className="text-sm text-muted-foreground mt-1">53% of total users</p>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center mb-2">
                <BarChart className="h-5 w-5 text-amber-500 mr-2" />
                <h3 className="text-sm font-medium text-muted-foreground">Avg. Requests / User</h3>
              </div>
              <p className="text-3xl font-bold text-amber-500">4.2</p>
              <p className="text-sm text-green-600 mt-1">+0.3 from last week</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">User Types</h2>
              <div className="h-[200px]">
                {/* Placeholder for pie chart */}
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  User type distribution chart
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-purple-500 mr-2"></div>
                  <span className="text-sm">Regular Users: 65%</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-sm">Premium Users: 25%</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-amber-500 mr-2"></div>
                  <span className="text-sm">New Users: 10%</span>
                </div>
              </div>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <h2 className="text-lg font-semibold mb-4">Top Users</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium">User</th>
                      <th className="text-left py-2 px-4 font-medium">Requests</th>
                      <th className="text-left py-2 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">John Doe</td>
                      <td className="py-2 px-4">245</td>
                      <td className="py-2 px-4"><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">active</span></td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">Jane Smith</td>
                      <td className="py-2 px-4">198</td>
                      <td className="py-2 px-4"><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">active</span></td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">Robert Johnson</td>
                      <td className="py-2 px-4">176</td>
                      <td className="py-2 px-4"><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">active</span></td>
                    </tr>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="py-2 px-4">Emily Davis</td>
                      <td className="py-2 px-4">152</td>
                      <td className="py-2 px-4"><span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">inactive</span></td>
                    </tr>
                    <tr className="hover:bg-muted/50">
                      <td className="py-2 px-4">Michael Wilson</td>
                      <td className="py-2 px-4">134</td>
                      <td className="py-2 px-4"><span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">active</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Role-specific content */}
      <RoleBasedContent role={user?.role} />
    </div>
  );
};

export default Dashboard;
