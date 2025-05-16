
import { Button } from "@/components/ui/button";
import UserHeader from "@/components/UserHeader";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
}

const DashboardHeader = ({
  date,
  setDate,
  selectedTimeframe,
  setSelectedTimeframe
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <UserHeader title="Dashboard" />
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search locations..."
              className="w-full pl-8"
            />
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing data for {selectedTimeframe === "all_time" ? "all time" : selectedTimeframe}
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Export Data</Button>
          <Button variant="outline" size="sm">Print Report</Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
