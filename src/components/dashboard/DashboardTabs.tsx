
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, CalendarIcon, Clock, Users, TrendingUp } from "lucide-react";
import OverviewTabContent from "@/components/dashboard/tabs/OverviewTabContent";
import RequestsTabContent from "@/components/dashboard/tabs/RequestsTabContent";
import LocationsTabContent from "@/components/dashboard/tabs/LocationsTabContent";
import UsersTabContent from "@/components/dashboard/tabs/UsersTabContent";
import AnalyticsTabContent from "@/components/dashboard/tabs/AnalyticsTabContent";

interface DashboardTabsProps {
  date?: Date;
  selectedTimeframe: string;
}

const DashboardTabs = ({ date, selectedTimeframe }: DashboardTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList>
        <TabsTrigger value="overview">
          <BarChart className="mr-2 h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="analytics">
          <TrendingUp className="mr-2 h-4 w-4" />
          Analytics
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
        <OverviewTabContent />
      </TabsContent>
      
      <TabsContent value="analytics" className="space-y-6">
        <AnalyticsTabContent />
      </TabsContent>
      
      <TabsContent value="requests" className="space-y-6">
        <RequestsTabContent />
      </TabsContent>
      
      <TabsContent value="locations" className="space-y-6">
        <LocationsTabContent />
      </TabsContent>
      
      <TabsContent value="users" className="space-y-6">
        <UsersTabContent />
      </TabsContent>
    </Tabs>
  );
};

export default DashboardTabs;
