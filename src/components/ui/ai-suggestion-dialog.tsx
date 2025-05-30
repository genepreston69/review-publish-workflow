
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { CheckCircle, X, Wand2 } from 'lucide-react';

interface AISuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  originalText: string;
  suggestedText: string;
  operationName: string;
  operationDescription: string;
  onAccept: () => void;
  onReject: () => void;
}

export function AISuggestionDialog({
  open,
  onOpenChange,
  originalText,
  suggestedText,
  operationName,
  operationDescription,
  onAccept,
  onReject
}: AISuggestionDialogProps) {
  const handleAccept = () => {
    onAccept();
    onOpenChange(false);
  };

  const handleReject = () => {
    onReject();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-blue-600" />
            AI Suggestion: {operationName}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {operationDescription}. Review the changes below and choose whether to accept or reject the suggestion.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="grid grid-cols-2 gap-4 max-h-96 overflow-hidden">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 border-b pb-1">Original Text</h4>
            <div className="bg-gray-50 border rounded-md p-3 h-80 overflow-y-auto text-sm">
              <pre className="whitespace-pre-wrap font-sans">{originalText}</pre>
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-green-700 border-b pb-1">AI Suggestion</h4>
            <div className="bg-green-50 border border-green-200 rounded-md p-3 h-80 overflow-y-auto text-sm">
              <pre className="whitespace-pre-wrap font-sans">{suggestedText}</pre>
            </div>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleReject} className="flex items-center gap-2">
            <X className="w-4 h-4" />
            Reject
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleAccept} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
            <CheckCircle className="w-4 h-4" />
            Accept Changes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
