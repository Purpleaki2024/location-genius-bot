
import { useState } from "react";
import ChartsSection from "@/components/dashboard/ChartsSection";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

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
            <div>
              <h3 className="text-2xl font-bold">Top Requested Locations</h3>
              <p className="text-muted-foreground">
                Most popular locations searched by users
              </p>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
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
  iconColor: string;
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
    iconColor: "bg-purple-100",
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
    iconColor: "bg-purple-100",
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
    iconColor: "bg-amber-100",
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
    iconColor: "bg-pink-100",
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
    iconColor: "bg-blue-100",
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
  
  const getTypeLabel = (type: TopLocation["type"]) => {
    switch(type) {
      case "attraction": return "attraction";
      case "restaurant": return "restaurant";
      case "hotel": return "hotel";
      case "shopping": return "shopping";
      default: return type;
    }
  };
  
  return (
    <div className="space-y-4">
      {sortedLocations.map(location => {
        const isPurple = location.type === "attraction";
        const isAmber = location.type === "restaurant";
        const isPink = location.type === "shopping";
        
        let bgColor = "bg-blue-50";
        let iconBgColor = "bg-blue-100";
        
        if (isPurple) {
          bgColor = "bg-purple-50";
          iconBgColor = "bg-purple-100";
        } else if (isAmber) {
          bgColor = "bg-amber-50";
          iconBgColor = "bg-amber-100";
        } else if (isPink) {
          bgColor = "bg-pink-50";
          iconBgColor = "bg-pink-100";
        }
        
        return (
          <div 
            key={location.id}
            className={`rounded-lg p-4 ${bgColor}`}
          >
            <div className="flex items-center gap-4">
              <div className={`${iconBgColor} p-3 rounded-full`}>
                <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 12 2 12 2C12 2 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="14" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                  <div>
                    <h4 className="font-medium text-lg">{location.name}</h4>
                    <p className="text-muted-foreground">
                      {location.address}, {location.city}, {location.state}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-end">
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
                
                <div className="flex items-center mt-2">
                  <div className="flex items-center mr-3">
                    <svg className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                    </svg>
                    <span>{location.rating}/5</span>
                  </div>
                  
                  <div className="px-2 py-0.5 rounded-full bg-white/50 text-xs">
                    {getTypeLabel(location.type)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LocationsTabContent;
