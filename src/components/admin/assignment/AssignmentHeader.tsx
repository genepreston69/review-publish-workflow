
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Link, Plus } from 'lucide-react';

interface AssignmentHeaderProps {
  onOpenDialog: () => void;
}

export function AssignmentHeader({ onOpenDialog }: AssignmentHeaderProps) {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">
        <CardTitle className="flex items-center gap-2">
          <Link className="w-5 h-5" />
          Editor-Publisher Assignments
        </CardTitle>
        <Button onClick={onOpenDialog}>
          <Plus className="w-4 h-4 mr-2" />
          New Assignment
        </Button>
      </div>
    </CardHeader>
  );
}
