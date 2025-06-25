
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editors: User[];
  publishers: User[];
  selectedEditor: string;
  selectedPublisher: string;
  onEditorChange: (value: string) => void;
  onPublisherChange: (value: string) => void;
  onCreateAssignment: () => void;
}

export function AssignmentDialog({
  isOpen,
  onOpenChange,
  editors,
  publishers,
  selectedEditor,
  selectedPublisher,
  onEditorChange,
  onPublisherChange,
  onCreateAssignment
}: AssignmentDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Select Editor</label>
            <Select value={selectedEditor} onValueChange={onEditorChange}>
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
            <Select value={selectedPublisher} onValueChange={onPublisherChange}>
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
          <Button onClick={onCreateAssignment} className="w-full">
            Create Assignment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
