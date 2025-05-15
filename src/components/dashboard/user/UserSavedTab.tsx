
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MapPin, MessageSquare, Star } from "lucide-react";

const UserSavedTab = () => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 rounded-md border p-3">
        <div className="bg-amber-50 p-2 rounded-md">
          <MapPin className="h-4 w-4 text-amber-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">Central Park Café</p>
            <Badge variant="outline" className="text-xs">Restaurant</Badge>
          </div>
          <p className="text-sm text-muted-foreground">123 Park Avenue, New York</p>
          <div className="flex items-center mt-1">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <span className="text-xs ml-1">5.0</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button size="icon" variant="ghost">
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          </Button>
          <Button size="icon" variant="ghost">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-3 rounded-md border p-3">
        <div className="bg-blue-50 p-2 rounded-md">
          <MapPin className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="font-medium">Ocean View Hotel</p>
            <Badge variant="outline" className="text-xs">Hotel</Badge>
          </div>
          <p className="text-sm text-muted-foreground">456 Beach Road, Los Angeles</p>
          <div className="flex items-center mt-1">
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            <Star className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs ml-1">4.0</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button size="icon" variant="ghost">
            <Heart className="h-4 w-4 text-red-500 fill-red-500" />
          </Button>
          <Button size="icon" variant="ghost">
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Button variant="outline" className="w-full mt-2">
        View All Saved Locations
      </Button>
    </div>
  );
};

export default UserSavedTab;
