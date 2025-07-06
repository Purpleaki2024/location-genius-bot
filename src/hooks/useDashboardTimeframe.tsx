
import { useState, useEffect } from "react";
import { subDays, subWeeks, subMonths } from "date-fns";

export const useDashboardTimeframe = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");
  
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
        setDate(today);
        break;
      case "last_week":
        setDate(subWeeks(today, 1));
        break;
      case "this_month":
        setDate(today);
        break;
      case "last_month":
        setDate(subMonths(today, 1));
        break;
      default:
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

export default useDashboardTimeframe;
