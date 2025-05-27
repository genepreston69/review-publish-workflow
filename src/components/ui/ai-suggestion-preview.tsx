
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CheckCircle, XCircle, Edit3 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface AISuggestionPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  suggestedText: string;
  operationType: string;
  operationDescription: string;
  onAccept: (finalText: string) => void;
  onReject: () => void;
}

export function AISuggestionPreview({
  isOpen,
  onClose,
  originalText,
  suggestedText,
  operationType,
  operationDescription,
  onAccept,
  onReject,
}: AISuggestionPreviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(suggestedText);

  const handleAccept = () => {
    onAccept(isEditing ? editedText : suggestedText);
    setIsEditing(false);
    setEditedText(suggestedText);
  };

  const handleReject = () => {
    onReject();
    setIsEditing(false);
    setEditedText(suggestedText);
  };

  const handleClose = () => {
    onClose();
    setIsEditing(false);
    setEditedText(suggestedText);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleAccept();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleReject();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5" />
            AI Suggestion: {operationType}
          </DialogTitle>
          <DialogDescription>
            {operationDescription} - Review the changes and choose to accept or reject them.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
            {/* Original Text */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm text-muted-foreground">Original Text</h3>
              <div className="border rounded-md p-3 bg-gray-50 h-64 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{originalText}</p>
              </div>
            </div>

            {/* Suggested Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-muted-foreground">
                  {isEditing ? 'Edit Suggestion' : 'Suggested Text'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  disabled={!suggestedText}
                >
                  <Edit3 className="w-4 h-4 mr-1" />
                  {isEditing ? 'Preview' : 'Edit'}
                </Button>
              </div>
              
              {isEditing ? (
                <Textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="h-64 resize-none"
                  placeholder="Edit the suggested text..."
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <div className="border rounded-md p-3 bg-green-50 h-64 overflow-y-auto">
                  <p className="text-sm whitespace-pre-wrap">{suggestedText}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="text-xs text-muted-foreground">
              Tip: Press Ctrl+Enter to accept, Escape to reject
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReject}
                className="flex items-center gap-2"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </Button>
              <Button
                onClick={handleAccept}
                className="flex items-center gap-2"
                disabled={!suggestedText}
              >
                <CheckCircle className="w-4 h-4" />
                Accept {isEditing ? 'Edited' : ''} Changes
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
