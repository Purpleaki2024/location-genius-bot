
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  MoreHorizontal, 
  UserCheck, 
  UserX, 
  Eye, 
  Shield, 
  Settings,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useUserManagement, useUpdateUserRole, useBlockUser } from "@/hooks/useUserManagement";
import { useTelegramUsers } from "@/hooks/useTelegramUsers";

interface UserTableProps {
  readOnly?: boolean;
  searchTerm?: string;
  roleFilter?: string;
}

const UserTable = ({ readOnly = false, searchTerm, roleFilter }: UserTableProps) => {
  const { user: currentUser } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const { 
    data: users, 
    isLoading, 
    error 
  } = useUserManagement(searchTerm, roleFilter);
  
  const updateRoleMutation = useUpdateUserRole();
  const blockUserMutation = useBlockUser();

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-purple-500 hover:bg-purple-600">Manager</Badge>;
      case 'user':
        return <Badge className="bg-green-500 hover:bg-green-600">User</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (readOnly) {
      toast.error("Read-only mode: Cannot modify users");
      return;
    }

    setSelectedUserId(userId);
    try {
      await updateRoleMutation.mutateAsync({ userId, role: newRole });
    } finally {
      setSelectedUserId(null);
    }
  };

  const handleBlockToggle = async (userId: string, currentRole: string) => {
    if (readOnly) {
      toast.error("Read-only mode: Cannot modify users");
      return;
    }

    if (currentRole === 'admin') {
      toast.error("Cannot block admin users");
      return;
    }

    setSelectedUserId(userId);
    try {
      const shouldBlock = currentRole !== 'blocked';
      await blockUserMutation.mutateAsync({ userId, block: shouldBlock });
    } finally {
      setSelectedUserId(null);
    }
  };

  const handleViewDetails = (user: any) => {
    toast.info(`Viewing details for ${user.username || user.first_name || 'User'}`);
    // In a real app, this would open a user detail modal
  };

  const canModifyUser = (userRole: string) => {
    if (!currentUser) return false;
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'manager' && userRole !== 'admin') return true;
    return false;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  const formatLastActive = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 30) return `${diffInDays}d ago`;
    return formatDate(dateString);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-destructive rounded-lg p-4">
        <p className="text-destructive">Error loading users: {error.message}</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="border border-border rounded-lg p-8 text-center">
        <p className="text-muted-foreground">No users found</p>
      </div>
    );
  }

  return (
    <div className="border border-border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Telegram ID</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="text-right">Requests Today</TableHead>
            <TableHead>Last Active</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map(user => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown'}</span>
                  {user.username && user.first_name && (
                    <span className="text-sm text-muted-foreground">
                      {user.first_name} {user.last_name}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="font-mono text-sm">{user.telegram_id}</TableCell>
              <TableCell>{getRoleBadge(user.role)}</TableCell>
              <TableCell className="text-right">{user.requests_today || 0}</TableCell>
              <TableCell>{formatLastActive(user.last_seen)}</TableCell>
              <TableCell>{formatDate(user.first_seen)}</TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={selectedUserId === user.id}>
                      {selectedUserId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoreHorizontal className="h-4 w-4" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>View Details</span>
                    </DropdownMenuItem>
                    
                    {!readOnly && canModifyUser(user.role) && (
                      <>
                        <DropdownMenuSeparator />
                        
                        {/* Role Management */}
                        {currentUser?.role === 'admin' && user.role !== 'admin' && (
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'manager')}>
                            <Shield className="mr-2 h-4 w-4" />
                            <span>Make Manager</span>
                          </DropdownMenuItem>
                        )}
                        
                        {(currentUser?.role === 'admin' || currentUser?.role === 'manager') && 
                         user.role !== 'user' && user.role !== 'admin' && (
                          <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'user')}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Make User</span>
                          </DropdownMenuItem>
                        )}
                        
                        {/* Block/Unblock */}
                        {user.role !== 'admin' && (
                          <DropdownMenuItem 
                            onClick={() => handleBlockToggle(user.id, user.role)}
                            className={user.role === 'blocked' ? 'text-green-600' : 'text-red-600'}
                          >
                            {user.role === 'blocked' ? (
                              <>
                                <UserCheck className="mr-2 h-4 w-4" />
                                <span>Unblock User</span>
                              </>
                            ) : (
                              <>
                                <UserX className="mr-2 h-4 w-4" />
                                <span>Block User</span>
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserTable;
