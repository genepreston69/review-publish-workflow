
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';

interface PolicyFormHeaderProps {
  userRole: string;
}

export function PolicyFormHeader({ userRole }: PolicyFormHeaderProps) {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Plus className="w-5 h-5" />
        New Policy Form
      </CardTitle>
      <CardDescription>
        Fill out the form below to create a new facility policy. The policy number will be automatically generated based on the selected policy type.
        {userRole === 'edit' && (
          <span className="block mt-2 text-sm text-blue-600">
            Note: Your policy will be created as a draft and will need to be reviewed before publication.
          </span>
        )}
        {(userRole === 'publish' || userRole === 'super-admin') && (
          <span className="block mt-2 text-sm text-green-600">
            Note: Your policy will be submitted for review and can be published by another reviewer.
          </span>
        )}
      </CardDescription>
    </CardHeader>
  );
}
