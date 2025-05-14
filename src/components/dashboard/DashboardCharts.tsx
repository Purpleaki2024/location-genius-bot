
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart as RechartsBarChart,
  Bar,
  ResponsiveContainer
} from "recharts";
import { Maximize, Minimize, ChartLine, ChartBar } from "lucide-react";

// Sample chart data
const chartData = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (6 - i));
  
  return {
    name: date.toLocaleDateString('en-US', { weekday: 'short' }),
    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    requests: Math.floor(Math.random() * 500) + 800,
    users: Math.floor(Math.random() * 100) + 200,
  };
});

const locationTypes = [
  { name: "Restaurant", value: 42, percentage: "42%" },
  { name: "Hotel", value: 28, percentage: "28%" },
  { name: "Attraction", value: 15, percentage: "15%" },
  { name: "Park", value: 10, percentage: "10%" },
  { name: "Shopping", value: 5, percentage: "5%" }
];

const DashboardCharts = () => {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);

  // Custom tooltip components for better visualization
  const CustomRequestTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md shadow-lg p-3">
          <p className="font-medium text-sm mb-1">{payload[0].payload.date}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-sm">Requests:</span>
              </div>
              <span className="text-sm font-medium">{payload[0].value.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-sm">Users:</span>
              </div>
              <span className="text-sm font-medium">{payload[1].value.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const CustomLocationTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-md shadow-lg p-3">
          <p className="font-medium text-sm mb-1">{payload[0].payload.name}</p>
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm">Locations:</span>
            <span className="text-sm font-medium">{payload[0].value} ({payload[0].payload.percentage})</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={expanded ? "fixed inset-4 z-50 overflow-auto" : ""}>
      <Tabs defaultValue="requests">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>
                View request and user statistics
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setExpanded(!expanded)}
              className="ml-auto"
              title={expanded ? "Minimize" : "Maximize"}
            >
              {expanded ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
          <TabsList className="mt-2">
            <TabsTrigger value="requests" className="flex items-center gap-1">
              <ChartLine className="h-3.5 w-3.5" />
              <span>Requests</span>
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-1">
              <ChartBar className="h-3.5 w-3.5" />
              <span>Locations</span>
            </TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="pt-4">
          <TabsContent value="requests" className="mt-0">
            <ChartContainer config={{
              requests: { label: "Requests", color: "#3b82f6" },
              users: { label: "Users", color: "#22c55e" }
            }}>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                <RechartsLineChart data={chartData} margin={{ top: 20, right: 30, left: isMobile ? 0 : 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    width={isMobile ? 35 : 50} 
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickFormatter={(value) => isMobile ? value/1000 + 'k' : value.toLocaleString()}
                  />
                  <Tooltip content={<CustomRequestTooltip />} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                  <Line type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} activeDot={{ r: 6 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
          <TabsContent value="locations" className="mt-0">
            <ChartContainer config={{
              value: { label: "Locations", color: "#a855f7" }
            }}>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 300}>
                <RechartsBarChart data={locationTypes} margin={{ top: 20, right: 30, left: isMobile ? 0 : 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    width={isMobile ? 30 : 50} 
                    tick={{ fontSize: isMobile ? 10 : 12 }}
                  />
                  <Tooltip content={<CustomLocationTooltip />} />
                  <Legend wrapperStyle={{ fontSize: isMobile ? 10 : 12 }} />
                  <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
};

export default DashboardCharts;
