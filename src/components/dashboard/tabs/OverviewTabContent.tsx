
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import LocationMapCard from "@/components/dashboard/LocationMapCard";
import TelegramBotSummary from "@/components/dashboard/TelegramBotSummary";

const OverviewTabContent = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card/30 p-6">
            <h2 className="text-lg font-semibold mb-4">Performance Overview</h2>
            <DashboardCharts />
          </div>
        </div>
      </div>
      
      <div className="space-y-6">
        <LocationMapCard />
        <TelegramBotSummary />
      </div>
    </div>
  );
};

export default OverviewTabContent;
