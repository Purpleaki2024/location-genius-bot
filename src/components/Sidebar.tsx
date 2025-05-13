
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, MapPin, Settings, LogOut } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard", path: "/dashboard" },
    { icon: <Users size={20} />, label: "Users", path: "/users" },
    { icon: <MapPin size={20} />, label: "Locations", path: "/locations" },
    { icon: <Settings size={20} />, label: "Settings", path: "/settings" },
  ];

  return (
    <aside className="min-w-64 bg-sidebar h-full border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold flex items-center space-x-2">
          <MapPin className="text-primary" />
          <span>TeleLocator</span>
        </h1>
        <p className="text-sm text-muted-foreground">Admin Dashboard</p>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
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
        <button className="flex items-center space-x-3 px-3 py-2 w-full text-left rounded-md transition-colors hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
