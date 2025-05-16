import { useAuth } from "@/contexts/AuthContext";
import { useDashboardTimeframe } from "@/hooks/useDashboardTimeframe";
import { BarChart } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import TimeframeSelector from "@/components/dashboard/TimeframeSelector";
import RoleBasedContent from "@/components/dashboard/RoleBasedContent";
import DashboardTabs from "@/components/dashboard/DashboardTabs";

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

      <DashboardTabs 
        date={date}
        selectedTimeframe={selectedTimeframe}
      />
      
      {/* Role-specific content */}
      <div className="mt-6">
        <RoleBasedContent role={user?.role} />
      </div>
    </div>
  );
};

export default Dashboard;
