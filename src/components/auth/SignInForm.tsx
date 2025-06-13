
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface SignInFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const SignInForm = ({ isLoading, setIsLoading }: SignInFormProps) => {
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const { toast } = useToast();

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
  );
};
