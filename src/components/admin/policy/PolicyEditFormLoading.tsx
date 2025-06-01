
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function PolicyEditFormLoading() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-2 text-gray-500">Loading policy...</p>
        </div>
      </CardContent>
    </Card>
  );
}
