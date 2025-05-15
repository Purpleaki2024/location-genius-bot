
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertTriangle } from "lucide-react";

const ReviewsTabContent = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Pending Reviews</h3>
            <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">24</Badge>
          </div>
          <p className="text-3xl font-bold mt-2">24</p>
          <p className="text-sm text-muted-foreground">Awaiting approval</p>
          <div className="mt-3">
            <Progress value={65} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">65% increase from last week</p>
          </div>
        </div>
        <div className="border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Approved Reviews</h3>
            <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">152</Badge>
          </div>
          <p className="text-3xl font-bold mt-2">152</p>
          <p className="text-sm text-muted-foreground">Last 30 days</p>
          <div className="mt-3">
            <Progress value={82} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">82% positive sentiment</p>
          </div>
        </div>
      </div>
      
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-3">Recent Review Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-2 rounded-md bg-background">
            <div className="bg-primary/10 p-2 rounded-full">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">New review for "Central Park Café"</p>
              <p className="text-xs text-muted-foreground">Submitted 5 mins ago</p>
            </div>
            <Button variant="outline" size="sm">Review</Button>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-md bg-background">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Approved review for "Ocean View Hotel"</p>
              <p className="text-xs text-muted-foreground">2 hours ago</p>
            </div>
            <Button variant="outline" size="sm">View</Button>
          </div>
          <div className="flex items-center gap-3 p-2 rounded-md bg-background">
            <div className="bg-amber-100 p-2 rounded-full">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Flagged review for "City Museum"</p>
              <p className="text-xs text-muted-foreground">Yesterday</p>
            </div>
            <Button variant="outline" size="sm">Resolve</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsTabContent;
