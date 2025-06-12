
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAzureAuth } from '@/hooks/useAzureAuth';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AzureAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, isLoading: authLoading, signIn } = useAzureAuth();

  // Redirect if user is already authenticated
  useEffect(() => {
    console.log('=== AZURE AUTH PAGE - USER STATE ===', { currentUser, authLoading });
    if (!authLoading && currentUser) {
      console.log('=== REDIRECTING TO MAIN PAGE ===');
      navigate('/');
    }
  }, [currentUser, authLoading, navigate]);

  // Show loading spinner while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-600" />
      </div>
    );
  }

  // Don't render auth form if user is authenticated
  if (currentUser) {
    return null;
  }

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn();
      toast({
        title: "Welcome!",
        description: "You have been signed in successfully.",
      });
    } catch (error) {
      console.error('Sign in error:', error);
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: "There was an error signing in. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur max-w-sm mx-auto">
          <CardHeader className="text-center pb-6 px-6">
            <div className="mx-auto mb-3">
              <img 
                src="/lovable-uploads/574646d6-6de7-444f-a9a2-327c1a816521.png" 
                alt="Recovery Point West Virginia" 
                className="h-16 w-auto mx-auto"
              />
            </div>
            <CardTitle className="text-lg text-slate-700">Content Management System</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Access your policy and form management dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <div className="space-y-4">
              <Button 
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in with Microsoft
              </Button>
              
              <div className="text-center text-xs text-slate-500">
                <p>Secure authentication through Microsoft Azure</p>
              </div>
            </div>
            
            <div className="mt-6 text-center text-xs text-slate-500">
              <p>© 2025 Recovery Point West Virginia</p>
              <p className="mt-1">Secure policy and compliance management</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AzureAuth;
