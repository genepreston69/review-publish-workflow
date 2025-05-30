
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Form } from './FormSchema';

interface FormListProps {
  forms: Form[];
  isLoading: boolean;
  isEditor: boolean;
  canPublish: boolean;
  editingFormId: string | null;
  onUpdateStatus: (formId: string, newStatus: string) => void;
  onEdit: (formId: string) => void;
  onView: (formId: string) => void;
  onDelete?: (formId: string) => void;
}

export function FormList({
  forms,
  isLoading,
  isEditor,
  canPublish,
  editingFormId,
  onUpdateStatus,
  onEdit,
  onView,
  onDelete,
}: FormListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (forms.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No forms found for review.</p>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <div className="space-y-4">
      {forms.map((form) => (
        <Card key={form.id} className={editingFormId === form.id ? 'ring-2 ring-blue-500' : ''}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-lg">
                  {form.name || 'Untitled Form'}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Form Number: {form.form_number || 'Not assigned'}</span>
                  <span>•</span>
                  <span>Type: {form.form_type}</span>
                </div>
                <Badge variant={getStatusBadgeVariant(form.status)}>
                  {form.status || 'draft'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(form.id)}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </Button>
                
                {(isEditor || canPublish) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(form.id)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}

                {canPublish && form.status !== 'published' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStatus(form.id, 'published')}
                    className="text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Publish
                  </Button>
                )}

                {canPublish && form.status === 'published' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateStatus(form.id, 'draft')}
                    className="text-orange-600 hover:text-orange-700"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Unpublish
                  </Button>
                )}

                {onDelete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(form.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              {form.purpose && (
                <p><strong>Purpose:</strong> {form.purpose}</p>
              )}
              {form.reviewer && (
                <p><strong>Reviewer:</strong> {form.reviewer}</p>
              )}
              <p><strong>Created:</strong> {new Date(form.created_at).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
