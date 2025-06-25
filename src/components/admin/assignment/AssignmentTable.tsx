
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

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

interface AssignmentTableProps {
  assignments: Assignment[];
  onDeleteAssignment: (assignmentId: string) => void;
}

export function AssignmentTable({ assignments, onDeleteAssignment }: AssignmentTableProps) {
  return (
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
              <TableCell className="font-medium">
                <div>
                  <div className="font-semibold">{assignment.editor.name}</div>
                  <div className="text-sm text-gray-500">{assignment.editor.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <div className="font-semibold">{assignment.publisher.name}</div>
                  <div className="text-sm text-gray-500">{assignment.publisher.email}</div>
                </div>
              </TableCell>
              <TableCell>
                {new Date(assignment.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDeleteAssignment(assignment.id)}
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
  );
}
