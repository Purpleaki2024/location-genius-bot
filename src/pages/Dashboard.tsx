
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import StatCards from "@/components/StatCards";
import RoleBasedContent from "@/components/dashboard/RoleBasedContent";
import TelegramBotSummary from "@/components/dashboard/TelegramBotSummary";

const Dashboard = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6 p-6 pb-16">
      <DashboardHeader />
      
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => navigate('/locations')}
            className="flex items-center gap-2"
          >
            <MapPin className="h-4 w-4" />
            User Locations
          </Button>
          <Button 
            onClick={() => navigate('/admin/locations')}
            variant="outline" 
            className="flex items-center gap-2"
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
        
        <DashboardTabs />
      </div>
    </div>
  );
};

export default Dashboard;
