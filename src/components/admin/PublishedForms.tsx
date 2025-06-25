
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FormList } from './form/FormList';
import { FormViewModal } from './form/FormViewModal';
import { useForms } from './form/useForms';

interface Form {
  id: string;
  name: string | null;
  form_number: string | null;
  form_content: string | null;
  form_type: string;
  purpose: string | null;
  reviewer: string | null;
  status: string | null;
  created_at: string;
}

export function PublishedForms() {
  const { userRole } = useAuth();
  // Only show published forms
  const { forms, isLoadingForms, updateFormStatus, deleteForm, isSuperAdmin } = useForms({
    statusFilter: ['published']
  });
  const [viewingFormId, setViewingFormId] = useState<string | null>(null);

  const handleViewForm = useCallback((formId: string) => {
    console.log('View form:', formId);
    setViewingFormId(formId);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewingFormId(null);
  }, []);

  // Find the viewing form data to pass to modal
  const viewingForm = forms.find(form => form.id === viewingFormId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Published Forms</h2>
        <p className="text-muted-foreground">
          View all published forms that are currently active.
        </p>
      </div>

      <FormList
        forms={forms}
        isLoading={isLoadingForms}
        isEditor={false}
        canPublish={userRole === 'publish' || userRole === 'super-admin'}
        editingFormId={null}
        onUpdateStatus={updateFormStatus}
        onEdit={() => {}} // No editing for published forms view
        onView={handleViewForm}
        onDelete={isSuperAdmin ? deleteForm : undefined}
      />

      {viewingFormId && (
        <FormViewModal
          formId={viewingFormId}
          formData={viewingForm}
          onClose={handleCloseView}
          onEdit={() => {}} // No editing from published forms view
          onUpdateStatus={updateFormStatus}
        />
      )}
    </div>
  );
}
