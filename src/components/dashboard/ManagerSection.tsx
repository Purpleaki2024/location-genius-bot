
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ManagerSection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Operations Dashboard</CardTitle>
      <CardDescription>Tools for location and user management</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-medium">Pending Reviews</h3>
            <p className="text-3xl font-bold mt-2">24</p>
            <p className="text-sm text-muted-foreground">Awaiting approval</p>
          </div>
          <div className="border border-border rounded-lg p-4">
            <h3 className="text-lg font-medium">New Locations</h3>
            <p className="text-3xl font-bold mt-2">7</p>
            <p className="text-sm text-muted-foreground">Added this week</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default ManagerSection;
