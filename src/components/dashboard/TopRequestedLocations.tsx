
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp } from "lucide-react";

const TopRequestedLocations = () => {
  // Mock data - in a real app, this would come from your backend
  const topLocations = [
    { name: "Central Park", city: "New York", requests: 1247, trend: "+12%" },
    { name: "Times Square", city: "New York", requests: 1089, trend: "+8%" },
    { name: "Golden Gate Bridge", city: "San Francisco", requests: 956, trend: "+15%" },
    { name: "Hollywood Sign", city: "Los Angeles", requests: 834, trend: "+3%" },
    { name: "Space Needle", city: "Seattle", requests: 723, trend: "+22%" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Top Requested Locations
        </CardTitle>
        <CardDescription>
          Most popular locations searched by users this week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topLocations.map((location, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{location.name}</div>
                  <div className="text-sm text-muted-foreground">{location.city}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{location.requests.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-3 w-3 text-green-600" />
                  <span className="text-green-600">{location.trend}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopRequestedLocations;
