
import { useState } from "react";
import ChartsSection from "@/components/dashboard/ChartsSection";
import TopRequestedLocations from "@/components/dashboard/TopRequestedLocations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold">Top Requested Locations</h3>
              <p className="text-muted-foreground">
                Most popular locations searched by users
              </p>
            </div>
            
            <Tabs defaultValue="searches" className="w-full" onValueChange={(val) => setViewMode(val as "searches" | "rating")}>
              <TabsList className="mb-6">
                <TabsTrigger value="searches" className={`${viewMode === "searches" ? "bg-primary text-primary-foreground" : ""} flex-1`}>
                  By Searches
                </TabsTrigger>
                <TabsTrigger value="rating" className={`${viewMode === "rating" ? "bg-primary text-primary-foreground" : ""} flex-1`}>
                  By Rating
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="searches" className="space-y-4">
                <TopLocationsListMobile />
              </TabsContent>
              
              <TabsContent value="rating" className="space-y-4">
                <TopLocationsListMobile sortBy="rating" />
              </TabsContent>
            </Tabs>
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
    percentChange: 20,
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
    percentChange: 18,
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
    percentChange: 16,
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
    percentChange: 15,
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

interface TopLocationsListMobileProps {
  sortBy?: "searches" | "rating";
}

const TopLocationsListMobile = ({ sortBy = "searches" }: TopLocationsListMobileProps) => {
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
      {sortedLocations.map(location => (
        <div 
          key={location.id}
          className="flex flex-row items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
        >
          <div className={`${location.iconColor} p-3 rounded-full flex-shrink-0`}>
            <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C16.4183 22 20 18.4183 20 14C20 9.58172 12 2 12 2C12 2 4 9.58172 4 14C4 18.4183 7.58172 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="14" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
              <h4 className="font-medium text-base">{location.name}</h4>
              <div className="flex items-center gap-2 text-sm">
                <span className={`${location.percentChange > 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
                  {location.percentChange > 0 ? '↑' : '↓'} {Math.abs(location.percentChange)}%
                </span>
              </div>
            </div>
            
            <div className="text-muted-foreground text-sm">
              {location.address}, {location.city}, {location.state}
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                </svg>
                <span>{location.rating}/5</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                  {getTypeLabel(location.type)}
                </span>
              </div>
              
              <div className="font-medium">
                {location.searches.toLocaleString()} 
                <span className="text-xs text-muted-foreground ml-1">searches</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LocationsTabContent;
