
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, MapPin, Settings, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  // Define navigation items with permission requirements
  const navItems = [
    { 
      icon: <LayoutDashboard size={20} />, 
      label: "Dashboard", 
      path: "/dashboard",
      requiredPermission: "viewDashboard"
    },
    { 
      icon: <Users size={20} />, 
      label: "Users", 
      path: "/users",
      requiredPermission: "manageUsers"
    },
    { 
      icon: <MapPin size={20} />, 
      label: "Locations", 
      path: "/locations",
      requiredPermission: "manageLocations"
    },
    { 
      icon: <Settings size={20} />, 
      label: "Settings", 
      path: "/settings",
      requiredPermission: "viewSettings"
    },
  ];

  // Filter items based on user permissions
  const filteredNavItems = navItems.filter(item => 
    user?.permissions[item.requiredPermission as keyof typeof user.permissions]
  );

  return (
    <aside className="min-w-64 bg-sidebar h-full border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <MapPin className="text-primary" />
          <span>TeleLocator</span>
        </h1>
        <p className="text-sm text-muted-foreground">Admin Dashboard</p>
      </div>
      
      {/* User Profile Section */}
      {user && (
        <div className="p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{user.username}</p>
              <div className="flex items-center">
                <Shield className="h-3 w-3 text-primary mr-1" />
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                  isActive(item.path)
                    ? "bg-primary/10 text-primary font-medium"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-border">
        <button 
          className="flex items-center space-x-3 px-3 py-2 w-full text-left rounded-md transition-colors hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
          onClick={logout}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
