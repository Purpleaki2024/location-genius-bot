
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import AdminSection from "@/components/dashboard/AdminSection";
import ManagerSection from "@/components/dashboard/ManagerSection";
import UserSection from "@/components/dashboard/UserSection";
import { useAuth } from "@/contexts/AuthContext";

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
        navigate('/locations');
    }
  };
  
  if (!role) return null;
  
  const getSectionTitle = () => {
    switch (role) {
      case "admin":
        return "Admin Controls";
      case "manager":
        return "Operations Center";
      case "user":
        return "Your Activity";
      default:
        return "Dashboard";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {getSectionTitle()}
        </h2>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Expand
              </>
            )}
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
