
import { useState } from "react";
import UserHeader from "@/components/UserHeader";
import UserTable from "@/components/UserTable";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Download, Filter, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Users = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");

  const canManageUsers = user?.permissions.manageUsers;
  const canEditUsers = user?.role === "admin"; // Only admin can edit users

  if (!canManageUsers) {
    return (
      <div className="space-y-6 p-6">
        <UserHeader title="User Management" />
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-amber-500">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Access Restricted
            </CardTitle>
            <CardDescription>
              You don't have permission to view this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Please contact your administrator if you believe you should have access to user management features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <UserHeader title="User Management" />
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search users..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-wrap items-center space-x-2">
          <Select 
            defaultValue="all" 
            value={selectedRole}
            onValueChange={setSelectedRole}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          
          {canEditUsers && (
            <>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </>
          )}
        </div>
      </div>
      
      <UserTable readOnly={!canEditUsers} />
      
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing 5 of 100 users
        </p>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Users;
