
import LocationMapCard from "@/components/dashboard/LocationMapCard";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

const ChartsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <LocationMapCard />
      <DashboardCharts />
    </div>
  );
};

export default ChartsSection;
