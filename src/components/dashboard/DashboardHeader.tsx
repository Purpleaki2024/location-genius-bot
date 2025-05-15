
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import UserHeader from "@/components/UserHeader";
import TelegramBotConfig from "@/components/TelegramBotConfig";
import TimeframeSelector from "@/components/dashboard/TimeframeSelector";

interface DashboardHeaderProps {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  selectedTimeframe: string;
  setSelectedTimeframe: (timeframe: string) => void;
}

const DashboardHeader = ({
  date,
  setDate,
  selectedTimeframe,
  setSelectedTimeframe
}: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <UserHeader title="Dashboard" />
      
      <div className="flex flex-wrap gap-2 items-center">
        <TelegramBotConfig />
        <TimeframeSelector 
          date={date}
          setDate={setDate}
          selectedTimeframe={selectedTimeframe}
          setSelectedTimeframe={setSelectedTimeframe}
        />
      </div>
    </div>
  );
};

export default DashboardHeader;
