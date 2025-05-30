
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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

  const getStatusBadgeVariant = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'under-review':
      case 'under review':
        return 'outline';
      default:
        return 'secondary';
    }
  };

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
            .form-header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1565c0;
              padding-bottom: 20px;
            }
            .form-title {
              font-size: 24px;
              font-weight: bold;
              color: #1565c0;
              margin-bottom: 10px;
              text-transform: uppercase;
            }
            .form-metadata {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
              padding: 20px;
              background-color: #f8f9fa;
              border-radius: 8px;
            }
            .metadata-item {
              margin-bottom: 10px;
            }
            .metadata-label {
              font-weight: bold;
              color: #666;
              font-size: 12px;
              text-transform: uppercase;
            }
            .metadata-value {
              font-size: 14px;
              margin-top: 4px;
            }
            .form-content {
              margin-top: 30px;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1565c0;
              margin: 30px 0 15px 0;
              text-transform: uppercase;
              border-bottom: 1px solid #1565c0;
              padding-bottom: 5px;
            }
            .content-section {
              margin-bottom: 30px;
              padding: 20px;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
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
          <div class="form-header">
            <div class="form-title">${form.name || 'Untitled Form'}</div>
            <div>Form Number: ${form.form_number || 'Not assigned'} | Type: ${form.form_type}</div>
          </div>

          <div class="form-metadata">
            ${form.purpose ? `
              <div class="metadata-item">
                <div class="metadata-label">Purpose</div>
                <div class="metadata-value">${form.purpose}</div>
              </div>
            ` : ''}
            ${form.reviewer ? `
              <div class="metadata-item">
                <div class="metadata-label">Reviewer</div>
                <div class="metadata-value">${form.reviewer}</div>
              </div>
            ` : ''}
            <div class="metadata-item">
              <div class="metadata-label">Created</div>
              <div class="metadata-value">${new Date(form.created_at).toLocaleDateString()}</div>
            </div>
            <div class="metadata-item">
              <div class="metadata-label">Status</div>
              <div class="metadata-value">${form.status || 'draft'}</div>
            </div>
          </div>

          ${form.form_content ? `
            <div class="form-content">
              <div class="section-title">Form Content</div>
              <div class="content-section">
                ${form.form_content}
              </div>
            </div>
          ` : ''}
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
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-xl">
                {form.name || 'Untitled Form'}
              </DialogTitle>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Form Number: {form.form_number || 'Not assigned'}</span>
                <span>Type: {form.form_type}</span>
                <Badge variant={getStatusBadgeVariant(form.status)}>
                  {form.status || 'draft'}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
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
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Form Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            {form.purpose && (
              <div>
                <strong className="text-sm text-gray-600">Purpose:</strong>
                <p className="text-sm">{form.purpose}</p>
              </div>
            )}
            {form.reviewer && (
              <div>
                <strong className="text-sm text-gray-600">Reviewer:</strong>
                <p className="text-sm">{form.reviewer}</p>
              </div>
            )}
            <div>
              <strong className="text-sm text-gray-600">Created:</strong>
              <p className="text-sm">{new Date(form.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <strong className="text-sm text-gray-600">Form Type:</strong>
              <p className="text-sm">{form.form_type}</p>
            </div>
          </div>

          {/* Form Content */}
          {form.form_content && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Form Content</h3>
              <div 
                className="border rounded-lg p-4 bg-white min-h-[200px]"
                dangerouslySetInnerHTML={{ __html: form.form_content }}
              />
            </div>
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
