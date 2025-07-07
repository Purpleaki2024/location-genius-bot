
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Users, BarChart3, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Location Management",
      description: "Add, edit, and manage locations with detailed information and ratings."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "User Management", 
      description: "Manage users, roles, and permissions with comprehensive admin tools."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Analytics Dashboard",
      description: "Track usage statistics, popular locations, and user engagement metrics."
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Bot Configuration",
      description: "Configure Telegram bot settings, templates, and automated responses."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <MapPin className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">TeleLocator</h1>
          </div>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Powerful location management dashboard for your Telegram bot. 
            Manage locations, users, and analytics all in one place.
          </p>
          
          {/* Quick Login Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 max-w-md mx-auto">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Login</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div><strong>Admin:</strong> admin / password</div>
              <div><strong>Manager:</strong> manager / password</div>
              <div><strong>User:</strong> user / password</div>
            </div>
          </div>

          <Button 
            onClick={handleGetStarted}
            size="lg" 
            className="px-8 py-3 text-lg"
          >
            {isAuthenticated ? "Go to Dashboard" : "Get Started"}
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="text-primary mb-2">{feature.icon}</div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current User Status */}
        {isAuthenticated && user && (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Welcome Back!</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center mb-4">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt="Avatar" 
                  className="h-16 w-16 rounded-full"
                />
              </div>
              <p className="text-lg font-semibold">{user.username}</p>
              <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="mt-4"
              >
                Continue to Dashboard
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;
