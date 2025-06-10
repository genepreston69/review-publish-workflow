
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Link, Plus, Trash2, Loader2 } from 'lucide-react';

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
  editor_name: string;
  publisher_name: string;
}

export const AssignmentManagement = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [editors, setEditors] = useState<User[]>([]);
  const [publishers, setPublishers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEditor, setSelectedEditor] = useState<string>('');
  const [selectedPublisher, setSelectedPublisher] = useState<string>('');
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Fetch assignments with user names
      const { data: assignmentData, error: assignmentError } = await supabase
        .from('assignment_relations')
        .select(`
          *,
          editor:profiles!assignment_relations_edit_user_id_fkey(name),
          publisher:profiles!assignment_relations_publish_user_id_fkey(name)
        `);

      if (assignmentError) throw assignmentError;

      const formattedAssignments = assignmentData.map(assignment => ({
        id: assignment.id,
        edit_user_id: assignment.edit_user_id,
        publish_user_id: assignment.publish_user_id,
        created_at: assignment.created_at,
        editor_name: assignment.editor?.name || 'Unknown',
        publisher_name: assignment.publisher?.name || 'Unknown'
      }));

      setAssignments(formattedAssignments);

      // Fetch all user roles first
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get user IDs for editors and publishers
      const editorUserIds = userRoles.filter(role => role.role === 'edit').map(role => role.user_id);
      const publisherUserIds = userRoles.filter(role => role.role === 'publish').map(role => role.user_id);

      // Fetch editor profiles
      if (editorUserIds.length > 0) {
        const { data: editorProfiles, error: editorError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', editorUserIds);

        if (editorError) throw editorError;
        setEditors(editorProfiles || []);
      } else {
        setEditors([]);
      }

      // Fetch publisher profiles
      if (publisherUserIds.length > 0) {
        const { data: publisherProfiles, error: publisherError } = await supabase
          .from('profiles')
          .select('id, name, email')
          .in('id', publisherUserIds);

        if (publisherError) throw publisherError;
        setPublishers(publisherProfiles || []);
      } else {
        setPublishers([]);
      }

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
      fetchData();
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

      fetchData();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete assignment.",
      });
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Editor-Publisher Assignments
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select Editor</label>
                  <Select value={selectedEditor} onValueChange={setSelectedEditor}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an editor" />
                    </SelectTrigger>
                    <SelectContent>
                      {editors.map(editor => (
                        <SelectItem key={editor.id} value={editor.id}>
                          {editor.name} ({editor.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Select Publisher</label>
                  <Select value={selectedPublisher} onValueChange={setSelectedPublisher}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a publisher" />
                    </SelectTrigger>
                    <SelectContent>
                      {publishers.map(publisher => (
                        <SelectItem key={publisher.id} value={publisher.id}>
                          {publisher.name} ({publisher.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={createAssignment} className="w-full">
                  Create Assignment
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Editor</TableHead>
                <TableHead>Publisher</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => (
                <TableRow key={assignment.id}>
                  <TableCell className="font-medium">{assignment.editor_name}</TableCell>
                  <TableCell>{assignment.publisher_name}</TableCell>
                  <TableCell>
                    {new Date(assignment.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteAssignment(assignment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {assignments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-gray-500 py-8">
                    No assignments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
