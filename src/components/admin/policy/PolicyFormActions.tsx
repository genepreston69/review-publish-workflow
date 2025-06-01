
import { Button } from '@/components/ui/button';

interface PolicyFormActionsProps {
  isLoading: boolean;
  submitLabel: string;
  onCancel?: () => void;
}

export function PolicyFormActions({ isLoading, submitLabel, onCancel }: PolicyFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      )}
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Saving...' : submitLabel}
      </Button>
    </div>
  );
}
