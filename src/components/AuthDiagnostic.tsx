
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useMsal } from '@azure/msal-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';

interface ProfileData {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

export function AuthDiagnostic() {
  const { accounts } = useMsal();
  const auth = useAuth();
  const { userRole, isLoading: roleLoading } = useUserRole();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const azureAccount = accounts[0];

  useEffect(() => {
    const fetchProfile = async () => {
      if (!azureAccount?.username) return;
      
      setProfileLoading(true);
      setProfileError(null);
      
      try {
        console.log('=== FETCHING PROFILE FOR EMAIL ===', azureAccount.username);
        
        // Join profiles with user_roles to get role information
        const { data: profile, error } = await supabase
          .from('profiles')
          .select(`
            id, 
            email, 
            name, 
            created_at,
            user_roles(role)
          `)
          .eq('email', azureAccount.username)
          .maybeSingle();

        if (error) {
          console.error('=== PROFILE FETCH ERROR ===', error);
          setProfileError(error.message);
          return;
        }

        console.log('=== PROFILE FETCH RESULT ===', profile);
        
        if (profile) {
          const profileWithRole = {
            id: profile.id,
            email: profile.email,
            name: profile.name,
            created_at: profile.created_at,
            role: (profile.user_roles as any)?.[0]?.role || 'read-only'
          };
          setProfileData(profileWithRole);
        } else {
          setProfileData(null);
        }
      } catch (error) {
        console.error('=== PROFILE FETCH EXCEPTION ===', error);
        setProfileError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [azureAccount?.username]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Diagnostic</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Azure AD Account Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Azure AD Account</h3>
          {azureAccount ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Email:</strong> {azureAccount.username || 'N/A'}
              </div>
              <div>
                <strong>Name:</strong> {azureAccount.name || 'N/A'}
              </div>
              <div>
                <strong>Local Account ID:</strong> {azureAccount.localAccountId || 'N/A'}
              </div>
              <div>
                <strong>Home Account ID:</strong> {azureAccount.homeAccountId || 'N/A'}
              </div>
            </div>
          ) : (
            <Badge variant="destructive">No Azure AD account found</Badge>
          )}
        </div>

        <Separator />

        {/* Supabase User Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Supabase User</h3>
          {auth.currentUser ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>ID:</strong> {auth.currentUser.id || 'N/A'}
              </div>
              <div>
                <strong>Email:</strong> {auth.currentUser.email || 'N/A'}
              </div>
              <div>
                <strong>Auth Loading:</strong> {auth.isLoading ? 'Yes' : 'No'}
              </div>
              <div>
                <strong>Session Exists:</strong> {auth.session ? 'Yes' : 'No'}
              </div>
            </div>
          ) : (
            <Badge variant="destructive">No Supabase user found</Badge>
          )}
        </div>

        <Separator />

        {/* Profile Data from Database */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Profile from Database</h3>
          {profileLoading ? (
            <Badge variant="secondary">Loading profile...</Badge>
          ) : profileError ? (
            <Badge variant="destructive">Error: {profileError}</Badge>
          ) : profileData ? (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>ID:</strong> {profileData.id}
              </div>
              <div>
                <strong>Email:</strong> {profileData.email}
              </div>
              <div>
                <strong>Name:</strong> {profileData.name}
              </div>
              <div>
                <strong>Role:</strong> <Badge variant="outline">{profileData.role}</Badge>
              </div>
              <div>
                <strong>Created At:</strong> {new Date(profileData.created_at).toLocaleString()}
              </div>
            </div>
          ) : (
            <Badge variant="destructive">No profile found in database</Badge>
          )}
        </div>

        <Separator />

        {/* User Role Hook Result */}
        <div>
          <h3 className="text-lg font-semibold mb-3">useUserRole Hook Result</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>User Role:</strong> {roleLoading ? (
                <Badge variant="secondary">Loading...</Badge>
              ) : userRole ? (
                <Badge variant="outline">{userRole}</Badge>
              ) : (
                <Badge variant="destructive">No role found</Badge>
              )}
            </div>
            <div>
              <strong>Role Loading:</strong> {roleLoading ? 'Yes' : 'No'}
            </div>
          </div>
        </div>

        <Separator />

        {/* Debug Summary */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Debug Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <strong>Azure AD Connected:</strong>
              {azureAccount ? (
                <Badge variant="default">✓ Yes</Badge>
              ) : (
                <Badge variant="destructive">✗ No</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <strong>Supabase User:</strong>
              {auth.currentUser ? (
                <Badge variant="default">✓ Yes</Badge>
              ) : (
                <Badge variant="destructive">✗ No</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <strong>Profile in DB:</strong>
              {profileData ? (
                <Badge variant="default">✓ Yes</Badge>
              ) : (
                <Badge variant="destructive">✗ No</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <strong>User Role:</strong>
              {userRole ? (
                <Badge variant="default">✓ {userRole}</Badge>
              ) : (
                <Badge variant="destructive">✗ No role</Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
