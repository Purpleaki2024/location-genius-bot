
import { useState } from "react";
import ChartsSection from "@/components/dashboard/ChartsSection";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { MapPin, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const LocationsTabContent = () => {
  const [viewMode, setViewMode] = useState<"searches" | "rating">("searches");
  const isMobile = useIsMobile();

  return (
    <>
      <div className="rounded-lg border border-border bg-card/30 p-6">
        <ChartsSection />
      </div>
      
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="rounded-lg border border-border bg-card/30 p-6">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Top Requested Locations</h3>
                <p className="text-muted-foreground">
                  Most popular locations searched by users
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => setViewMode("searches")}
                  variant={viewMode === "searches" ? "default" : "outline"}
                  className="rounded-full px-6 py-2"
                >
                  By Searches
                </Button>
                <Button 
                  onClick={() => setViewMode("rating")}
                  variant={viewMode === "rating" ? "default" : "outline"}
                  className="rounded-full px-6 py-2"
                >
                  By Rating
                </Button>
              </div>
            </div>
            
            {viewMode === "searches" && <TopLocationsList />}
            {viewMode === "rating" && <TopLocationsList sortBy="rating" />}
          </div>
        </div>
      </div>
    </>
  );
};

interface TopLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  type: "attraction" | "restaurant" | "hotel" | "shopping";
  rating: number;
  searches: number;
  percentChange: number;
}

const mockLocations: TopLocation[] = [
  {
    id: "1",
    name: "City Museum",
    address: "750 Art Street",
    city: "Chicago",
    state: "IL",
    type: "attraction",
    rating: 4.8,
    searches: 3241,
    percentChange: 7,
  },
  {
    id: "2",
    name: "Riverside Park",
    address: "45 River Road",
    city: "Boston",
    state: "MA",
    type: "attraction",
    rating: 4.9,
    searches: 2842,
    percentChange: 16,
  },
  {
    id: "3",
    name: "Central Park Café",
    address: "5th Ave",
    city: "New York",
    state: "NY",
    type: "restaurant",
    rating: 4.7,
    searches: 2451,
    percentChange: 14,
  },
  {
    id: "4",
    name: "Downtown Mall",
    address: "100 Shopping Lane",
    city: "Los Angeles",
    state: "CA",
    type: "shopping",
    rating: 4.2,
    searches: 1952,
    percentChange: 9,
  },
  {
    id: "5",
    name: "Ocean View Hotel",
    address: "123 Beach Road",
    city: "Miami",
    state: "FL",
    type: "hotel",
    rating: 4.5,
    searches: 1872,
    percentChange: 10,
  }
];

interface TopLocationsListProps {
  sortBy?: "searches" | "rating";
}

const TopLocationsList = ({ sortBy = "searches" }: TopLocationsListProps) => {
  const sortedLocations = [...mockLocations].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    return b.searches - a.searches;
  });
  
  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for location ${id}`);
    // In a real app, this would navigate to location details
  };
  
  const getTypeStyles = (type: TopLocation["type"]) => {
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
  
  const handleViewAll = () => {
    toast.info("Viewing all locations");
    // In a real app, this would navigate to locations list
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {sortedLocations.map(location => {
          const styles = getTypeStyles(location.type);
          
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
        })}
      </div>
      
      <Button 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={handleViewAll}
      >
        View All Popular Locations
        <ArrowRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default LocationsTabContent;
