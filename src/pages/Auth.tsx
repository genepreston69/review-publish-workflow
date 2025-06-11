
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useServerAuth } from '@/hooks/useServerAuth';
import { Loader2 } from 'lucide-react';
import { AuthHeader } from '@/components/auth/AuthHeader';
import { AuthFooter } from '@/components/auth/AuthFooter';
import { AuthTabs } from '@/components/auth/AuthTabs';
import { useTestAdmin } from '@/components/auth/useTestAdmin';

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { currentUser, isLoading: authLoading } = useServerAuth();
  const { createTestAdmin } = useTestAdmin();

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
          <CardHeader className="text-center pb-6 px-6">
            <AuthHeader />
            <CardTitle className="text-lg text-slate-700">Content Management System</CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Access your policy and form management dashboard
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <AuthTabs 
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              createTestAdmin={createTestAdmin}
            />
            <AuthFooter />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
