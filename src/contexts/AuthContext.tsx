
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Define user roles and permissions
export type UserRole = "admin" | "manager" | "user" | "guest";

export interface Permission {
  viewDashboard: boolean;
  manageUsers: boolean;
  manageLocations: boolean;
  viewSettings: boolean;
  editSettings: boolean;
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  permissions: Permission;
  avatar?: string;
  email?: string;
}

// Default permissions per role
const rolePermissions: Record<UserRole, Permission> = {
  admin: {
    viewDashboard: true,
    manageUsers: true,
    manageLocations: true,
    viewSettings: true,
    editSettings: true,
  },
  manager: {
    viewDashboard: true,
    manageUsers: true,
    manageLocations: true,
    viewSettings: true,
    editSettings: false,
  },
  user: {
    viewDashboard: true,
    manageUsers: false,
    manageLocations: false,
    viewSettings: true,
    editSettings: false,
  },
  guest: {
    viewDashboard: true,
    manageUsers: false,
    manageLocations: false,
    viewSettings: false,
    editSettings: false,
  },
};

// Sample users for demonstration
const sampleUsers: User[] = [
  {
    id: "1",
    username: "admin",
    role: "admin",
    permissions: rolePermissions.admin,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
    email: "admin@example.com",
  },
  {
    id: "2",
    username: "manager",
    role: "manager",
    permissions: rolePermissions.manager,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager",
    email: "manager@example.com",
  },
  {
    id: "3",
    username: "user",
    role: "user",
    permissions: rolePermissions.user,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user",
    email: "user@example.com",
  },
];

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  // Check for saved user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse saved user", error);
        localStorage.removeItem("user");
      }
    }
  }, []);
  
  const login = async (username: string, password: string): Promise<boolean> => {
    // The authentication logic
    if (password !== "password") {
      toast.error("Invalid credentials");
      return false;
    }
    
    // Find user by username
    const foundUser = sampleUsers.find(u => u.username === username);
    
    if (foundUser) {
      setUser(foundUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(foundUser));
      toast.success(`Welcome back, ${foundUser.username}!`);
      return true;
    } else if (username === "admin") {
      // Fallback for original "admin" user
      const adminUser = sampleUsers[0];
      setUser(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem("user", JSON.stringify(adminUser));
      toast.success("Welcome back, admin!");
      return true;
    }
    
    toast.error("User not found");
    return false;
  };
  
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    navigate("/login");
    toast.info("You have been logged out");
  };
  
  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
