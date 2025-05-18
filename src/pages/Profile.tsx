
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
import { User, Lock, Bell, Shield, Upload, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // This is just a demo, in a real app we would call an API
    setTimeout(() => {
      toast.success("Profile updated successfully");
      setIsLoading(false);
    }, 1000);
  };
  
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      toast.success("Password changed successfully");
      setIsLoading(false);
    }, 1000);
  };
  
  const handleAvatarChange = () => {
    // In a real app, this would open a file picker
    toast.info("Avatar upload feature would open here");
  };
  
  const handleTwoFactorToggle = () => {
    toast.success("Two-factor authentication status updated");
  };
  
  const generateApiKey = () => {
    toast.success("New API key generated");
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
            <div className="mx-auto w-32 relative group">
              <AspectRatio ratio={1/1}>
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.username}
                  className="rounded-full object-cover border-2 border-primary/20"
                />
              </AspectRatio>
              <Button 
                variant="outline" 
                size="icon" 
                className="absolute bottom-0 right-0" 
                onClick={handleAvatarChange}
              >
                <Upload className="h-4 w-4" />
              </Button>
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
            
            {user.role === "admin" && (
              <Alert className="mt-4">
                <AlertDescription>
                  You have admin privileges. Be careful with system changes.
                </AlertDescription>
              </Alert>
            )}
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
                      <Input 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input id="role" value={user.role} disabled />
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex flex-col space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <textarea 
                      id="bio" 
                      className="min-h-20 rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? "Updating..." : "Update Profile"}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="security">
                <div className="space-y-6">
                  <form onSubmit={handlePasswordChange} className="space-y-4">
                    <h3 className="font-medium text-sm mb-2">Change Password</h3>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Changing..." : "Change Password"}
                      </Button>
                    </div>
                  </form>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">Two-Factor Authentication</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Enable 2FA</p>
                        <p className="text-sm text-muted-foreground">
                          Add an extra layer of security to your account
                        </p>
                      </div>
                      <Switch onCheckedChange={handleTwoFactorToggle} />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium text-sm">API Access</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">API Key</p>
                          <p className="text-sm text-muted-foreground">
                            For developer access to the API
                          </p>
                        </div>
                        <Button variant="outline" size="sm" onClick={generateApiKey}>
                          <RefreshCw className="mr-2 h-3 w-3" />
                          Generate Key
                        </Button>
                      </div>
                      <Input value="••••••••••••••••••••••••••••••" readOnly />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notifications">
                <div className="space-y-4">
                  <h3 className="font-medium text-sm mb-2">Email Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Product Updates</p>
                        <p className="text-sm text-muted-foreground">
                          Receive emails about product updates
                        </p>
                      </div>
                      <Switch defaultChecked onCheckedChange={() => toast.success("Notification setting updated")} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Security Alerts</p>
                        <p className="text-sm text-muted-foreground">
                          Get notified about security events
                        </p>
                      </div>
                      <Switch defaultChecked onCheckedChange={() => toast.success("Notification setting updated")} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Marketing Emails</p>
                        <p className="text-sm text-muted-foreground">
                          Receive marketing and promotional emails
                        </p>
                      </div>
                      <Switch onCheckedChange={() => toast.success("Notification setting updated")} />
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <h3 className="font-medium text-sm mb-2">Application Notifications</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Location Updates</p>
                        <p className="text-sm text-muted-foreground">
                          When a location you follow is updated
                        </p>
                      </div>
                      <Switch defaultChecked onCheckedChange={() => toast.success("Notification setting updated")} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Comments & Mentions</p>
                        <p className="text-sm text-muted-foreground">
                          When someone mentions you in comments
                        </p>
                      </div>
                      <Switch defaultChecked onCheckedChange={() => toast.success("Notification setting updated")} />
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    <Button onClick={() => toast.success("Notification settings saved")}>
                      Save Notification Settings
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {user.role === "admin" && (
                <TabsContent value="permissions">
                  <div className="space-y-4">
                    <h3 className="font-medium">Your Permissions</h3>
                    <div className="border border-border rounded-md p-4">
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
                    
                    <Alert>
                      <AlertDescription>
                        Permission changes require administrator approval. Contact system administrator for changes.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="flex justify-end mt-4">
                      <Button
                        variant="outline"
                        onClick={() => toast.info("Permission change request sent to administrator")}
                      >
                        Request Permission Changes
                      </Button>
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
