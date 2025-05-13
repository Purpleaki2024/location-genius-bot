
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

// This is a simple redirect page to the login
const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page after a short delay
    const timer = setTimeout(() => {
      navigate('/login');
    }, 500);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Redirecting to login...</p>
    </div>
  );
};

export default Index;
