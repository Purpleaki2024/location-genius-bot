import { useState, useEffect } from "react";
import { subDays, subWeeks, subMonths } from "date-fns";

export const useDashboardTimeframe = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  
  // Effect to update date based on timeframe selection
  useEffect(() => {
    const today = new Date();
    
    switch (selectedTimeframe) {
      case "today":
        setDate(today);
        break;
      case "yesterday":
        setDate(subDays(today, 1));
        break;
      case "this_week":
        // Keep current date but update UI
        break;
      case "last_week":
        setDate(subWeeks(today, 1));
        break;
      case "this_month":
        // Keep current date but update UI
        break;
      case "last_month":
        setDate(subMonths(today, 1));
        break;
      default:
        // Don't change the date for custom or all_time
        break;
    }
  }, [selectedTimeframe]);

  return {
    date,
    setDate,
    selectedTimeframe,
    setSelectedTimeframe
  };
};
