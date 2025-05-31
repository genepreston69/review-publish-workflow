import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Edit, CheckCircle, XCircle, Printer } from 'lucide-react';

interface FormViewModalProps {
  formId: string;
  onClose: () => void;
  onEdit: (formId: string) => void;
  onUpdateStatus: (formId: string, newStatus: string) => void;
}

export function FormViewModal({ formId, onClose, onEdit, onUpdateStatus }: FormViewModalProps) {
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
  });

  const handlePrint = () => {
    if (!form) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Form - ${form.name || 'Untitled Form'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .form-content {
              margin: 0;
              padding: 0;
            }
            @media print {
              body {
                margin: 0;
                padding: 20px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${form.form_content ? `
            <div class="form-content">
              ${form.form_content}
            </div>
          ` : '<p>No form content available.</p>'}
        </body>
      </html>
    `;

    printWindow.document.write(printHtml);
    printWindow.document.close();
    
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    };
  };

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
              onClick={() => onEdit(formId)}
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            
            {form.status !== 'published' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(formId, 'published')}
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
                onClick={() => onUpdateStatus(formId, 'draft')}
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
