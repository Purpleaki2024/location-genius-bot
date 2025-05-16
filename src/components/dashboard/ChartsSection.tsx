
import TopRequestedLocations from "@/components/dashboard/TopRequestedLocations";
import TelegramBotSummary from "@/components/dashboard/TelegramBotSummary";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

const ChartsSection = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TopRequestedLocations />
        <TelegramBotSummary />
      </div>
      <DashboardCharts />
    </div>
  );
};

export default ChartsSection;
