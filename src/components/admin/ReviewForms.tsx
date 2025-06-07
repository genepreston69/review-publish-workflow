
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { FormList } from './form/FormList';
import { FormEditForm } from './form/FormEditForm';
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

export function ReviewForms() {
  const { userRole } = useAuth();
  // Optimize by filtering at database level
  const { forms, isLoadingForms, updateFormStatus, deleteForm, isAdmin } = useForms({
    statusFilter: ['draft', 'under-review', 'under review']
  });
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [viewingFormId, setViewingFormId] = useState<string | null>(null);

  const canPublish = userRole === 'publish' || userRole === 'admin';

  const handleEditForm = useCallback((formId: string) => {
    console.log('Edit form:', formId);
    setEditingFormId(formId);
    setViewingFormId(null);
  }, []);

  const handleViewForm = useCallback((formId: string) => {
    console.log('View form:', formId);
    setViewingFormId(formId);
    setEditingFormId(null);
  }, []);

  const handleFormUpdated = useCallback((updatedForm: Form) => {
    console.log('Form updated:', updatedForm);
    setEditingFormId(null);
    // The form list will automatically refresh from the database
  }, []);

  const handleCancelEdit = useCallback(() => {
    setEditingFormId(null);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewingFormId(null);
  }, []);

  if (!canPublish) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Review Forms</h2>
          <p className="text-muted-foreground">
            You need publish access or higher to review forms.
          </p>
        </div>
      </div>
    );
  }

  // Show edit form if editing a form
  if (editingFormId) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Form</h2>
          <p className="text-muted-foreground">
            Make changes to the form and save when ready.
          </p>
        </div>

        <FormEditForm
          formId={editingFormId}
          onFormUpdated={handleFormUpdated}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  // Find the viewing form data to pass to modal
  const viewingForm = forms.find(form => form.id === viewingFormId);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Review Forms</h2>
        <p className="text-muted-foreground">
          Review and approve forms for publication.
        </p>
      </div>

      <FormList
        forms={forms}
        isLoading={isLoadingForms}
        isEditor={false}
        canPublish={true}
        editingFormId={editingFormId}
        onUpdateStatus={updateFormStatus}
        onEdit={handleEditForm}
        onView={handleViewForm}
        onDelete={isAdmin ? deleteForm : undefined}
      />

      {viewingFormId && (
        <FormViewModal
          formId={viewingFormId}
          formData={viewingForm} // Pass form data to avoid duplicate fetch
          onClose={handleCloseView}
          onEdit={handleEditForm}
          onUpdateStatus={updateFormStatus}
        />
      )}
    </div>
  );
}
