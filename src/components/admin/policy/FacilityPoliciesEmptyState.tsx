
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export function FacilityPoliciesEmptyState() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium">No published policies found</h3>
          <p className="text-gray-500">No facility policies have been published yet.</p>
        </div>
      </CardContent>
    </Card>
  );
}
