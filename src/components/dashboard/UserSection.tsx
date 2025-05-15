
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Search, 
  MapPin, 
  Star, 
  MessageSquare, 
  User, 
  Heart 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const UserSection = () => {
  const { user } = useAuth();
  
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
            <div className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Viewed location details</p>
                  <p className="text-sm text-muted-foreground">Central Park Café</p>
                  <p className="text-xs text-muted-foreground">5 mins ago</p>
                </div>
                <Button variant="ghost" size="sm">
                  <MapPin className="h-4 w-4 mr-1" /> View
                </Button>
              </div>
              
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Search className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Searched locations</p>
                  <p className="text-sm text-muted-foreground">"restaurants near downtown"</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
                <Button variant="ghost" size="sm">
                  <Search className="h-4 w-4 mr-1" /> Repeat
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Updated profile</p>
                  <p className="text-sm text-muted-foreground">Changed notification settings</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-1" /> Profile
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="saved">
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-md border p-3">
                <div className="bg-amber-50 p-2 rounded-md">
                  <MapPin className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Central Park Café</p>
                    <Badge variant="outline" className="text-xs">Restaurant</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">123 Park Avenue, New York</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <span className="text-xs ml-1">5.0</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="icon" variant="ghost">
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 rounded-md border p-3">
                <div className="bg-blue-50 p-2 rounded-md">
                  <MapPin className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">Ocean View Hotel</p>
                    <Badge variant="outline" className="text-xs">Hotel</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">456 Beach Road, Los Angeles</p>
                  <div className="flex items-center mt-1">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    <Star className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs ml-1">4.0</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button size="icon" variant="ghost">
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-2">
                View All Saved Locations
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="stats">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded-md p-3">
                <p className="text-sm text-muted-foreground">Locations Viewed</p>
                <p className="text-2xl font-bold">28</p>
                <p className="text-xs text-green-600">+4 this week</p>
              </div>
              <div className="border rounded-md p-3">
                <p className="text-sm text-muted-foreground">Favorites</p>
                <p className="text-2xl font-bold">12</p>
                <p className="text-xs text-green-600">+2 this week</p>
              </div>
              <div className="border rounded-md p-3">
                <p className="text-sm text-muted-foreground">Reviews</p>
                <p className="text-2xl font-bold">7</p>
                <p className="text-xs text-amber-600">No change</p>
              </div>
              <div className="border rounded-md p-3">
                <p className="text-sm text-muted-foreground">Avg. Rating</p>
                <p className="text-2xl font-bold">4.5</p>
                <p className="text-xs text-muted-foreground">Out of 5</p>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">Account Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Username</p>
                  <p className="text-sm font-medium">{user?.username}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="text-sm font-medium capitalize">{user?.role}</p>
                </div>
                <div className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">May 12, 2025</p>
                </div>
              </div>
              
              <Button variant="outline" className="w-full mt-3" size="sm">
                <User className="h-4 w-4 mr-1" /> Edit Profile
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default UserSection;
