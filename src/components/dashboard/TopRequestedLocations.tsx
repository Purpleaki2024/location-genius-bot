
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
    name: "City Museum",
    address: "750 Art Street, Chicago, IL",
    type: "attraction",
    rating: 4.8,
    searches: 3241,
    trend: "+15%"
  },
  {
    id: "2",
    name: "Riverside Park",
    address: "45 River Road, Boston, MA",
    type: "attraction",
    rating: 4.9,
    searches: 2842,
    trend: "+20%"
  },
  {
    id: "3",
    name: "Central Park Café",
    address: "5th Ave, New York, NY",
    type: "restaurant",
    rating: 4.7,
    searches: 2451,
    trend: "+12%"
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
    name: "Ocean View Hotel",
    address: "123 Beach Road, Miami, FL",
    type: "hotel",
    rating: 4.5,
    searches: 1872,
    trend: "+8%"
  }
];

// Function to get color styles based on location type
const getTypeStyles = (type: string) => {
  switch(type) {
    case "restaurant":
      return {
        bg: "bg-amber-50",
        icon: "bg-amber-100",
        iconColor: "text-amber-500"
      };
    case "hotel":
      return {
        bg: "bg-blue-50",
        icon: "bg-blue-100",
        iconColor: "text-blue-500"
      };
    case "attraction":
      return {
        bg: "bg-purple-50", 
        icon: "bg-purple-100",
        iconColor: "text-purple-500"
      };
    case "shopping":
      return {
        bg: "bg-pink-50",
        icon: "bg-pink-100",
        iconColor: "text-pink-500"
      };
    default:
      return {
        bg: "bg-gray-50",
        icon: "bg-gray-100",
        iconColor: "text-gray-500"
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
              className="rounded-full"
            >
              By Searches
            </Button>
            <Button 
              size="sm" 
              variant={sortBy === "rating" ? "default" : "outline"}
              onClick={() => setSortBy("rating")}
              className="rounded-full"
            >
              By Rating
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedLocations.map((location) => {
            const styles = getTypeStyles(location.type);
            
            return (
              <div 
                key={location.id} 
                className={cn(
                  "rounded-lg p-4 transition-all",
                  styles.bg
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full", styles.icon)}>
                      <MapPin className={cn("h-6 w-6", styles.iconColor)} />
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-lg">
                        {location.name}
                      </h3>
                      <p className="text-muted-foreground">{location.address}</p>
                      
                      <div className="mt-1 flex items-center gap-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500 mr-1" />
                          <span className="text-sm">{(location.rating).toFixed(1)}/5</span>
                        </div>
                        
                        <Badge variant="outline" className="text-xs">
                          {location.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className="text-base font-medium">{location.searches.toLocaleString()} searches</div>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      {location.trend}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          <Button variant="outline" className="w-full flex items-center justify-center py-2 mt-2">
            View All Popular Locations
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopRequestedLocations;
