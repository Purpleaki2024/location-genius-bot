
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import AdminSection from "@/components/dashboard/AdminSection";
import ManagerSection from "@/components/dashboard/ManagerSection";
import UserSection from "@/components/dashboard/UserSection";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const RoleBasedContent = () => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  
  const role = user?.role || "user";
  
  const handleViewAll = () => {
    switch (role) {
      case 'admin':
        navigate('/admin/locations');
        break;
      case 'manager':
        navigate('/locations');
        break;
      case 'user':
        navigate('/profile');
        break;
      default:
        toast.info(`View all ${role} content`);
    }
  };
  
  if (!role) return null;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {role === "admin" && "Admin Controls"}
          {role === "manager" && "Operations Center"}
          {role === "user" && "Your Activity"}
        </h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Collapse" : "Expand"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleViewAll}>
            View All
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {expanded && (
        <>
          {role === "admin" && <AdminSection />}
          {role === "manager" && <ManagerSection />}
          {role === "user" && <UserSection />}
        </>
      )}
    </div>
  );
};

export default RoleBasedContent;
