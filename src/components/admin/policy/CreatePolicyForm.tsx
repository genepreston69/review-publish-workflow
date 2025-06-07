import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Save, Send } from 'lucide-react';

interface CreatePolicyFormProps {
  onPolicyCreated: () => void;
}

export function CreatePolicyForm({ onPolicyCreated }: CreatePolicyFormProps) {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    policy_type: '',
    purpose: '',
    policy_text: '',
    procedure: '',
    reviewer: ''
  });

  // Check if user has edit access
  const hasEditAccess = userRole === 'edit' || userRole === 'publish' || userRole === 'admin';

  if (!hasEditAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need edit access or higher to create policies.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('Policies')
        .insert({
          ...formData,
          creator_id: currentUser?.id,
          status: 'draft',
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating policy:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to create policy.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Policy created successfully.",
      });

      // Reset form
      setFormData({
        name: '',
        policy_type: '',
        purpose: '',
        policy_text: '',
        procedure: '',
        reviewer: ''
      });

      onPolicyCreated();
    } catch (error) {
      console.error('Error creating policy:', error);
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
    <Card>
      <CardHeader>
        <CardTitle>Create New Policy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Policy Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter policy name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy_type">Policy Type</Label>
            <Select
              value={formData.policy_type}
              onValueChange={(value) => setFormData({ ...formData, policy_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a policy type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="RP">RP</SelectItem>
                <SelectItem value="S">S</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Textarea
              id="purpose"
              placeholder="Enter the purpose of the policy"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy_text">Policy Text</Label>
            <Textarea
              id="policy_text"
              placeholder="Enter the policy text"
              value={formData.policy_text}
              onChange={(e) => setFormData({ ...formData, policy_text: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedure">Procedure</Label>
            <Textarea
              id="procedure"
              placeholder="Enter the procedure"
              value={formData.procedure}
              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewer">Reviewer Email</Label>
            <Input
              id="reviewer"
              type="email"
              placeholder="Enter reviewer email"
              value={formData.reviewer}
              onChange={(e) => setFormData({ ...formData, reviewer: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => {
              setFormData({
                name: '',
                policy_type: '',
                purpose: '',
                policy_text: '',
                procedure: '',
                reviewer: ''
              });
            }}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Policy
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
