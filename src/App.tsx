
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Locations from "./pages/Locations";
import NotFound from "./pages/NotFound";
import Sidebar from "./components/Sidebar";
import { AuthProvider, useAuth, Permission } from "./contexts/AuthContext";

const queryClient = new QueryClient();

type PermissionKey = keyof Permission;

// Protected route component
const ProtectedRoute = ({ 
  children, 
  requiredPermission 
}: { 
  children: React.ReactNode;
  requiredPermission?: PermissionKey;
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !user?.permissions[requiredPermission]) {
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
  requiredPermission?: PermissionKey;
}) => {
  return (
    <ProtectedRoute requiredPermission={requiredPermission}>
      <div className="flex h-screen">
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
        <DashboardLayout requiredPermission="manageLocations">
          <Locations />
        </DashboardLayout>
      } />
      <Route path="/settings" element={
        <DashboardLayout requiredPermission="viewSettings">
          <div className="p-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-2">Settings page is under construction.</p>
          </div>
        </DashboardLayout>
      } />
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster position="top-right" />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
