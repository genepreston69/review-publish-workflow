
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAssignmentActions(onDataChange: () => void) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<string>('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');
  const { toast } = useToast();

  const createAssignment = async () => {
    if (!selectedEditor || !selectedPublisher) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both an editor and a publisher.",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('assignment_relations')
        .insert({
          edit_user_id: selectedEditor,
          publish_user_id: selectedPublisher
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment created successfully.",
      });

      setIsDialogOpen(false);
      setSelectedEditor('');
      setSelectedPublisher('');
      onDataChange();
    } catch (error) {
      console.error('Error creating assignment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create assignment.",
      });
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    try {
      const { error } = await supabase
        .from('assignment_relations')
        .delete()
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Assignment deleted successfully.",
      });

      onDataChange();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete assignment.",
      });
    }
  };

  return {
    isDialogOpen,
    setIsDialogOpen,
    selectedEditor,
    setSelectedEditor,
    selectedPublisher,
    setSelectedPublisher,
    createAssignment,
    deleteAssignment
  };
}
