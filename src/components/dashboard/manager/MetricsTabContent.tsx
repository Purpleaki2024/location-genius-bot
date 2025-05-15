
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

const MetricsTabContent = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4">
          <h3 className="text-lg font-medium">User Activity</h3>
          <p className="text-3xl font-bold mt-2">2,541</p>
          <p className="text-sm text-muted-foreground">Location searches today</p>
          <div className="mt-3">
            <Progress value={75} className="h-2" />
            <p className="text-xs text-green-600 mt-1">+12% from yesterday</p>
          </div>
        </div>
        <div className="border border-border rounded-lg p-4">
          <h3 className="text-lg font-medium">User Engagement</h3>
          <p className="text-3xl font-bold mt-2">18.5 min</p>
          <p className="text-sm text-muted-foreground">Avg. session duration</p>
          <div className="mt-3">
            <Progress value={65} className="h-2" />
            <p className="text-xs text-amber-600 mt-1">-3% from last week</p>
          </div>
        </div>
      </div>
      
      <div className="border border-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Top Users</h3>
          <Button variant="outline" size="sm">View All</Button>
        </div>
        <div className="mt-3 space-y-3">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Sarah Johnson</p>
              <p className="text-xs text-muted-foreground">42 locations saved</p>
            </div>
            <Badge>Power User</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Michael Chen</p>
              <p className="text-xs text-muted-foreground">36 locations saved</p>
            </div>
            <Badge>Power User</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Emily Rodriguez</p>
              <p className="text-xs text-muted-foreground">28 locations saved</p>
            </div>
            <Badge>Active</Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsTabContent;
