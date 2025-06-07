
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
  
  // Separate state for sign-in form
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Separate state for sign-up form
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpEmail || !signUpPassword || !signUpName || !signUpConfirmPassword) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all fields.",
      });
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "Passwords do not match.",
      });
      return;
    }
    
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            name: signUpName,
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.message,
        });
      } else {
        toast({
          title: "Account created!",
          description: "Please check your email for verification.",
        });
        // Clear the form
        setSignUpEmail('');
        setSignUpPassword('');
        setSignUpConfirmPassword('');
        setSignUpName('');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
        toast({
          variant: "destructive",
          title: "Sign in failed",
          description: error.message,
        });
      } else {
        console.log('=== SIGN IN SUCCESSFUL ===');
        // Clear the form
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
              <div className="text-xl font-bold text-slate-800 mb-1">
                RECOVERY<span className="text-blue-600">POINT</span>
              </div>
              <div className="text-xs text-slate-600 font-medium">WEST VIRGINIA</div>
            </div>
            <CardTitle className="text-lg text-slate-700">Content Management System</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Access your policy and form management dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
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
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <input type="checkbox" className="rounded border-slate-300" />
                      <span>Remember me</span>
                    </div>
                    <button type="button" className="text-blue-600 hover:text-blue-800 font-medium bg-transparent border-none cursor-pointer">
                      Forgot password?
                    </button>
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
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name" className="text-sm font-medium text-slate-700">
                      Full Name
                    </Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Enter your full name"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                      autoComplete="name"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-sm font-medium text-slate-700">
                      Email
                    </Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                      autoComplete="email"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-sm font-medium text-slate-700">
                      Password
                    </Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Create a password"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm" className="text-sm font-medium text-slate-700">
                      Confirm Password
                    </Label>
                    <Input
                      id="signup-confirm"
                      type="password"
                      placeholder="Confirm your password"
                      value={signUpConfirmPassword}
                      onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                      className="h-11 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                      autoComplete="new-password"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
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

export default Auth;
