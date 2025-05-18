
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ChartsSection from "@/components/dashboard/ChartsSection";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import TopLocationsList from "@/components/dashboard/locations/TopLocationsList";

const LocationsTabContent = () => {
  const [viewMode, setViewMode] = useState<"searches" | "rating">("searches");
  const [locationType, setLocationType] = useState<"all" | "city" | "town" | "village" | "postcode">("all");
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  
  const handleViewAllLocations = () => {
    navigate('/locations');
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card/30 p-6">
        <ChartsSection />
      </div>
      
      <div className="grid grid-cols-1 gap-6 mt-6">
        <div className="rounded-lg border border-border bg-card/30 p-6">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold">Top Requested Locations</h3>
                <p className="text-muted-foreground">
                  Most popular locations searched by users
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => setViewMode("searches")}
                  variant={viewMode === "searches" ? "default" : "outline"}
                  className="rounded-full px-6 py-2"
                >
                  By Searches
                </Button>
                <Button 
                  onClick={() => setViewMode("rating")}
                  variant={viewMode === "rating" ? "default" : "outline"}
                  className="rounded-full px-6 py-2"
                >
                  By Rating
                </Button>
              </div>
            </div>
            
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
            
            <TopLocationsList sortBy={viewMode} filterType={locationType} />
            
            <div className="flex justify-center mt-6">
              <Button onClick={handleViewAllLocations}>
                View All Locations
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationsTabContent;
