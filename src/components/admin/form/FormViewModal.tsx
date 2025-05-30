
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Edit, CheckCircle, XCircle } from 'lucide-react';

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
