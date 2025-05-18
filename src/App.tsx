
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Locations from "./pages/Locations";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import { AuthProvider, useAuth, Permission } from "./contexts/AuthContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import TemplateMessageConfig from "./components/TemplateMessageConfig";
import AdminLocations from "./pages/admin/AdminLocations";
import Settings from "./pages/Settings";

// Protected route component
const ProtectedRoute = ({ 
  children, 
  requiredPermission 
}: { 
  children: React.ReactNode;
  requiredPermission?: keyof Permission;
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Only check permission if it's explicitly required
  if (requiredPermission && user?.permissions && !user?.permissions[requiredPermission]) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Layout component for authenticated routes
const DashboardLayout = ({ 
  children,
  requiredPermission
}: { 
  children: React.ReactNode;
  requiredPermission?: keyof Permission;
}) => {
  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
};

// AppRoutes component to use auth context
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Dashboard Routes */}
      <Route path="/dashboard" element={
        <DashboardLayout requiredPermission="viewDashboard">
          <Dashboard />
        </DashboardLayout>
      } />
      <Route path="/users" element={
        <DashboardLayout requiredPermission="manageUsers">
          <Users />
        </DashboardLayout>
      } />
      <Route path="/locations" element={
        <DashboardLayout>
          <Locations />
        </DashboardLayout>
      } />
      <Route path="/admin/locations" element={
        <DashboardLayout>
          <AdminLocations />
        </DashboardLayout>
      } />
      <Route path="/profile" element={
        <DashboardLayout>
          <Profile />
        </DashboardLayout>
      } />
      <Route path="/settings" element={
        <DashboardLayout requiredPermission="viewSettings">
          <Settings />
        </DashboardLayout>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  // Create a new QueryClient for every component instance 
  // This is important to prevent the hook error
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 30000
      }
    }
  });
  
  return (
    <BrowserRouter>
      <TooltipProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster position="top-right" />
          <AuthProvider>
            <SettingsProvider>
              <AppRoutes />
            </SettingsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </TooltipProvider>
    </BrowserRouter>
  );
};

export default App;
