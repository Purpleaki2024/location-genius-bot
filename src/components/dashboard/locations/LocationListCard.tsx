
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin, Star, Phone, Key } from "lucide-react";
import { TopLocation } from "@/types/locations";
import { toast } from "sonner";

interface LocationListCardProps {
  location: TopLocation;
}

const LocationListCard = ({ location }: LocationListCardProps) => {
  const navigate = useNavigate();

  const handleViewDetails = (locationId: string) => {
    toast.info(`Viewing location details for ID: ${locationId}`);
    navigate(`/locations/${locationId}`);
  };

  // Get appropriate color for each location type
  const getLocationTypeColor = (type: string) => {
    switch (type) {
      case "city":
        return "bg-blue-500";
      case "town":
        return "bg-green-500";
      case "village":
        return "bg-amber-500";
      case "postcode":
        return "bg-purple-500";
      case "attraction":
        return "bg-pink-500";
      case "restaurant":
        return "bg-orange-500";
      case "hotel":
        return "bg-indigo-500";
      case "shopping":
        return "bg-red-500";
      default:
        return "bg-slate-500";
    }
  };
  
  // Format location type for display
  const formatLocationType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card key={location.id} className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-lg">{location.name}</h4>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{location.address}</span>
              </div>
            </div>
            <Badge className={getLocationTypeColor(location.type)}>
              {formatLocationType(location.type)}
            </Badge>
          </div>
          
          <div className="mt-4 space-y-2">
            {location.contact && (
              <div className="flex items-center text-sm">
                <Phone className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <span>{location.contact}</span>
              </div>
            )}
          </div>
          
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="ml-1 font-medium">{location.rating.toFixed(1)}</span>
            </div>
            
            <div>
              <span className="font-medium">{location.searches}</span>
              <span className="text-sm text-muted-foreground ml-1">searches</span>
            </div>
          </div>
        </div>
        
        <div className="border-t p-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between"
            onClick={() => handleViewDetails(location.id)}
          >
            View Details <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationListCard;
