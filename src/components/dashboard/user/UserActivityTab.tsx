
import { Button } from "@/components/ui/button";
import { MapPin, Search, User } from "lucide-react";

const UserActivityTab = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Viewed location details</p>
          <p className="text-sm text-muted-foreground">Central Park Café</p>
          <p className="text-xs text-muted-foreground">5 mins ago</p>
        </div>
        <Button variant="ghost" size="sm">
          <MapPin className="h-4 w-4 mr-1" /> View
        </Button>
      </div>
      
      <div className="flex items-center gap-3 border-b border-border pb-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <Search className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Searched locations</p>
          <p className="text-sm text-muted-foreground">"restaurants near downtown"</p>
          <p className="text-xs text-muted-foreground">Yesterday</p>
        </div>
        <Button variant="ghost" size="sm">
          <Search className="h-4 w-4 mr-1" /> Repeat
        </Button>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <User className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">Updated profile</p>
          <p className="text-sm text-muted-foreground">Changed notification settings</p>
          <p className="text-xs text-muted-foreground">2 days ago</p>
        </div>
        <Button variant="ghost" size="sm">
          <User className="h-4 w-4 mr-1" /> Profile
        </Button>
      </div>
    </div>
  );
};

export default UserActivityTab;
