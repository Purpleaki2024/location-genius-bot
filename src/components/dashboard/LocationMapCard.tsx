
import { useState } from "react";
import LocationMap from "@/components/LocationMap";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Enhanced location data
const locationData = [
  {
    id: "1",
    name: "Central Park Café",
    lat: 40.7812,
    lng: -73.9665,
    rating: 4.7,
    type: "restaurant",
    description: "Popular café with outdoor seating and scenic views"
  },
  {
    id: "2",
    name: "Ocean View Hotel",
    lat: 40.7609,
    lng: -73.9845,
    rating: 4.5,
    type: "hotel",
    description: "Luxury hotel with panoramic city views"
  },
  {
    id: "3",
    name: "City Museum",
    lat: 40.7789,
    lng: -73.9675,
    rating: 4.8,
    type: "attraction",
    description: "Cultural landmark with interactive exhibitions"
  },
  {
    id: "4",
    name: "Downtown Mall",
    lat: 40.7730,
    lng: -73.9787,
    rating: 4.2,
    type: "shopping",
    description: "Modern shopping center with various retail options"
  },
  {
    id: "5",
    name: "Riverside Park",
    lat: 40.7850,
    lng: -73.9750,
    rating: 4.9,
    type: "attraction",
    description: "Beautiful park along the river with walking trails"
  }
];

const LocationMapCard = () => {
  const [filterType, setFilterType] = useState<string>("all");
  
  // Filter locations based on selected type
  const filteredLocations = filterType === "all" 
    ? locationData 
    : locationData.filter(loc => loc.type === filterType);
  
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
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="restaurant">Restaurants</SelectItem>
              <SelectItem value="hotel">Hotels</SelectItem>
              <SelectItem value="attraction">Attractions</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <LocationMap locations={filteredLocations} height="300px" />
        <div className="mt-3 space-y-2">
          <p className="text-sm font-medium">Selected locations: {filteredLocations.length}</p>
          <div className="grid grid-cols-2 gap-2">
            {filteredLocations.slice(0, 2).map(loc => (
              <div key={loc.id} className="rounded-md border p-2 text-sm">
                <div className="font-medium">{loc.name}</div>
                <div className="text-muted-foreground text-xs">{loc.description}</div>
                <div className="mt-1 flex items-center">
                  <span className="text-amber-500">★</span>
                  <span className="ml-1 text-xs">{loc.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMapCard;
