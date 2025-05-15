
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import UserHeader from "@/components/UserHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Lock, Bell, Shield } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // This is just a demo, in a real app we would call an API
    setTimeout(() => {
      toast.success("Profile updated successfully");
      setIsLoading(false);
    }, 1000);
  };

  if (!user) {
    return <div className="p-6">Loading profile...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <UserHeader title="My Profile" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - profile summary */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <div className="mx-auto w-32">
              <AspectRatio ratio={1/1}>
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username}
                  className="rounded-full object-cover border-2 border-primary/20"
                />
              </AspectRatio>
            </div>
            <div>
              <h3 className="font-medium text-lg">{user.username}</h3>
              <p className="text-muted-foreground capitalize">{user.role}</p>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Account Status</p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Right column - profile details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account">
              <TabsList className="mb-4">
                <TabsTrigger value="account">
                  <User className="h-4 w-4 mr-2" />
                  Account
                </TabsTrigger>
                <TabsTrigger value="security">
                  <Lock className="h-4 w-4 mr-2" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="notifications">
                  <Bell className="h-4 w-4 mr-2" />
                  Notifications
                </TabsTrigger>
                {user.role === "admin" && (
                  <TabsTrigger value="permissions">
                    <Shield className="h-4 w-4 mr-2" />
                    Permissions
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="account">
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input id="username" defaultValue={user.username} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" defaultValue={user.email || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" value={user.role} disabled />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="security">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Update your security preferences</p>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">Current Password</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">New Password</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm New Password</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                  <Button>Change Password</Button>
                </div>
              </TabsContent>

              <TabsContent value="notifications">
                <p className="text-sm text-muted-foreground mb-4">Configure your notification preferences</p>
                <div className="space-y-4">
                  {/* Notification settings would go here */}
                  <p>Notification settings are under development</p>
                </div>
              </TabsContent>

              {user.role === "admin" && (
                <TabsContent value="permissions">
                  <p className="text-sm text-muted-foreground mb-4">View and manage your permissions</p>
                  <div className="space-y-4">
                    {/* Permissions display */}
                    <div className="border border-border rounded-md p-4">
                      <h3 className="font-medium mb-2">Your Permissions</h3>
                      <ul className="space-y-2">
                        {Object.entries(user.permissions).map(([key, value]) => (
                          <li key={key} className="flex items-center justify-between text-sm">
                            <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                            <span className={value ? "text-green-600" : "text-red-600"}>
                              {value ? "Allowed" : "Denied"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
