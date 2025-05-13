
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UserHeaderProps {
  title: string;
}

const UserHeader = ({ title }: UserHeaderProps) => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-blue-500 ml-2">Admin</Badge>;
      case 'manager':
        return <Badge className="bg-green-500 ml-2">Manager</Badge>;
      case 'user':
        return <Badge variant="outline" className="ml-2">User</Badge>;
      default:
        return null;
    }
  };

  return (
    <header className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold flex items-center">
          {title}
          {getRoleBadge(user.role)}
        </h1>
        <p className="text-muted-foreground text-sm">
          Welcome back, {user.username}. You have full access to {user.role === 'admin' ? 'all' : 'some'} features.
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default UserHeader;
