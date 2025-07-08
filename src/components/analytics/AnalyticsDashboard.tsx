
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserActivityChart from "./UserActivityChart";
import LocationSearchChart from "./LocationSearchChart";
import BotPerformanceChart from "./BotPerformanceChart";
import { Activity, Search, Zap, TrendingUp } from "lucide-react";

const AnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor bot performance, user engagement, and location search patterns
        </p>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="mr-2 h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="users">
            <Activity className="mr-2 h-4 w-4" />
            User Activity
          </TabsTrigger>
          <TabsTrigger value="searches">
            <Search className="mr-2 h-4 w-4" />
            Location Searches
          </TabsTrigger>
          <TabsTrigger value="performance">
            <Zap className="mr-2 h-4 w-4" />
            Bot Performance
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Users
                </CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Loading...</div>
                <p className="text-xs text-muted-foreground">
                  Registered bot users
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Daily Searches
                </CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Loading...</div>
                <p className="text-xs text-muted-foreground">
                  Location searches today
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Success Rate
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Loading...</div>
                <p className="text-xs text-muted-foreground">
                  Bot response success rate
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <UserActivityChart />
            <BotPerformanceChart />
          </div>
        </TabsContent>
        
        <TabsContent value="users">
          <UserActivityChart />
        </TabsContent>
        
        <TabsContent value="searches">
          <LocationSearchChart />
        </TabsContent>
        
        <TabsContent value="performance">
          <BotPerformanceChart />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
