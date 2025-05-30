
import { useState } from 'react';
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
  const { forms, isLoadingForms, updateFormStatus, deleteForm, isSuperAdmin } = useForms();
  const [editingFormId, setEditingFormId] = useState<string | null>(null);
  const [viewingFormId, setViewingFormId] = useState<string | null>(null);

  // Filter to show forms that need review
  const reviewForms = forms.filter(form => 
    form.status === 'draft' || 
    form.status === 'under-review' || 
    form.status === 'under review'
  );

  const canPublish = userRole === 'publish' || userRole === 'super-admin';

  const handleEditForm = (formId: string) => {
    console.log('Edit form:', formId);
    setEditingFormId(formId);
    setViewingFormId(null);
  };

  const handleViewForm = (formId: string) => {
    console.log('View form:', formId);
    setViewingFormId(formId);
    setEditingFormId(null);
  };

  const handleFormUpdated = (updatedForm: Form) => {
    console.log('Form updated:', updatedForm);
    setEditingFormId(null);
    // The form list will automatically refresh from the database
  };

  const handleCancelEdit = () => {
    setEditingFormId(null);
  };

  const handleCloseView = () => {
    setViewingFormId(null);
  };

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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Review Forms</h2>
        <p className="text-muted-foreground">
          Review and approve forms for publication.
        </p>
      </div>

      <FormList
        forms={reviewForms}
        isLoading={isLoadingForms}
        isEditor={false}
        canPublish={true}
        editingFormId={editingFormId}
        onUpdateStatus={updateFormStatus}
        onEdit={handleEditForm}
        onView={handleViewForm}
        onDelete={isSuperAdmin ? deleteForm : undefined}
      />

      {viewingFormId && (
        <FormViewModal
          formId={viewingFormId}
          onClose={handleCloseView}
          onEdit={handleEditForm}
          onUpdateStatus={updateFormStatus}
        />
      )}
    </div>
  );
}
