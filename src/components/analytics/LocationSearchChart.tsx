
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useLocationSearchStats } from "@/hooks/useAnalytics";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

const LocationSearchChart = () => {
  const [timeframe, setTimeframe] = useState("7");
  const { data: searchData, isLoading, error } = useLocationSearchStats(parseInt(timeframe));

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Location Search Analytics</CardTitle>
          <CardDescription>Search patterns and success rates</CardDescription>
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
          <CardTitle>Location Search Analytics</CardTitle>
          <CardDescription>Search patterns and success rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            Error loading search data
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = searchData?.map(item => ({
    date: new Date(item.date).toLocaleDateString(),
    totalSearches: item.total_searches,
    successfulSearches: item.successful_searches,
    uniqueUsers: item.unique_users,
    successRate: item.total_searches > 0 ? Math.round((item.successful_searches / item.total_searches) * 100) : 0
  })) || [];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Location Search Analytics</CardTitle>
          <CardDescription>Daily search volume and success metrics</CardDescription>
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
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar 
              dataKey="totalSearches" 
              fill="hsl(var(--primary))" 
              name="Total Searches"
            />
            <Bar 
              dataKey="successfulSearches" 
              fill="hsl(var(--chart-2))" 
              name="Successful Searches"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LocationSearchChart;
