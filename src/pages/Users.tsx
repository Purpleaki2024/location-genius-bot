
import { useState } from "react";
import UserHeader from "@/components/UserHeader";
import UserTable from "@/components/UserTable";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Download, Filter, AlertTriangle, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Users = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const canManageUsers = user?.permissions.manageUsers;
  const canEditUsers = user?.role === "admin"; // Only admin can edit users

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      toast.info(`Searching for users: ${searchTerm}`);
    }
  };
  
  const handleExport = () => {
    toast.success("Exporting user data to CSV");
    // In a real app, this would generate and download a CSV file
    setTimeout(() => {
      const link = document.createElement("a");
      link.href = "#";
      link.download = "users_export.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };
  
  const handleAddUser = () => {
    setIsAddUserOpen(true);
  };

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
            <Button 
              className="mt-4"
              onClick={() => toast.info("Request sent to administrator")}
            >
              Request Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <UserHeader title="User Management" />
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" type="submit">
            <Filter className="h-4 w-4" />
          </Button>
        </form>
        
        <div className="flex flex-wrap items-center space-x-2">
          <Select 
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
              <Button variant="outline" onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              
              <Button onClick={handleAddUser}>
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
          <Button 
            variant="outline" 
            size="sm" 
            disabled
            onClick={() => toast.info("Previous page")}
          >
            Previous
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => toast.info("Next page")}
          >
            Next
          </Button>
        </div>
      </div>
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account with specific permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              In a production app, this would contain a form to add a new user with fields for username, email, role, and permissions.
            </p>
            <div className="flex justify-end mt-4">
              <Button onClick={() => {
                setIsAddUserOpen(false);
                toast.success("User added successfully");
              }}>
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
