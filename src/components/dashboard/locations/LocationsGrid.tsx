
import LocationListCard from "./LocationListCard";
import { TopLocation } from "@/types/locations";

interface LocationsGridProps {
  locations: TopLocation[];
}

const LocationsGrid = ({ locations }: LocationsGridProps) => {
  if (locations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No locations found for the selected filter.
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {locations.map((location) => (
        <LocationListCard key={location.id} location={location} />
      ))}
    </div>
  );
};

export default LocationsGrid;
