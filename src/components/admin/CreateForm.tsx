
import { useAuth } from '@/hooks/useAuth';
import { CreateFormForm } from './form/CreateFormForm';
import { useForms } from './form/useForms';

export function CreateForm() {
  const { userRole } = useAuth();
  const { isLoadingForms } = useForms();

  const hasEditAccess = userRole === 'edit' || userRole === 'publish' || userRole === 'admin';

  if (!hasEditAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Form</h2>
          <p className="text-muted-foreground">
            You need edit access or higher to create forms.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Form</h2>
        <p className="text-muted-foreground">
          Create a new form with automatic numbering. {userRole === 'edit' ? 'Your form will be saved as a draft and assigned to a publisher for review.' : 'Your form will be created for review.'}
        </p>
      </div>

      <CreateFormForm />
    </div>
  );
}
