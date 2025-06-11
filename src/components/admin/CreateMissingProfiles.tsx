
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertTriangle, Loader2, UserPlus } from 'lucide-react';

interface CreateMissingProfilesProps {
  onProfilesCreated: () => void;
}

export const CreateMissingProfiles = ({ onProfilesCreated }: CreateMissingProfilesProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const createMissingProfiles = async () => {
    setIsCreating(true);
    try {
      console.log('=== ATTEMPTING TO CREATE MISSING PROFILES ===');
      
      // Try to create profiles for known missing users
      const missingUsers = [
        { 
          id: '16b758d8-f5bf-4374-b8d4-b69c2f9e731b', 
          email: 'gp@rpwv.org', 
          name: 'GP User' 
        },
        { 
          id: '81771318-4fcf-4de3-82e4-0423cd5d6957', 
          email: 'admin@test.com', 
          name: 'Test Admin' 
        }
      ];

      for (const user of missingUsers) {
        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();

        if (!existingProfile) {
          console.log(`Creating profile for ${user.email}`);
          
          const { error } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name: user.name,
              email: user.email,
              role: 'read-only'
            });

          if (error) {
            console.error(`Error creating profile for ${user.email}:`, error);
          } else {
            console.log(`Successfully created profile for ${user.email}`);
          }
        } else {
          console.log(`Profile already exists for ${user.email}`);
        }
      }

      toast({
        title: "Success",
        description: "Missing profiles have been created successfully.",
      });

      onProfilesCreated();
    } catch (error) {
      console.error('=== ERROR CREATING MISSING PROFILES ===', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create missing profiles.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="w-5 h-5" />
          Missing User Profiles Detected
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-orange-700 mb-4">
          Some users exist in authentication but don't have profiles. This can happen when users 
          were created before the profile system was set up properly.
        </p>
        <Button 
          onClick={createMissingProfiles}
          disabled={isCreating}
          className="bg-orange-600 hover:bg-orange-700"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating Profiles...
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Create Missing Profiles
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
