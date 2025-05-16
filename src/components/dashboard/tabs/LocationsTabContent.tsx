
import ChartsSection from "@/components/dashboard/ChartsSection";
import LocationMapCard from "@/components/dashboard/LocationMapCard";

const LocationsTabContent = () => {
  return (
    <>
      <div className="rounded-lg border border-border bg-card/30 p-6">
        <ChartsSection />
      </div>
      
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Location Map</h3>
        <div className="h-[400px]">
          <LocationMapCard />
        </div>
      </div>
    </>
  );
};

export default LocationsTabContent;
