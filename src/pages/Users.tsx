
import { useState } from "react";
import UserHeader from "@/components/UserHeader";
import UserTable from "@/components/UserTable";
import UserStatsCards from "@/components/UserStatsCards";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Download, Filter, AlertTriangle, Search, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUserManagement } from "@/hooks/useUserManagement";

const Users = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);

  const canManageUsers = user?.permissions?.manageUsers ?? (user?.role === "admin" || user?.role === "manager");
  const canEditUsers = user?.role === "admin" || user?.role === "manager";

  const { data: users, refetch: refetchUsers, isLoading: isRefreshing } = useUserManagement(searchTerm, selectedRole);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      toast.info(`Searching for users: ${searchTerm}`);
    }
  };
  
  const handleExport = async () => {
    toast.info("Preparing user data export...");
    try {
      if (!users) {
        toast.error("No user data to export");
        return;
      }

      // Create CSV content
      const headers = ['Username', 'Telegram ID', 'First Name', 'Last Name', 'Role', 'Requests Today', 'Last Active', 'Join Date'];
      const csvContent = [
        headers.join(','),
        ...users.map(user => [
          user.username || '',
          user.telegram_id,
          user.first_name || '',
          user.last_name || '',
          user.role,
          user.requests_today || 0,
          user.last_seen || '',
          user.first_seen || ''
        ].join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `users_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("User data exported successfully");
    } catch (error) {
      console.error('Export error:', error);
      toast.error("Failed to export user data");
    }
  };
  
  const handleAddUser = () => {
    setIsAddUserOpen(true);
  };

  const handleRefresh = async () => {
    try {
      await refetchUsers();
      toast.success("User data refreshed");
    } catch (error) {
      toast.error("Failed to refresh user data");
    }
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
              onClick={() => toast.info("Access request logged - administrator will be notified")}
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
      
      {/* User Statistics */}
      <UserStatsCards />
      
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex flex-1 items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by username, name, or Telegram ID..."
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
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
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
      
      {/* User Table */}
      <UserTable 
        readOnly={!canEditUsers} 
        searchTerm={searchTerm}
        roleFilter={selectedRole}
      />
      
      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              To add a new user, they must first interact with the Telegram bot. Users are automatically registered when they send their first message.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              New users will appear in this list automatically after they:
            </p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4">
              <li>Send a message to the Telegram bot</li>
              <li>Use any bot command (like /start)</li>
              <li>Share their location with the bot</li>
            </ul>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsAddUserOpen(false)}>
                Got it
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
