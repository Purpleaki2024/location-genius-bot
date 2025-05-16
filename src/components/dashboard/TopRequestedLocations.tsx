
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Star, TrendingUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocations } from "@/hooks/use-locations";

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
  const [sortBy, setSortBy] = useState<"visits" | "rating">("visits");
  const { locations = [] } = useLocations();
  
  // Sort locations based on selected criteria
  const sortedLocations = [...(locations || [])].sort((a, b) => {
    if (sortBy === "visits") {
      return b.visits - a.visits;
    } else {
      return b.rating - a.rating;
    }
  }).slice(0, 5);

  // If we don't have real locations, use sample data
  const displayLocations = sortedLocations.length > 0 ? sortedLocations : [
    {
      id: "1",
      name: "London City Museum",
      address: "750 Art Street, London, UK",
      type: "attraction",
      rating: 4.8,
      visits: 3241,
      description: null,
      created_at: "",
      updated_at: "",
      created_by: "",
      active: true,
      lat: 0,
      lng: 0
    },
    {
      id: "2",
      name: "Manchester Park",
      address: "45 River Road, Manchester, UK",
      type: "attraction",
      rating: 4.9,
      visits: 2842,
      description: null,
      created_at: "",
      updated_at: "",
      created_by: "",
      active: true,
      lat: 0,
      lng: 0
    },
    {
      id: "3",
      name: "Birmingham Café",
      address: "5th Ave, Birmingham, UK",
      type: "restaurant",
      rating: 4.7,
      visits: 2451,
      description: null,
      created_at: "",
      updated_at: "",
      created_by: "",
      active: true,
      lat: 0,
      lng: 0
    }
  ];

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
              variant={sortBy === "visits" ? "default" : "outline"}
              onClick={() => setSortBy("visits")}
              className="rounded-full"
            >
              By Visits
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
          {displayLocations.map((location) => {
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
                    <div className="text-base font-medium">{location.visits.toLocaleString()} visits</div>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +{Math.floor(Math.random() * 20) + 5}%
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
