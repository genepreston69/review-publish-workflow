
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Check, X, Loader2 } from 'lucide-react';

interface EditUserNameFormProps {
  userId: string;
  currentName: string;
  onNameUpdated: () => void;
}

export const EditUserNameForm = ({ userId, currentName, onNameUpdated }: EditUserNameFormProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!newName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Name cannot be empty.",
      });
      return;
    }

    if (newName.trim() === currentName) {
      setIsEditing(false);
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: newName.trim() })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "User name updated successfully.",
      });

      setIsEditing(false);
      onNameUpdated();
    } catch (error: any) {
      console.error('Error updating name:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update user name. Please try again.",
      });
      setNewName(currentName); // Reset to original name
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNewName(currentName);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="h-8 text-sm"
          disabled={isLoading}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={handleSave}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Check className="h-3 w-3" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCancel}
          disabled={isLoading}
          className="h-8 w-8 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="font-medium">{currentName}</span>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsEditing(true)}
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Edit className="h-3 w-3" />
      </Button>
    </div>
  );
};
