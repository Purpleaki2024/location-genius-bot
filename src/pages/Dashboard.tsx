
import { useState, useEffect } from "react";
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
import { format, subDays, subWeeks, subMonths, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown, RefreshCw, Filter } from "lucide-react";

import UserHeader from "@/components/UserHeader";
import StatCards from "@/components/StatCards";
import { useAuth } from "@/contexts/AuthContext";

// Import refactored components
import AdminSection from "@/components/dashboard/AdminSection";
import ManagerSection from "@/components/dashboard/ManagerSection";
import UserSection from "@/components/dashboard/UserSection";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import LocationMapCard from "@/components/dashboard/LocationMapCard";
import TelegramBotConfig from "@/components/TelegramBotConfig";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Dashboard = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Effect to update date based on timeframe selection
  useEffect(() => {
    const today = new Date();
    
    switch (selectedTimeframe) {
      case "today":
        setDate(today);
        break;
      case "yesterday":
        setDate(subDays(today, 1));
        break;
      case "this_week":
        // Keep current date but update UI
        break;
      case "last_week":
        setDate(subWeeks(today, 1));
        break;
      case "this_month":
        // Keep current date but update UI
        break;
      case "last_month":
        setDate(subMonths(today, 1));
        break;
      default:
        // Don't change the date for custom or all_time
        break;
    }
  }, [selectedTimeframe]);
  
  const refreshData = () => {
    // In a real app, this would refresh the dashboard data
    setIsRefreshing(true);
    toast.info("Refreshing dashboard data...");
    
    setTimeout(() => {
      setIsRefreshing(false);
      toast.success("Dashboard data refreshed!");
    }, 1000);
  };
  
  const getTimeframeLabel = () => {
    switch (selectedTimeframe) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "this_week":
        return "This Week";
      case "last_week":
        return "Last Week";
      case "this_month":
        return "This Month";
      case "last_month":
        return "Last Month";
      case "all_time":
        return "All Time";
      default:
        return date ? format(date, "PPP") : "Custom Date";
    }
  };
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <UserHeader title="Dashboard" />
        
        <div className="flex flex-wrap gap-2 items-center">
          <TelegramBotConfig />
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {getTimeframeLabel()}
                {selectedTimeframe === "custom" && date && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {format(date, "PP")}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  if (newDate && !isSameDay(newDate, new Date())) {
                    setSelectedTimeframe("custom");
                  }
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Select 
            value={selectedTimeframe} 
            onValueChange={setSelectedTimeframe}
          >
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="yesterday">Yesterday</SelectItem>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="last_week">Last Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="all_time">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshData} 
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
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
