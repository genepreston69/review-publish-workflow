
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser, isLoading: authLoading } = useAuth();

  // Redirect if user is already authenticated
  useEffect(() => {
    console.log('=== AUTH PAGE - USER STATE ===', { currentUser, authLoading });
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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signInEmail || !signInPassword) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please enter both email and password.",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      console.log('=== ATTEMPTING SIGN IN ===', { email: signInEmail });
      
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
        password: signInPassword,
      });

      if (error) {
        console.error('=== SIGN IN ERROR ===', error);
        
        let errorMessage = error.message;
        if (error.message.includes('Registration is by invitation only')) {
          errorMessage = 'Registration is by invitation only. Please contact an administrator to get access.';
        }
        
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: errorMessage,
        });
      } else {
        console.log('=== SIGN IN SUCCESSFUL ===');
        setSignInEmail('');
        setSignInPassword('');
      }
    } catch (error) {
      console.error('=== UNEXPECTED SIGN IN ERROR ===', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
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
              Sign in with your invited account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email" className="text-sm font-medium text-slate-700">
                  Email
                </Label>
                <Input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                  autoComplete="email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signin-password" className="text-sm font-medium text-slate-700">
                  Password
                </Label>
                <Input
                  id="signin-password"
                  type="password"
                  placeholder="Enter your password"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                  autoComplete="current-password"
                />
              </div>
              
              <Button 
                type="submit"
                disabled={isLoading}
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
            
            <div className="mt-6 text-center text-xs text-slate-500">
              <p>© 2025 Recovery Point West Virginia</p>
              <p className="mt-1">Invitation-only access system</p>
              <p className="mt-2 text-blue-600">
                Need access? Contact your administrator for an invitation.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
