
import { useState } from "react";
import LocationMap from "@/components/LocationMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Filter, MapPin, Star } from "lucide-react";
import { cn } from "@/lib/utils";

// Enhanced location data
const locationData = [
  {
    id: "1",
    name: "Central Park Café",
    lat: 40.7812,
    lng: -73.9665,
    rating: 4.7,
    type: "restaurant",
    description: "Popular café with outdoor seating and scenic views",
    visits: 2451
  },
  {
    id: "2",
    name: "Ocean View Hotel",
    lat: 40.7609,
    lng: -73.9845,
    rating: 4.5,
    type: "hotel",
    description: "Luxury hotel with panoramic city views",
    visits: 1872
  },
  {
    id: "3",
    name: "City Museum",
    lat: 40.7789,
    lng: -73.9675,
    rating: 4.8,
    type: "attraction",
    description: "Cultural landmark with interactive exhibitions",
    visits: 3241
  },
  {
    id: "4",
    name: "Downtown Mall",
    lat: 40.7730,
    lng: -73.9787,
    rating: 4.2,
    type: "shopping",
    description: "Modern shopping center with various retail options",
    visits: 1952
  },
  {
    id: "5",
    name: "Riverside Park",
    lat: 40.7850,
    lng: -73.9750,
    rating: 4.9,
    type: "attraction",
    description: "Beautiful park along the river with walking trails",
    visits: 2842
  },
  {
    id: "6",
    name: "Tech Hub Coworking",
    lat: 40.7790,
    lng: -73.9710,
    rating: 4.6,
    type: "other",
    description: "Modern coworking space with tech facilities",
    visits: 1245
  },
  {
    id: "7",
    name: "Gourmet Bistro",
    lat: 40.7710,
    lng: -73.9690,
    rating: 4.7,
    type: "restaurant",
    description: "Fine dining establishment with excellent cuisine",
    visits: 2130
  }
];

const LocationMapCard = () => {
  const [filterType, setFilterType] = useState<string>("all");
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>("name");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Filter locations based on selected criteria
  const filteredLocations = locationData
    .filter(loc => filterType === "all" ? true : loc.type === filterType)
    .filter(loc => loc.rating >= minRating)
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "visits") return b.visits - a.visits;
      return 0;
    });
  
  const getTypeColor = (type: string) => {
    switch(type) {
      case "restaurant": return "bg-amber-100 text-amber-800";
      case "hotel": return "bg-blue-100 text-blue-800";
      case "attraction": return "bg-green-100 text-green-800";
      case "shopping": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Location Map</CardTitle>
            <CardDescription>
              Top rated locations in the database
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[110px] h-8">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="restaurant">Restaurants</SelectItem>
                <SelectItem value="hotel">Hotels</SelectItem>
                <SelectItem value="attraction">Attractions</SelectItem>
                <SelectItem value="shopping">Shopping</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {showFilters && (
          <div className="pt-3 space-y-3 border-t mt-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Minimum Rating</span>
                <span className="text-sm">{minRating} stars</span>
              </div>
              <Slider 
                value={[minRating]} 
                min={0} 
                max={5} 
                step={0.5} 
                onValueChange={(value) => setMinRating(value[0])} 
              />
            </div>
            
            <div>
              <span className="text-sm font-medium block mb-2">Sort By</span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={sortBy === "name" ? "default" : "outline"}
                  onClick={() => setSortBy("name")}
                >
                  Name
                </Button>
                <Button 
                  size="sm" 
                  variant={sortBy === "rating" ? "default" : "outline"}
                  onClick={() => setSortBy("rating")}
                >
                  Rating
                </Button>
                <Button 
                  size="sm" 
                  variant={sortBy === "visits" ? "default" : "outline"}
                  onClick={() => setSortBy("visits")}
                >
                  Visits
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <LocationMap locations={filteredLocations} height="280px" />
        <div className="mt-3 space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">Locations: {filteredLocations.length}</p>
            {filteredLocations.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Avg. rating: {(filteredLocations.reduce((sum, loc) => sum + loc.rating, 0) / filteredLocations.length).toFixed(1)}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredLocations.slice(0, 2).map(loc => (
              <div key={loc.id} className="rounded-md border p-2 text-sm hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{loc.name}</div>
                  <Badge variant="outline" className={cn("text-xs", getTypeColor(loc.type))}>
                    {loc.type}
                  </Badge>
                </div>
                <div className="text-muted-foreground text-xs mt-1">{loc.description}</div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="ml-1 text-xs">{loc.rating}/5</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 mr-1" />
                    {loc.visits.toLocaleString()} visits
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filteredLocations.length > 2 && (
            <Button variant="outline" className="w-full mt-1 text-xs h-8" size="sm">
              View all {filteredLocations.length} locations
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMapCard;
