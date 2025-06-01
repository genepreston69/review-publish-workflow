
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface PolicyEditFormNotFoundProps {
  onCancel: () => void;
}

export function PolicyEditFormNotFound({ onCancel }: PolicyEditFormNotFoundProps) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <h3 className="mt-4 text-lg font-medium">Policy Not Found</h3>
          <p className="text-gray-500">The requested policy could not be found.</p>
          <Button onClick={onCancel} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
