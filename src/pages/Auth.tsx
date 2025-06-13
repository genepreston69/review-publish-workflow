
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { SignInForm } from '@/components/auth/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur max-w-sm mx-auto">
          <AuthHeader />
          
          <CardContent className="px-6 pb-6">
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin" className="space-y-4">
                <SignInForm isLoading={isLoading} setIsLoading={setIsLoading} />
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <SignUpForm isLoading={isLoading} setIsLoading={setIsLoading} />
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
