
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Star } from "lucide-react";
import { toast } from "sonner";
import { TopLocation } from "@/types/locations";

interface LocationCardProps {
  location: TopLocation;
}

export const getTypeStyles = (type: TopLocation["type"]) => {
  switch(type) {
    case "attraction":
      return {
        bg: "var(--location-attraction-bg)",
        iconBg: "var(--location-attraction-icon-bg)",
      };
    case "restaurant":
      return {
        bg: "var(--location-restaurant-bg)",
        iconBg: "var(--location-restaurant-icon-bg)",
      };
    case "shopping":
      return {
        bg: "var(--location-shopping-bg)",
        iconBg: "var(--location-shopping-icon-bg)",
      };
    case "hotel":
      return {
        bg: "var(--location-hotel-bg)",
        iconBg: "var(--location-hotel-icon-bg)",
      };
    default:
      return {
        bg: "bg-blue-50",
        iconBg: "bg-blue-100",
      };
  }
};

const LocationCard: React.FC<LocationCardProps> = ({ location }) => {
  const styles = getTypeStyles(location.type);
  const navigate = useNavigate();
  
  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for location ${id}`);
    navigate(`/locations/${id}`);
  };
  
  return (
    <div 
      key={location.id}
      className="rounded-lg p-4 location-card"
      style={{ backgroundColor: styles.bg }}
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-full" style={{ backgroundColor: styles.iconBg }}>
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        
        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
            <div>
              <h4 className="font-medium text-lg">{location.name}</h4>
              <p className="text-muted-foreground">
                {location.address}, {location.city}, {location.state}
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end">
              <div className="font-semibold">
                {location.searches.toLocaleString()} searches
              </div>
              <div className="text-green-600 text-sm flex items-center">
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 6L13 14L9 10L3 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 6H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 6V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                +{location.percentChange}%
              </div>
            </div>
          </div>
          
          <div className="flex items-center mt-2 flex-wrap gap-2">
            <div className="flex items-center mr-3">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
              <span>{location.rating}/5</span>
            </div>
            
            <div className="px-2 py-0.5 rounded-full bg-white/60 text-xs">
              {location.type}
            </div>

            <div className="flex-1 flex justify-end">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary hover:text-primary-foreground hover:bg-primary"
                onClick={() => handleViewDetails(location.id)}
              >
                View Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
