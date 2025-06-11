
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadInvitation = async () => {
      if (!token) {
        toast({
          variant: "destructive",
          title: "Invalid Link",
          description: "This invitation link is invalid.",
        });
        navigate('/auth');
        return;
      }

      try {
        // Try to fetch invitation using raw SQL since the types might not be updated yet
        const { data, error } = await supabase
          .rpc('get_invitation_by_token', { p_token: token });

        if (error) {
          console.error('Error fetching invitation:', error);
          // Fallback: try direct query
          const { data: directData, error: directError } = await supabase
            .from('invitations')
            .select('*')
            .eq('token', token)
            .is('accepted_at', null)
            .gt('expires_at', new Date().toISOString())
            .single();

          if (directError || !directData) {
            toast({
              variant: "destructive",
              title: "Invalid or Expired Invitation",
              description: "This invitation link is invalid or has expired.",
            });
            navigate('/auth');
            return;
          }

          setInvitation(directData);
        } else {
          setInvitation(data);
        }
      } catch (error) {
        console.error('Error loading invitation:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load invitation details.",
        });
        navigate('/auth');
      } finally {
        setIsLoading(false);
      }
    };

    loadInvitation();
  }, [token, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your full name.",
      });
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Password must be at least 6 characters long.",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Passwords do not match.",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Mark invitation as accepted using RPC or direct update
        try {
          await supabase.rpc('accept_invitation', { p_token: token });
        } catch (rpcError) {
          // Fallback: direct update
          await supabase
            .from('invitations')
            .update({ accepted_at: new Date().toISOString() })
            .eq('token', token);
        }

        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });

        // Redirect to main app
        navigate('/');
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      
      let errorMessage = "Failed to create your account. Please try again.";
      
      if (error.message?.includes('already registered')) {
        errorMessage = "An account with this email already exists. Please try logging in instead.";
      }
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Accept Invitation</CardTitle>
          <p className="text-center text-gray-600">
            You've been invited to join the Policy Management System
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={invitation?.email || ''}
                disabled
                className="bg-gray-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a password (min 6 characters)"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Accept Invitation & Create Account'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AcceptInvitation;
