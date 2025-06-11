
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SignInForm } from './SignInForm';
import { SignUpForm } from './SignUpForm';

interface AuthTabsProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  createTestAdmin: () => Promise<void>;
}

export const AuthTabs = ({ isLoading, setIsLoading, createTestAdmin }: AuthTabsProps) => {
  return (
    <Tabs defaultValue="signin" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
        <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
      </TabsList>
      
      <TabsContent value="signin" className="space-y-4">
        <SignInForm 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          createTestAdmin={createTestAdmin}
        />
      </TabsContent>
      
      <TabsContent value="signup" className="space-y-4">
        <SignUpForm 
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      </TabsContent>
    </Tabs>
  );
};
