
import { Button } from "@/components/ui/button";

interface LocationTypeFilterProps {
  locationType: "all" | "city" | "town" | "village" | "postcode";
  setLocationType: (type: "all" | "city" | "town" | "village" | "postcode") => void;
}

const LocationTypeFilter = ({ locationType, setLocationType }: LocationTypeFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Button 
        onClick={() => setLocationType("all")}
        variant={locationType === "all" ? "default" : "outline"}
        size="sm"
        className="rounded-full"
      >
        All
      </Button>
      <Button 
        onClick={() => setLocationType("city")}
        variant={locationType === "city" ? "default" : "outline"}
        size="sm"
        className="rounded-full"
      >
        Cities
      </Button>
      <Button 
        onClick={() => setLocationType("town")}
        variant={locationType === "town" ? "default" : "outline"}
        size="sm"
        className="rounded-full"
      >
        Towns
      </Button>
      <Button 
        onClick={() => setLocationType("village")}
        variant={locationType === "village" ? "default" : "outline"}
        size="sm"
        className="rounded-full"
      >
        Villages
      </Button>
      <Button 
        onClick={() => setLocationType("postcode")}
        variant={locationType === "postcode" ? "default" : "outline"}
        size="sm"
        className="rounded-full"
      >
        Postcodes
      </Button>
    </div>
  );
};

export default LocationTypeFilter;
