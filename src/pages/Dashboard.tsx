
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, RefreshCw } from "lucide-react";

import UserHeader from "@/components/UserHeader";
import StatCards from "@/components/StatCards";
import { useAuth } from "@/contexts/AuthContext";

// Import refactored components
import AdminSection from "@/components/dashboard/AdminSection";
import ManagerSection from "@/components/dashboard/ManagerSection";
import UserSection from "@/components/dashboard/UserSection";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import LocationMapCard from "@/components/dashboard/LocationMapCard";

const Dashboard = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  
  const refreshData = () => {
    // In a real app, this would refresh the dashboard data
    console.log("Refreshing dashboard data...");
  };
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <UserHeader title="Dashboard" />
        
        <div className="flex flex-wrap gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Select 
            value={selectedTimeframe} 
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      
      <StatCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LocationMapCard />
        <DashboardCharts />
      </div>
      
      {/* Role-specific content */}
      {user?.role === "admin" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Admin Controls</h2>
            <Button variant="outline" size="sm">
              View All
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <AdminSection />
        </div>
      )}
      
      {user?.role === "manager" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Operations Center</h2>
            <Button variant="outline" size="sm">
              View All
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <ManagerSection />
        </div>
      )}
      
      {user?.role === "user" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Activity</h2>
            <Button variant="outline" size="sm">
              View All
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <UserSection />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
