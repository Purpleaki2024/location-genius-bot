
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, AlertTriangle, Users, MapPin } from "lucide-react";

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
        </TabsContent>
        
        <TabsContent value="locations">
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Total Locations</h3>
                </div>
                <p className="text-2xl font-bold mt-1">842</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <h3 className="text-sm font-medium">Active</h3>
                </div>
                <p className="text-2xl font-bold mt-1">789</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <h3 className="text-sm font-medium">Pending</h3>
                </div>
                <p className="text-2xl font-bold mt-1">35</p>
              </div>
              <div className="border border-border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <h3 className="text-sm font-medium">New</h3>
                </div>
                <p className="text-2xl font-bold mt-1">18</p>
              </div>
            </div>
            
            <div className="border border-border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">Location Type Distribution</h3>
              <div className="space-y-2 mt-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Restaurants</span>
                    <span>42%</span>
                  </div>
                  <Progress value={42} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Hotels</span>
                    <span>28%</span>
                  </div>
                  <Progress value={28} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Attractions</span>
                    <span>18%</span>
                  </div>
                  <Progress value={18} className="h-2 mt-1" />
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Shopping</span>
                    <span>12%</span>
                  </div>
                  <Progress value={12} className="h-2 mt-1" />
                </div>
              </div>
              <Button className="w-full mt-4" size="sm">View All Locations</Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="metrics">
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
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

export default ManagerSection;
