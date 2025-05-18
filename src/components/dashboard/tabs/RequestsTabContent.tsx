
import StatCards from "@/components/StatCards";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import { Card, CardContent } from "@/components/ui/card";

const RequestsTabContent = () => {
  return (
    <>
      <div className="rounded-lg border border-border bg-card/30 p-6">
        <h2 className="text-lg font-semibold mb-4">Request Volume</h2>
        <StatCards />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Request Trends</h3>
          <div className="h-[300px]">
            <DashboardCharts />
          </div>
        </div>
        
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-semibold mb-4">Request Types</h3>
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">
              Request types distribution chart
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RequestsTabContent;
