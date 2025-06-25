
import { Button } from '@/components/ui/button';
import { PolicyEditForm } from './PolicyEditForm';
import { Policy } from './types';

interface PolicyEditorEditFormProps {
  editingPolicyId: string;
  onPolicyUpdated: (policy: Policy) => void;
  onCancel: () => void;
}

export function PolicyEditorEditForm({
  editingPolicyId,
  onPolicyUpdated,
  onCancel
}: PolicyEditorEditFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Policy</h2>
          <p className="text-muted-foreground">
            Make changes to your policy and save when ready.
          </p>
        </div>
        <Button variant="outline" onClick={onCancel}>
          Back to My Policies
        </Button>
      </div>

      <PolicyEditForm
        policyId={editingPolicyId}
        onPolicyUpdated={onPolicyUpdated}
        onCancel={onCancel}
      />
    </div>
  );
}
