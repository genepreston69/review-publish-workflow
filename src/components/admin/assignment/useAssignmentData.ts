
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Assignment {
  id: string;
  edit_user_id: string;
  publish_user_id: string;
  created_at: string;
  editor: {
    name: string;
    email: string;
  };
  publisher: {
    name: string;
    email: string;
  };
}

export function useAssignmentData() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editors, setEditors] = useState<User[]>([]);
  const [publishers, setPublishers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch assignments with proper joins to get both editor and publisher details
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignment_relations')
        .select(`
          id,
          edit_user_id,
          publish_user_id,
          created_at,
          editor:profiles!assignment_relations_edit_user_id_fkey(name, email),
          publisher:profiles!assignment_relations_publish_user_id_fkey(name, email)
        `);

      if (assignmentError) {
        console.error('Assignment fetch error:', assignmentError);
        throw assignmentError;
      }

      console.log('Raw assignment data:', assignmentData);

      // Transform the data to ensure proper structure
      const formattedAssignments = assignmentData?.map(assignment => ({
        id: assignment.id,
        edit_user_id: assignment.edit_user_id,
        publish_user_id: assignment.publish_user_id,
        created_at: assignment.created_at,
        editor: {
          name: assignment.editor?.name || 'Unknown',
          email: assignment.editor?.email || 'Unknown'
        },
        publisher: {
          name: assignment.publisher?.name || 'Unknown',
          email: assignment.publisher?.email || 'Unknown'
        }
      })) || [];

      console.log('Formatted assignments:', formattedAssignments);
      setAssignments(formattedAssignments);

      // Fetch users who could be editors (edit role)
      const { data: editorProfiles, error: editorError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'edit');

      if (editorError) {
        console.error('Editor fetch error:', editorError);
        throw editorError;
      }

      setEditors(editorProfiles || []);

      // Fetch users who could be publishers (publish role)
      const { data: publisherProfiles, error: publisherError } = await supabase
        .from('profiles')
        .select('id, name, email')
        .eq('role', 'publish');

      if (publisherError) {
        console.error('Publisher fetch error:', publisherError);
        throw publisherError;
      }

      setPublishers(publisherProfiles || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load assignment data.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    assignments,
    editors,
    publishers,
    isLoading,
    fetchData
  };
}
