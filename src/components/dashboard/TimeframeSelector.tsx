
import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format, isSameDay } from "date-fns";
import { Calendar as CalendarIcon, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface TimeframeSelectorProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
}

const TimeframeSelector = ({
  date,
  setDate,
  selectedTimeframe,
  setSelectedTimeframe
}: TimeframeSelectorProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
    <div className="flex flex-wrap gap-2 items-center">
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
  );
};

export default TimeframeSelector;
