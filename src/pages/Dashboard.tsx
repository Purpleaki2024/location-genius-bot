
import { useAuth } from "@/contexts/AuthContext";
import StatCards from "@/components/StatCards";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ChartsSection from "@/components/dashboard/ChartsSection";
import RoleBasedContent from "@/components/dashboard/RoleBasedContent";
import { useDashboardTimeframe } from "@/hooks/useDashboardTimeframe";

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    date, 
    setDate, 
    selectedTimeframe, 
    setSelectedTimeframe 
  } = useDashboardTimeframe();
  
  return (
    <div className="space-y-8 p-6">
      <DashboardHeader 
        date={date}
        setDate={setDate}
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
      />
      
      <div className="rounded-lg border border-border bg-card/30 p-6">
        <h2 className="text-lg font-semibold mb-4">System Overview</h2>
        <StatCards />
      </div>
      
      <ChartsSection />
      
      {/* Role-specific content */}
      <RoleBasedContent role={user?.role} />
    </div>
  );
};

export default Dashboard;
