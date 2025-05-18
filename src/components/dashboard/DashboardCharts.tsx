
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivityChart from "./charts/ActivityChart";
import TypesChart from "./charts/TypesChart";
import RatingsChart from "./charts/RatingsChart";
import ChartControls from "./charts/ChartControls";
import ExportButton from "./charts/ExportButton";

const DashboardCharts = () => {
  const [activeTab, setActiveTab] = useState("activity");
  const [dataType, setDataType] = useState("all");
  const [chartType, setChartType] = useState("line");
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Activity metrics and location data
            </CardDescription>
          </div>
          <ChartControls 
            activeTab={activeTab}
            chartType={chartType}
            dataType={dataType}
            onChartTypeChange={setChartType}
            onDataTypeChange={setDataType}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="types">Location Types</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity" className="space-y-4">
            <ActivityChart chartType={chartType as "line" | "bar"} dataType={dataType as "all" | "users" | "locations" | "reviews"} />
          </TabsContent>
          
          <TabsContent value="types">
            <TypesChart />
          </TabsContent>
          
          <TabsContent value="ratings">
            <RatingsChart />
          </TabsContent>
        </Tabs>
        
        <ExportButton activeTab={activeTab} />
      </CardContent>
    </Card>
  );
};

export default DashboardCharts;
