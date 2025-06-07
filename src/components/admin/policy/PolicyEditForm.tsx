import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Save, X, Loader2 } from 'lucide-react';
import { Policy } from './types';

interface PolicyEditFormProps {
  policyId: string;
  onPolicyUpdated: (policy: Policy) => void;
  onCancel: () => void;
}

export function PolicyEditForm({ policyId, onPolicyUpdated, onCancel }: PolicyEditFormProps) {
  const { currentUser, userRole } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPolicy, setIsLoadingPolicy] = useState(true);
  const [policy, setPolicy] = useState<Policy | null>(null);
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

  useEffect(() => {
    const loadPolicy = async () => {
      setIsLoadingPolicy(true);
      try {
        const { data, error } = await supabase
          .from('Policies')
          .select('*')
          .eq('id', policyId)
          .single();

        if (error) {
          console.error('Error fetching policy:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to load policy.",
          });
          return;
        }

        if (data) {
          setPolicy(data);
          setFormData({
            name: data.name || '',
            policy_type: data.policy_type || '',
            purpose: data.purpose || '',
            policy_text: data.policy_text || '',
            procedure: data.procedure || '',
            reviewer: data.reviewer || ''
          });
        }
      } catch (error) {
        console.error('Error fetching policy:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred.",
        });
      } finally {
        setIsLoadingPolicy(false);
      }
    };

    loadPolicy();
  }, [policyId, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectChange = (value: string, name: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('Policies')
        .update({
          ...formData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', policyId);

      if (error) {
        console.error('Error updating policy:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to update policy.",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Policy updated successfully.",
      });

      // Refresh the policy list
      const updatedPolicy = { ...policy, ...formData } as Policy;
      onPolicyUpdated(updatedPolicy);
    } catch (error) {
      console.error('Error updating policy:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!hasEditAccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Policy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You need edit access or higher to edit policies.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoadingPolicy || !policy) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Policy</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Policy Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter policy name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy_type">Policy Type</Label>
            <Select
              value={formData.policy_type}
              onValueChange={(value) => handleSelectChange(value, 'policy_type')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select policy type" />
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
              name="purpose"
              value={formData.purpose}
              onChange={handleInputChange}
              placeholder="Enter policy purpose"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="policy_text">Policy Text</Label>
            <Textarea
              id="policy_text"
              name="policy_text"
              value={formData.policy_text}
              onChange={handleInputChange}
              placeholder="Enter policy text"
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedure">Procedure</Label>
            <Textarea
              id="procedure"
              name="procedure"
              value={formData.procedure}
              onChange={handleInputChange}
              placeholder="Enter procedure"
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reviewer">Reviewer</Label>
            <Input
              id="reviewer"
              name="reviewer"
              type="email"
              value={formData.reviewer}
              onChange={handleInputChange}
              placeholder="Enter reviewer email"
            />
          </div>

          <div className="flex justify-between">
            <Button variant="ghost" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Policy
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
