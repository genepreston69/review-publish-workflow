
import { Button } from '@/components/ui/button';
import { CreatePolicyForm } from './CreatePolicyForm';

interface PolicyEditorCreateFormProps {
  onPolicyCreated: () => void;
  onBackToList: () => void;
}

export function PolicyEditorCreateForm({
  onPolicyCreated,
  onBackToList
}: PolicyEditorCreateFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create New Policy</h2>
          <p className="text-muted-foreground">
            Create a new policy that will be saved as draft.
          </p>
        </div>
        <Button variant="outline" onClick={onBackToList}>
          Back to My Policies
        </Button>
      </div>

      <CreatePolicyForm onPolicyCreated={onPolicyCreated} />
    </div>
  );
}
