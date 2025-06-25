
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { AssignmentHeader } from './assignment/AssignmentHeader';
import { AssignmentDialog } from './assignment/AssignmentDialog';
import { AssignmentTable } from './assignment/AssignmentTable';
import { useAssignmentData } from './assignment/useAssignmentData';
import { useAssignmentActions } from './assignment/useAssignmentActions';

export const AssignmentManagement = () => {
  const { assignments, editors, publishers, isLoading, fetchData } = useAssignmentData();
  const {
    isDialogOpen,
    setIsDialogOpen,
    selectedEditor,
    setSelectedEditor,
    selectedPublisher,
    setSelectedPublisher,
    createAssignment,
    deleteAssignment
  } = useAssignmentActions(fetchData);

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
      <AssignmentHeader onOpenDialog={() => setIsDialogOpen(true)} />
      <CardContent>
        <AssignmentTable
          assignments={assignments}
          onDeleteAssignment={deleteAssignment}
        />
      </CardContent>
      
      <AssignmentDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editors={editors}
        publishers={publishers}
        selectedEditor={selectedEditor}
        selectedPublisher={selectedPublisher}
        onEditorChange={setSelectedEditor}
        onPublisherChange={setSelectedPublisher}
        onCreateAssignment={createAssignment}
      />
    </Card>
  );
};
