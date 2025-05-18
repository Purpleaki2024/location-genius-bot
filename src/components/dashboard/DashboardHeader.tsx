
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import UserHeader from "@/components/UserHeader";
import { Search, Download, Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import TimeframeSelector from "@/components/dashboard/TimeframeSelector";
import SettingsPanel from "@/components/settings/SettingsPanel";
import { toast } from "sonner";

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
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for: ${searchQuery}`);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };
  
  const handleExportData = () => {
    toast.success("Report exported to CSV");
    // Logic to export data to CSV would go here
    const blob = new Blob(["Dashboard Report"], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  const handlePrintReport = () => {
    toast.success("Preparing print version...");
    setTimeout(() => window.print(), 100);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <UserHeader title="Dashboard" />
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search locations..."
              className="w-full pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          <SettingsPanel />
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <TimeframeSelector
          date={date}
          setDate={setDate}
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={setSelectedTimeframe}
        />
        
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportData}
            className="flex items-center"
          >
            <Download className="mr-1 h-4 w-4" />
            Export
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handlePrintReport}
            className="flex items-center"
          >
            <Printer className="mr-1 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
