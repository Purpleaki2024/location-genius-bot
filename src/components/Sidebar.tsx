
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import {
  MenuIcon,
  LayoutDashboard,
  User,
  Users,
  Mail,
  MapPin,
  Settings,
  LogOut,
  ChevronDown,
} from "lucide-react";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  title: string;
  onClick?: () => void;
  isNested?: boolean;
  permission?: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, title, onClick, isNested = false, permission }) => {
  const { user } = useAuth();
  const location = useLocation();
  const isActive = location.pathname === to;
  
  // Check permission
  if (permission && user && !user.permissions[permission as keyof typeof user.permissions]) {
    return null;
  }
  
  return (
    <NavLink to={to} onClick={onClick} className="block">
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-base transition-all hover:bg-accent",
          isActive ? "bg-accent text-foreground" : "text-muted-foreground",
          isNested ? "pl-10" : ""
        )}
      >
        {icon}
        {title}
      </div>
    </NavLink>
  );
};

const Sidebar = () => {
  const isMobile = useMobile();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [messageOpen, setMessageOpen] = useState(false);

  // Content for the sidebar
  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          <span className="font-semibold">TeleLocator</span>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <nav className="px-2 py-4">
          {/* Dashboard */}
          <NavItem
            to="/dashboard"
            icon={<LayoutDashboard size={20} />}
            title="Dashboard"
            permission="viewDashboard"
          />
          
          {/* User Management */}
          <NavItem
            to="/users"
            icon={<Users size={20} />}
            title="Users"
            permission="manageUsers"
          />
          
          {/* Locations */}
          <NavItem
            to="/locations"
            icon={<MapPin size={20} />}
            title="Locations"
            permission="manageLocations"
          />
          
          {/* Messaging */}
          <Collapsible
            open={messageOpen}
            onOpenChange={setMessageOpen}
            className="mt-2"
          >
            <CollapsibleTrigger className="w-full">
              <div
                className="flex items-center justify-between w-full rounded-lg px-3 py-2 text-base text-muted-foreground transition-all hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <Mail size={20} />
                  <span>Messaging</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`transition-transform ${
                    messageOpen ? "rotate-180" : ""
                  }`}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1">
              <NavItem
                to="/settings"
                icon={<Settings size={20} />}
                title="Templates"
                isNested
                permission="viewSettings"
              />
            </CollapsibleContent>
          </Collapsible>
          
          {/* Profile */}
          <NavItem
            to="/profile"
            icon={<User size={20} />}
            title="My Profile"
          />

          <Separator className="my-4" />

          {/* Settings */}
          {user?.permissions.viewSettings && (
            <NavItem
              to="/settings"
              icon={<Settings size={20} />}
              title="Settings"
            />
          )}
          
          {/* Logout */}
          <div
            className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-base text-muted-foreground hover:bg-accent"
            onClick={() => logout()}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </div>
        </nav>
      </ScrollArea>
      
      {/* User profile section */}
      <div className="mt-auto border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 overflow-hidden">
              <img 
                src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "guest"}`} 
                alt="Avatar" 
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <div className="text-sm font-medium">{user?.username || "Guest"}</div>
              <div className="text-xs text-muted-foreground capitalize">{user?.role || "Not logged in"}</div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
            <Settings size={16} />
          </Button>
        </div>
      </div>
    </div>
  );

  // Mobile sidebar uses Sheet component
  if (isMobile) {
    return (
      <Sheet>
        <SheetTrigger asChild className="absolute left-4 top-4 z-10">
          <Button variant="outline" size="icon">
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop sidebar
  return (
    <div className="hidden border-r bg-card lg:block lg:w-[300px] h-screen">
      <SidebarContent />
    </div>
  );
};

export default Sidebar;
