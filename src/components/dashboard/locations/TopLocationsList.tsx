
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, MapPin, Star, Phone, Info, Key } from "lucide-react";
import { TopLocation } from "@/types/locations";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock data with new fields
const mockLocations: TopLocation[] = [
  {
    id: "1",
    name: "London",
    address: "Greater London",
    city: "London",
    state: "England",
    type: "city",
    rating: 4.8,
    searches: 1243,
    percentChange: 12,
    contact: "+44 7123 456789",
    password: "LONDON2023",
    info: "Capital city with numerous attractions"
  },
  {
    id: "2",
    name: "Manchester",
    address: "Greater Manchester",
    city: "Manchester",
    state: "England",
    type: "city",
    rating: 4.5,
    searches: 845,
    percentChange: 8,
    contact: "+44 7234 567890",
    password: "MANC2023",
    info: "Known for football and music scene"
  },
  {
    id: "3",
    name: "Bath",
    address: "Somerset",
    city: "Bath",
    state: "England",
    type: "town",
    rating: 4.7,
    searches: 621,
    percentChange: 15,
    contact: "+44 7345 678901",
    password: "BATH2023",
    info: "Historic Roman baths and Georgian architecture"
  },
  {
    id: "4",
    name: "Bibury",
    address: "Gloucestershire",
    city: "Bibury",
    state: "England",
    type: "village",
    rating: 4.9,
    searches: 410,
    percentChange: 22,
    contact: "+44 7456 789012",
    password: "BIBURY2023",
    info: "Picturesque Cotswold village with historic cottages"
  },
  {
    id: "5",
    name: "SW1A 1AA",
    address: "Westminster, London",
    city: "London",
    state: "England",
    type: "postcode",
    rating: 4.6,
    searches: 380,
    percentChange: 5,
    contact: "+44 7567 890123",
    password: "WESTMINSTER",
    info: "Buckingham Palace area postcode"
  }
];

interface TopLocationsListProps {
  sortBy: "searches" | "rating";
  filterType?: "all" | "city" | "town" | "village" | "postcode";
}

const TopLocationsList = ({ sortBy, filterType = "all" }: TopLocationsListProps) => {
  const [showAll, setShowAll] = useState(false);
  const isMobile = useIsMobile();
  
  // Sort and filter locations
  const sortedAndFilteredLocations = [...mockLocations]
    .filter(location => filterType === "all" || location.type === filterType)
    .sort((a, b) => {
      if (sortBy === "searches") {
        return b.searches - a.searches;
      } else {
        return b.rating - a.rating;
      }
    });
  
  // Display only top 3 unless showAll is true
  const displayLocations = showAll 
    ? sortedAndFilteredLocations 
    : sortedAndFilteredLocations.slice(0, 3);
    
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
    <div className="space-y-4">
      {displayLocations.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayLocations.map((location) => (
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
                      
                      {location.password && (
                        <div className="flex items-center text-sm">
                          <Key className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          <span>Password: {location.password}</span>
                        </div>
                      )}
                      
                      {location.info && (
                        <div className="flex items-center text-sm">
                          <Info className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                          <span>{location.info}</span>
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
                    <Button variant="ghost" size="sm" className="w-full justify-between">
                      View Details <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {sortedAndFilteredLocations.length > 3 && (
            <div className="flex justify-center mt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? "Show Less" : `Show All (${sortedAndFilteredLocations.length})`}
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          No locations found for the selected filter.
        </div>
      )}
    </div>
  );
};

export default TopLocationsList;
