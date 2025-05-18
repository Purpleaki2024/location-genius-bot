
import { useState } from "react";
import { TopLocation } from "@/types/locations";
import { useIsMobile } from "@/hooks/use-mobile";
import LocationTypeFilter from "./LocationTypeFilter";
import LocationsGrid from "./LocationsGrid";
import LocationShowMoreButton from "./LocationShowMoreButton";

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
    contact: "+44 7123 456789"
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
    contact: "+44 7234 567890"
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
    contact: "+44 7345 678901"
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
    contact: "+44 7456 789012"
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
    contact: "+44 7567 890123"
  }
];

interface TopLocationsListProps {
  sortBy: "searches" | "rating";
  filterType?: "all" | "city" | "town" | "village" | "postcode";
}

const TopLocationsList = ({ sortBy, filterType = "all" }: TopLocationsListProps) => {
  const [showAll, setShowAll] = useState(false);
  const [locationType, setLocationType] = useState<"all" | "city" | "town" | "village" | "postcode">(filterType);
  const isMobile = useIsMobile();
  
  // Sort and filter locations
  const sortedAndFilteredLocations = [...mockLocations]
    .filter(location => locationType === "all" || location.type === locationType)
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

  return (
    <div className="space-y-4">
      <LocationTypeFilter 
        locationType={locationType}
        setLocationType={setLocationType}
      />
      
      <LocationsGrid locations={displayLocations} />
      
      <LocationShowMoreButton 
        showAll={showAll}
        setShowAll={setShowAll}
        totalCount={sortedAndFilteredLocations.length}
      />
    </div>
  );
};

export default TopLocationsList;
