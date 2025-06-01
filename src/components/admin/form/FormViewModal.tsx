
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Edit, CheckCircle, XCircle, Printer } from 'lucide-react';
import { useCallback } from 'react';
import { generatePrintTemplate } from './printUtils';
import { Form } from './FormSchema';

interface FormViewModalProps {
  formId: string;
  formData?: Form; // Optional prop to avoid duplicate fetches
  onClose: () => void;
  onEdit: (formId: string) => void;
  onUpdateStatus: (formId: string, newStatus: string) => void;
}

export function FormViewModal({ formId, formData, onClose, onEdit, onUpdateStatus }: FormViewModalProps) {
  const { data: form, isLoading } = useQuery({
    queryKey: ['form', formId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !formData, // Only fetch if formData is not provided
    initialData: formData, // Use provided form data as initial data
  });

  const handlePrint = useCallback(() => {
    if (!form?.form_content) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printHtml = generatePrintTemplate(form.form_content);

    printWindow.document.write(printHtml);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  }, [form?.form_content]);

  const handleEdit = useCallback(() => {
    onEdit(formId);
  }, [onEdit, formId]);

  const handlePublish = useCallback(() => {
    onUpdateStatus(formId, 'published');
  }, [onUpdateStatus, formId]);

  const handleUnpublish = useCallback(() => {
    onUpdateStatus(formId, 'draft');
  }, [onUpdateStatus, formId]);

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loading...</DialogTitle>
          </DialogHeader>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!form) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Form Not Found</DialogTitle>
          </DialogHeader>
          <p>The requested form could not be found.</p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            
            {form.status !== 'published' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePublish}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Publish
              </Button>
            )}

            {form.status === 'published' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnpublish}
                className="text-orange-600 hover:text-orange-700"
              >
                <XCircle className="w-4 h-4 mr-1" />
                Unpublish
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form Content Only */}
          {form.form_content && (
            <div 
              className="border rounded-lg p-4 bg-white min-h-[200px]"
              dangerouslySetInnerHTML={{ __html: form.form_content }}
            />
          )}

          {!form.form_content && (
            <div className="text-center py-8 text-gray-500">
              <p>No form content available.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
