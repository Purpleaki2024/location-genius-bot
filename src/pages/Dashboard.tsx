
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import StatCards from "@/components/StatCards";
import RoleBasedContent from "@/components/dashboard/RoleBasedContent";
import TelegramBotSummary from "@/components/dashboard/TelegramBotSummary";
import { useDashboardTimeframe } from "@/hooks/useDashboardTimeframe";
import { useIsMobile } from "@/hooks/use-mobile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { date, setDate, selectedTimeframe, setSelectedTimeframe } = useDashboardTimeframe();
  const isMobile = useIsMobile();
  
  const handleUserLocations = () => {
    navigate('/locations');
  };
  
  const handleAdminLocations = () => {
    navigate('/admin/locations');
  };
  
  return (
    <div className={`space-y-6 ${isMobile ? 'p-4' : 'p-6'} pb-16`}>
      <DashboardHeader 
        date={date}
        setDate={setDate}
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
      />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            onClick={handleUserLocations}
            className="flex items-center gap-2 flex-1 sm:flex-none justify-center sm:justify-start"
            size={isMobile ? "sm" : "default"}
          >
            <MapPin className="h-4 w-4" />
            User Locations
          </Button>
          <Button 
            onClick={handleAdminLocations}
            variant="outline" 
            className="flex items-center gap-2 flex-1 sm:flex-none justify-center sm:justify-start"
            size={isMobile ? "sm" : "default"}
          >
            <MapPin className="h-4 w-4" />
            Admin Locations
          </Button>
        </div>
      </div>
      
      <StatCards />
      
      <div className="grid grid-cols-1 gap-6">
        <TelegramBotSummary />
        
        <RoleBasedContent />
        
        <DashboardTabs 
          date={date}
          selectedTimeframe={selectedTimeframe}
        />
      </div>
    </div>
  );
};

export default Dashboard;
