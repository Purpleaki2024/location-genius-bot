
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Settings, Shield, Database, Bell, Activity, Server, Globe } from "lucide-react";

const AdminSection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Admin Controls</CardTitle>
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
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Settings className="h-6 w-6 mb-1" />
              <span>System Settings</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Bell className="h-6 w-6 mb-1" />
              <span>Notifications</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Activity className="h-6 w-6 mb-1" />
              <span>System Health</span>
            </Button>
          </div>
          
          <Alert className="bg-primary/10 border-primary/20">
            <Server className="h-4 w-4" />
            <AlertTitle>System Status</AlertTitle>
            <AlertDescription>
              All systems operational. Last backup: Today at 04:00 AM.
            </AlertDescription>
          </Alert>
        </TabsContent>
        
        <TabsContent value="security">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Shield className="h-6 w-6 mb-1" />
              <span>Security Policies</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Globe className="h-6 w-6 mb-1" />
              <span>Access Control</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Activity className="h-6 w-6 mb-1" />
              <span>Audit Logs</span>
            </Button>
          </div>
          
          <div className="mt-4 rounded-md bg-amber-50 p-3 border border-amber-200">
            <h3 className="text-sm font-medium text-amber-800">Security Advisory</h3>
            <p className="text-xs text-amber-700 mt-1">
              There are 2 new security patches available for your system. Consider updating soon.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="data">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Database className="h-6 w-6 mb-1" />
              <span>Database Console</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Activity className="h-6 w-6 mb-1" />
              <span>Data Analytics</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
              <Settings className="h-6 w-6 mb-1" />
              <span>Backup/Restore</span>
            </Button>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="p-3 border rounded-md">
              <p className="text-sm font-medium">Total Records</p>
              <p className="text-2xl font-bold">12,458</p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="text-sm font-medium">Storage Used</p>
              <p className="text-2xl font-bold">860 MB</p>
            </div>
            <div className="p-3 border rounded-md">
              <p className="text-sm font-medium">Queries/Min</p>
              <p className="text-2xl font-bold">124</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>
);

export default AdminSection;
