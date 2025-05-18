
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import LocationCard from "./LocationCard";
import { TopLocation } from "@/types/locations";

interface TopLocationsListProps {
  sortBy?: "searches" | "rating";
}

// Mock locations data (this could be moved to a separate file or fetched from an API)
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

const TopLocationsList: React.FC<TopLocationsListProps> = ({ sortBy = "searches" }) => {
  const sortedLocations = [...mockLocations].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    return b.searches - a.searches;
  });
  
  const handleViewAll = () => {
    toast.info("Viewing all locations");
    // In a real app, this would navigate to locations list
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {sortedLocations.map(location => (
          <LocationCard key={location.id} location={location} />
        ))}
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

export default TopLocationsList;
