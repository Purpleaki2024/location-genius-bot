
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, Shield, Database, Bell, Activity, Server, Globe, Users, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AdminSection = () => {
  const navigate = useNavigate();

  const handleSystemSettings = () => {
    navigate("/settings");
    toast.info("Opening system settings");
  };

  const handleUserManagement = () => {
    navigate("/users");
    toast.info("Opening user management");
  };

  const handleLocationManagement = () => {
    navigate("/admin/locations");
    toast.info("Opening location management");
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="mr-2 h-5 w-5 text-blue-500" />
          Admin Controls
        </CardTitle>
        <CardDescription>Advanced features only available to administrators</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="system">
          <TabsList className="mb-4">
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="system">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center hover:bg-primary/5"
                onClick={handleSystemSettings}
              >
                <Settings className="h-6 w-6 mb-1 text-primary" />
                <span className="font-medium">System Settings</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center hover:bg-primary/5"
                onClick={handleUserManagement}
              >
                <Users className="h-6 w-6 mb-1 text-primary" />
                <span className="font-medium">User Management</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center hover:bg-primary/5"
                onClick={handleLocationManagement}
              >
                <MapPin className="h-6 w-6 mb-1 text-primary" />
                <span className="font-medium">Locations</span>
              </Button>
            </div>
            
            <Alert className="bg-green-50 border-green-200">
              <Server className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">System Status</AlertTitle>
              <AlertDescription className="text-green-700">
                All systems operational. Dashboard ready for administration.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="security">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center hover:bg-primary/5">
                <Shield className="h-6 w-6 mb-1 text-primary" />
                <span className="font-medium">Security Policies</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center hover:bg-primary/5">
                <Globe className="h-6 w-6 mb-1 text-primary" />
                <span className="font-medium">Access Control</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center hover:bg-primary/5">
                <Activity className="h-6 w-6 mb-1 text-primary" />
                <span className="font-medium">Audit Logs</span>
              </Button>
            </div>
            
            <Alert className="mt-4 bg-amber-50 border-amber-200">
              <Bell className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-800">Security Advisory</AlertTitle>
              <AlertDescription className="text-amber-700">
                Security monitoring is active. All admin actions are logged.
              </AlertDescription>
            </Alert>
          </TabsContent>
          
          <TabsContent value="data">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center hover:bg-primary/5">
                <Database className="h-6 w-6 mb-1 text-primary" />
                <span className="font-medium">Database Console</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center hover:bg-primary/5">
                <Activity className="h-6 w-6 mb-1 text-primary" />
                <span className="font-medium">Data Analytics</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center hover:bg-primary/5">
                <Settings className="h-6 w-6 mb-1 text-primary" />
                <span className="font-medium">Backup/Restore</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold text-primary">24</p>
              </div>
              <div className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium text-muted-foreground">Active Locations</p>
                <p className="text-2xl font-bold text-primary">156</p>
              </div>
              <div className="p-4 border rounded-lg bg-card hover:bg-muted/50 transition-colors">
                <p className="text-sm font-medium text-muted-foreground">Bot Requests</p>
                <p className="text-2xl font-bold text-primary">1.2K</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdminSection;
