
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
  
  return (
    <div className="space-y-6 p-6">
      <UserHeader title="Dashboard" />
      
      <StatCards />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <LocationMapCard />
        <DashboardCharts />
      </div>
      
      {/* Role-specific content */}
      {user?.role === "admin" && <AdminSection />}
      {user?.role === "manager" && <ManagerSection />}
      {user?.role === "user" && <UserSection />}
    </div>
  );
};

export default Dashboard;
