
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const LoginForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        navigate("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
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
          <p>Available test users (all with password "password"):</p>
          <div className="flex justify-center gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => setUsername("admin")}>
              Admin
            </Button>
            <Button variant="outline" size="sm" onClick={() => setUsername("manager")}>
              Manager
            </Button>
            <Button variant="outline" size="sm" onClick={() => setUsername("user")}>
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
