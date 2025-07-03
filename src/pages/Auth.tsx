
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAzureAuth } from '@/hooks/auth/AzureAuthContext';
import { Loader2 } from 'lucide-react';
import { AuthHeader } from '@/components/auth/AuthHeader';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading } = useAuth();
  const { signIn } = useAzureAuth();

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

  const handleSignIn = async () => {
    if (isLoading) return; // Prevent multiple calls
    
    try {
      setIsLoading(true);
      await signIn();
    } catch (error) {
      console.error('Sign in failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur max-w-sm mx-auto">
          <AuthHeader />
          
          <CardContent className="px-6 pb-6">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Organizational Sign In
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Use your organizational Microsoft account to access the policy management system. Contact your system administrator if you need access.
                </p>
              </div>
              
              <Button 
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23" fill="currentColor">
                      <path d="M11.03 0v10.75H0V0h11.03zm11.25 0v10.75H11.53V0h10.75zm-11.25 11.53V23H0V11.53h11.03zm11.25 0V23H11.53V11.53h10.75z"/>
                    </svg>
                    Sign in with Microsoft
                  </>
                )}
              </Button>
              
              <div className="text-center">
                <p className="text-xs text-gray-500 mt-4">
                  Access is managed by your organization. New users must be added by system administrators.
                </p>
              </div>
            </div>
            
            <div className="mt-8 text-center text-xs text-slate-500">
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
