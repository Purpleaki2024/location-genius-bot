
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useUserActivityStats } from "@/hooks/useAnalytics";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const UserActivityChart = () => {
  const [timeframe, setTimeframe] = useState("7");
  const { data: activityData, isLoading, error } = useUserActivityStats(parseInt(timeframe));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Activity Trends</CardTitle>
          <CardDescription>Daily user engagement metrics</CardDescription>
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
          <CardTitle>User Activity Trends</CardTitle>
          <CardDescription>Daily user engagement metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Error loading activity data
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = activityData?.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    activeUsers: item.active_users,
    totalCommands: item.total_commands,
    avgSessionDuration: Math.round(item.avg_session_duration)
  })) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Activity Trends</CardTitle>
          <CardDescription>Daily user engagement and command usage</CardDescription>
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
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="activeUsers" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Active Users"
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="totalCommands" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              name="Total Commands"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default UserActivityChart;
