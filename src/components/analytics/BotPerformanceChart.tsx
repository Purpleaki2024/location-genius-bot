
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useBotPerformanceStats } from "@/hooks/useAnalytics";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const BotPerformanceChart = () => {
  const [timeframe, setTimeframe] = useState("7");
  const { data: performanceData, isLoading, error } = useBotPerformanceStats(parseInt(timeframe));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bot Performance Metrics</CardTitle>
          <CardDescription>Response times and success rates</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Bot Performance Metrics</CardTitle>
          <CardDescription>Response times and success rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Error loading performance data
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = performanceData?.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    totalRequests: item.total_requests,
    errorCount: item.error_count,
    avgDuration: Math.round(item.avg_duration_ms),
    successRate: item.success_rate
  })) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Bot Performance Metrics</CardTitle>
          <CardDescription>Daily performance and reliability statistics</CardDescription>
        </div>
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="14">14 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="totalRequests"
              stackId="1"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.6}
              name="Total Requests"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="errorCount"
              stackId="1"
              stroke="hsl(var(--destructive))"
              fill="hsl(var(--destructive))"
              fillOpacity={0.6}
              name="Errors"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="successRate"
              stroke="hsl(var(--chart-2))"
              strokeWidth={3}
              name="Success Rate (%)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BotPerformanceChart;
