
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("password"); // Default to 'password' for easier testing
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log("Attempting login with:", { username, password });
      const success = await login(username, password);
      console.log("Login result:", success);
      
      if (success) {
        toast.success(`Welcome back, ${username}!`);
        navigate("/dashboard");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pre-fill user selection to make testing easier
  const handleUserSelect = (selectedUsername: string) => {
    setUsername(selectedUsername);
    setPassword("password"); // All test users have this password
    toast.info(`Selected user: ${selectedUsername} (password: password)`);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">TeleLocator Admin</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p className="mb-2">Available test users (all with password "password"):</p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleUserSelect("admin")}>
              Admin
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleUserSelect("manager")}>
              Manager
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleUserSelect("user")}>
              User
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="justify-center text-xs text-muted-foreground">
        &copy; 2025 TeleLocator. All rights reserved.
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
