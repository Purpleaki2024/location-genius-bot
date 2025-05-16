
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, TrendingUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample data for popular locations
const popularLocations = [
  {
    id: "1",
    name: "Central Park Café",
    address: "5th Ave, New York, NY",
    type: "restaurant",
    rating: 4.7,
    searches: 2451,
    trend: "+12%"
  },
  {
    id: "2",
    name: "Ocean View Hotel",
    address: "123 Beach Road, Miami, FL",
    type: "hotel",
    rating: 4.5,
    searches: 1872,
    trend: "+8%"
  },
  {
    id: "3",
    name: "City Museum",
    address: "750 Art Street, Chicago, IL",
    type: "attraction",
    rating: 4.8,
    searches: 3241,
    trend: "+15%"
  },
  {
    id: "4",
    name: "Downtown Mall",
    address: "100 Shopping Lane, Los Angeles, CA",
    type: "shopping",
    rating: 4.2,
    searches: 1952,
    trend: "+5%"
  },
  {
    id: "5",
    name: "Riverside Park",
    address: "45 River Road, Boston, MA",
    type: "attraction",
    rating: 4.9,
    searches: 2842,
    trend: "+20%"
  }
];

// Function to get color styles based on location type
const getTypeStyles = (type: string) => {
  switch(type) {
    case "restaurant":
      return {
        bg: "bg-amber-100/60",
        text: "text-amber-900",
        border: "border-amber-200",
        icon: "bg-amber-500"
      };
    case "hotel":
      return {
        bg: "bg-blue-100/60",
        text: "text-blue-900",
        border: "border-blue-200",
        icon: "bg-blue-500"
      };
    case "attraction":
      return {
        bg: "bg-purple-100/60", 
        text: "text-purple-900",
        border: "border-purple-200",
        icon: "bg-purple-500"
      };
    case "shopping":
      return {
        bg: "bg-pink-100/60",
        text: "text-pink-900",
        border: "border-pink-200",
        icon: "bg-pink-500"
      };
    default:
      return {
        bg: "bg-gray-100/60",
        text: "text-gray-900",
        border: "border-gray-200",
        icon: "bg-gray-500"
      };
  }
};

const TopRequestedLocations = () => {
  const [sortBy, setSortBy] = useState<"searches" | "rating">("searches");
  
  // Sort locations based on selected criteria
  const sortedLocations = [...popularLocations].sort((a, b) => {
    if (sortBy === "searches") {
      return b.searches - a.searches;
    } else {
      return b.rating - a.rating;
    }
  });

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl">Top Requested Locations</CardTitle>
            <CardDescription>Most popular locations searched by users</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant={sortBy === "searches" ? "default" : "outline"}
              onClick={() => setSortBy("searches")}
            >
              By Searches
            </Button>
            <Button 
              size="sm" 
              variant={sortBy === "rating" ? "default" : "outline"}
              onClick={() => setSortBy("rating")}
            >
              By Rating
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedLocations.slice(0, 5).map((location, index) => {
            const styles = getTypeStyles(location.type);
            
            return (
              <div 
                key={location.id} 
                className={cn(
                  "group rounded-lg p-3 transition-all hover:shadow-md relative overflow-hidden",
                  styles.bg,
                  styles.border
                )}
              >
                <div className="absolute top-0 left-0 h-full w-1 opacity-70" style={{ backgroundColor: `var(--${location.type}-color, #9b87f5)` }} />
                
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white", styles.icon)}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    
                    <div>
                      <h3 className={cn("font-medium leading-tight group-hover:underline", styles.text)}>
                        {location.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{location.address}</p>
                      
                      <div className="mt-1 flex items-center gap-3">
                        <div className="flex items-center">
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 mr-1" />
                          <span className="text-xs font-medium">{location.rating}/5</span>
                        </div>
                        
                        <Badge variant="outline" className="text-xs px-1.5 py-0">
                          {location.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-sm font-medium">{location.searches.toLocaleString()} searches</div>
                    <div className="flex items-center text-xs text-green-600">
                      <TrendingUp className="h-3 w-3 mr-0.5" />
                      {location.trend}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <Button variant="outline" className="w-full" size="sm">
            View All Popular Locations
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopRequestedLocations;
