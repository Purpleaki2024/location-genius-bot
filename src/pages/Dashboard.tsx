
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TimeframeSelector from "@/components/dashboard/TimeframeSelector";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import LocationMapCard from "@/components/dashboard/LocationMapCard";
import StatCards from "@/components/StatCards";
import ChartsSection from "@/components/dashboard/ChartsSection";
import TelegramBotSummary from "@/components/dashboard/TelegramBotSummary";
import RoleBasedContent from "@/components/dashboard/RoleBasedContent";
import { BarChart, CalendarIcon, Clock, Users } from "lucide-react";
import { useDashboardTimeframe } from "@/hooks/useDashboardTimeframe";

const Dashboard = () => {
  const { user } = useAuth();
  const {
    date,
    setDate,
    selectedTimeframe,
    setSelectedTimeframe
  } = useDashboardTimeframe();
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <BarChart className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
        </div>
        <TimeframeSelector
          date={date}
          setDate={setDate}
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={setSelectedTimeframe}
        />
      </div>

      <DashboardHeader 
        date={date}
        setDate={setDate}
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
      />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">
            <BarChart className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Clock className="mr-2 h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="locations">
            <CalendarIcon className="mr-2 h-4 w-4" />
            Locations
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="mr-2 h-4 w-4" />
            Users
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card/30 p-6">
                  <h2 className="text-lg font-semibold mb-4">Performance Overview</h2>
                  <DashboardCharts />
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <LocationMapCard />
              <TelegramBotSummary />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="requests" className="space-y-6">
          <div className="rounded-lg border border-border bg-card/30 p-6">
            <h2 className="text-lg font-semibold mb-4">Request Volume</h2>
            <StatCards />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Request Trends</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <DashboardCharts />
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Request Types</h3>
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-muted-foreground">
                  Request types distribution chart
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="locations" className="space-y-6">
          <div className="rounded-lg border border-border bg-card/30 p-6">
            <ChartsSection />
          </div>
          
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Location Map</h3>
            <div className="h-[400px]">
              <LocationMapCard />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="space-y-6">
                <div className="rounded-lg border border-border bg-card/30 p-6">
                  <h2 className="text-lg font-semibold mb-4">User Activity</h2>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-muted-foreground">
                      User activity chart coming soon
                    </div>
                  </div>
                </div>
                
                <div className="rounded-lg border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Top Active Users</h2>
                  <div className="space-y-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {String.fromCharCode(65 + i)}
                          </div>
                          <div>
                            <div className="font-medium">User {String.fromCharCode(65 + i)}</div>
                            <div className="text-sm text-muted-foreground">user{i}@example.com</div>
                          </div>
                        </div>
                        <div className="text-sm">{100 - i * 12} requests</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">User Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground">Total Users</div>
                    <div className="font-medium">152</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground">Active Today</div>
                    <div className="font-medium">28</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-muted-foreground">New This Week</div>
                    <div className="font-medium">12</div>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">User Types</h2>
                <div className="h-[200px]">
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    User type distribution chart
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg border bg-card p-6">
                <h2 className="text-lg font-semibold mb-4">Retention Rate</h2>
                <div className="flex flex-col items-center justify-center h-[200px]">
                  <div className="text-3xl font-bold">76%</div>
                  <div className="text-muted-foreground text-sm">
                    Weekly retention rate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Role-specific content */}
      <div className="mt-6">
        <RoleBasedContent role={user?.role} />
      </div>
    </div>
  );
};

// Add missing import for ResponsiveContainer 
import { ResponsiveContainer } from "recharts";

export default Dashboard;
