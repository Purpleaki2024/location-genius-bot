
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Import the extracted tab components
import UserActivityTab from "./user/UserActivityTab";
import UserSavedTab from "./user/UserSavedTab";
import UserStatsTab from "./user/UserStatsTab";

const UserSection = () => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Activity</CardTitle>
            <CardDescription>Your recent interactions with the system</CardDescription>
          </div>
          <div>
            <Button variant="outline" size="sm">See all</Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="activity">
          <TabsList className="mb-4">
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>
          
          <TabsContent value="activity">
            <UserActivityTab />
          </TabsContent>
          
          <TabsContent value="saved">
            <UserSavedTab />
          </TabsContent>
          
          <TabsContent value="stats">
            <UserStatsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserSection;
