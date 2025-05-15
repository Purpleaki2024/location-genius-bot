
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import refactored tab content components
import ReviewsTabContent from "./manager/ReviewsTabContent";
import LocationsTabContent from "./manager/LocationsTabContent";
import MetricsTabContent from "./manager/MetricsTabContent";

const ManagerSection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Operations Dashboard</CardTitle>
      <CardDescription>Tools for location and user management</CardDescription>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="reviews">
        <TabsList className="mb-4">
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="reviews">
          <ReviewsTabContent />
        </TabsContent>
        
        <TabsContent value="locations">
          <LocationsTabContent />
        </TabsContent>
        
        <TabsContent value="metrics">
          <MetricsTabContent />
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

export default ManagerSection;
