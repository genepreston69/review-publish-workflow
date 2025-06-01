
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PolicyNumberDisplay } from './PolicyNumberDisplay';

interface PolicyEditFormHeaderProps {
  policyNumber: string | null;
  onCancel: () => void;
}

export function PolicyEditFormHeader({ policyNumber, onCancel }: PolicyEditFormHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            Edit Policy
          </CardTitle>
          <CardDescription>
            Update the policy information below. Changes will be saved with updated timestamp.
          </CardDescription>
          {policyNumber && (
            <PolicyNumberDisplay policyNumber={policyNumber} />
          )}
        </div>
        <Button variant="outline" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Cancel
        </Button>
      </div>
    </CardHeader>
  );
}
