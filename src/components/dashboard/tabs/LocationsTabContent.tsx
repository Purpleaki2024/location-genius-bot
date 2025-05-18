
import ChartsSection from "@/components/dashboard/ChartsSection";
import TopRequestedLocations from "@/components/dashboard/TopRequestedLocations";

const LocationsTabContent = () => {
  return (
    <>
      <div className="rounded-lg border border-border bg-card/30 p-6">
        <ChartsSection />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-1 gap-6 mt-6">
        <TopRequestedLocations />
      </div>
    </>
  );
};

export default LocationsTabContent;
