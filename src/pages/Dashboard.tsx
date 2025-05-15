
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
    <div className="space-y-6 p-6">
      <DashboardHeader 
        date={date}
        setDate={setDate}
        selectedTimeframe={selectedTimeframe}
        setSelectedTimeframe={setSelectedTimeframe}
      />
      
      <StatCards />
      
      <ChartsSection />
      
      {/* Role-specific content */}
      <RoleBasedContent role={user?.role} />
    </div>
  );
};

export default Dashboard;
