
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SignUpFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const SignUpForm = ({ isLoading, setIsLoading }: SignUpFormProps) => {
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const { toast } = useToast();

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
      console.log('=== ATTEMPTING SIGN UP ===', { email: signUpEmail, name: signUpName });
      
      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password: signUpPassword,
        options: {
          data: {
            name: signUpName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('=== SIGN UP ERROR ===', error);
        toast({
          variant: "destructive",
          title: "Sign up failed",
          description: error.message,
        });
      } else {
        console.log('=== SIGN UP SUCCESSFUL ===', data);
        toast({
          title: "Account created!",
          description: "Please check your email for verification, or you can sign in immediately.",
        });
        // Clear the form
        setSignUpEmail('');
        setSignUpPassword('');
        setSignUpConfirmPassword('');
        setSignUpName('');
      }
    } catch (error) {
      console.error('=== UNEXPECTED SIGN UP ERROR ===', error);
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
  );
};
