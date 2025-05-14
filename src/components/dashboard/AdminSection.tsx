
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Shield, Database } from "lucide-react";

const AdminSection = () => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Admin Controls</CardTitle>
      <CardDescription>Advanced features only available to administrators</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
          <Settings className="h-6 w-6 mb-1" />
          <span>System Settings</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
          <Shield className="h-6 w-6 mb-1" />
          <span>Security Controls</span>
        </Button>
        <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
          <Database className="h-6 w-6 mb-1" />
          <span>Database Management</span>
        </Button>
      </div>
    </CardContent>
  </Card>
);

export default AdminSection;
