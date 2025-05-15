
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import AdminSection from "@/components/dashboard/AdminSection";
import ManagerSection from "@/components/dashboard/ManagerSection";
import UserSection from "@/components/dashboard/UserSection";

interface RoleBasedContentProps {
  role?: string;
}

const RoleBasedContent = ({ role }: RoleBasedContentProps) => {
  if (!role) return null;
  
  if (role === "admin") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Admin Controls</h2>
          <Button variant="outline" size="sm">
            View All
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <AdminSection />
      </div>
    );
  }
  
  if (role === "manager") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Operations Center</h2>
          <Button variant="outline" size="sm">
            View All
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <ManagerSection />
      </div>
    );
  }
  
  if (role === "user") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Activity</h2>
          <Button variant="outline" size="sm">
            View All
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
        <UserSection />
      </div>
    );
  }
  
  return null;
};

export default RoleBasedContent;
