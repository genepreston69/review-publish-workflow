
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAzureAuth } from '@/hooks/auth/AzureAuthContext';
import { Loader2, CheckCircle, LogOut } from 'lucide-react';
import { AuthHeader } from '@/components/auth/AuthHeader';

const Logout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { signOut } = useAzureAuth();

  useEffect(() => {
    // If user is not authenticated, redirect to auth page
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    // Auto-logout after component mounts
    const performLogout = async () => {
      setIsLoggingOut(true);
      try {
        await signOut();
        setIsLoggedOut(true);
        
        // Redirect to auth page after 2 seconds
        setTimeout(() => {
          navigate('/auth');
        }, 2000);
      } catch (error) {
        console.error('Logout failed:', error);
        setIsLoggingOut(false);
      }
    };

    performLogout();
  }, [currentUser, navigate, signOut]);

  const handleManualRedirect = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur max-w-sm mx-auto">
          <AuthHeader />
          
          <CardContent className="px-6 pb-6">
            <div className="space-y-6 text-center">
              {isLoggingOut && !isLoggedOut && (
                <>
                  <div className="flex justify-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Signing Out
                    </h2>
                    <p className="text-sm text-gray-600">
                      Please wait while we sign you out safely...
                    </p>
                  </div>
                </>
              )}

              {isLoggedOut && (
                <>
                  <div className="flex justify-center">
                    <CheckCircle className="h-12 w-12 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Signed Out Successfully
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      You have been successfully signed out. Redirecting to sign in page...
                    </p>
                    <Button 
                      onClick={handleManualRedirect}
                      variant="outline"
                      size="sm"
                    >
                      Go to Sign In
                    </Button>
                  </div>
                </>
              )}

              {!isLoggingOut && !isLoggedOut && (
                <>
                  <div className="flex justify-center">
                    <LogOut className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Logout Failed
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      There was an issue signing you out. Please try again.
                    </p>
                    <Button 
                      onClick={handleManualRedirect}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Return to Sign In
                    </Button>
                  </div>
                </>
              )}
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

export default Logout;
