
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserStatsTab = () => {
  const { user } = useAuth();
  
  return (
    <>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="border rounded-md p-3">
          <p className="text-sm text-muted-foreground">Locations Viewed</p>
          <p className="text-2xl font-bold">28</p>
          <p className="text-xs text-green-600">+4 this week</p>
        </div>
        <div className="border rounded-md p-3">
          <p className="text-sm text-muted-foreground">Favorites</p>
          <p className="text-2xl font-bold">12</p>
          <p className="text-xs text-green-600">+2 this week</p>
        </div>
        <div className="border rounded-md p-3">
          <p className="text-sm text-muted-foreground">Reviews</p>
          <p className="text-2xl font-bold">7</p>
          <p className="text-xs text-amber-600">No change</p>
        </div>
        <div className="border rounded-md p-3">
          <p className="text-sm text-muted-foreground">Avg. Rating</p>
          <p className="text-2xl font-bold">4.5</p>
          <p className="text-xs text-muted-foreground">Out of 5</p>
        </div>
      </div>
      
      <div className="border rounded-md p-4">
        <h3 className="text-sm font-medium mb-2">Account Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Username</p>
            <p className="text-sm font-medium">{user?.username}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Role</p>
            <p className="text-sm font-medium capitalize">{user?.role}</p>
          </div>
          <div className="flex justify-between">
            <p className="text-sm text-muted-foreground">Member Since</p>
            <p className="text-sm font-medium">May 12, 2025</p>
          </div>
        </div>
        
        <Button variant="outline" className="w-full mt-3" size="sm">
          <User className="h-4 w-4 mr-1" /> Edit Profile
        </Button>
      </div>
    </>
  );
};

export default UserStatsTab;
