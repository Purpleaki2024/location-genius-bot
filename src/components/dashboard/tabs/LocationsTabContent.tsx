
import ChartsSection from "@/components/dashboard/ChartsSection";
import LocationMapCard from "@/components/dashboard/LocationMapCard";
import TopRequestedLocations from "@/components/dashboard/TopRequestedLocations";

const LocationsTabContent = () => {
  return (
    <>
      <div className="rounded-lg border border-border bg-card/30 p-6">
        <ChartsSection />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <TopRequestedLocations />
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Location Map</h3>
          <div className="h-[400px]">
            <LocationMapCard />
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationsTabContent;
