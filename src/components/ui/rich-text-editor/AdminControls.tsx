
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Trash2, Palette, FileDown, Loader2 } from 'lucide-react';
import {
  acceptAllChangesAndClean,
  acceptAllSuggestions,
  rejectAllSuggestions,
  removeAllFormatting,
  setTextToBlack,
  getCleanHTML,
  getPlainText,
  canAcceptChanges
} from './acceptChangesUtils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface AdminControlsProps {
  editor: any;
  userRole: string;
  onContentChange?: (content: string) => void;
  isNewPolicy?: boolean; // NEW: Flag to indicate if this is a new policy
  showControls?: boolean; // NEW: Manual override to show/hide controls
}

// Function to check if editor content has AI suggestions
const hasAISuggestions = (editor: any): boolean => {
  if (!editor) return false;
  
  const { state } = editor;
  const { doc } = state;
  let hasSuggestions = false;
  
  doc.descendants((node: any) => {
    if (node.marks) {
      const suggestionMark = node.marks.find(
        (mark: any) => mark.type.name === 'suggestion' || 
                      mark.type.name === 'addition' || 
                      mark.type.name === 'deletion'
      );
      if (suggestionMark) {
        hasSuggestions = true;
        return false; // Stop searching
      }
    }
  });
  
  return hasSuggestions;
};

export function AdminControls({
  editor,
  userRole,
  onContentChange,
  isNewPolicy = false,
  showControls = true
}: AdminControlsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const hasPermission = canAcceptChanges(userRole);
  const hasActiveSuggestions = hasAISuggestions(editor);
  
  // Don't show controls if:
  // 1. User doesn't have permission
  // 2. This is a new policy (no existing content to clean)
  // 3. Manual override is false
  // 4. No AI suggestions are present
  if (!hasPermission || isNewPolicy || !showControls || !hasActiveSuggestions) {
    return null;
  }

  const handleAcceptAllAndClean = async () => {
    if (!editor) return;
    
    setIsProcessing(true);
    try {
      const acceptedCount = acceptAllChangesAndClean(editor);
      
      if (onContentChange) {
        const cleanContent = getCleanHTML(editor);
        onContentChange(cleanContent);
      }
      
      toast({
        title: "Changes Processed",
        description: `All ${acceptedCount} changes accepted and formatting cleaned successfully!`,
      });
    } catch (error) {
      console.error('Error accepting changes:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was an error processing the changes. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptAll = () => {
    if (!editor) return;
    
    const acceptedCount = acceptAllSuggestions(editor);
    toast({
      title: "Suggestions Accepted",
      description: `${acceptedCount} suggestions accepted!`,
    });
  };

  const handleRejectAll = () => {
    if (!editor) return;
    
    const rejectedCount = rejectAllSuggestions(editor);
    toast({
      title: "Suggestions Rejected",
      description: `${rejectedCount} suggestions rejected!`,
    });
  };

  const handleSetToBlack = () => {
    if (!editor) return;
    
    setTextToBlack(editor);
    toast({
      title: "Text Color Updated",
      description: "All text set to black color!",
    });
  };

  const handleRemoveFormatting = () => {
    if (!editor) return;
    
    removeAllFormatting(editor);
    toast({
      title: "Formatting Removed",
      description: "All formatting removed, only plain text remains!",
    });
  };

  const handleExportClean = () => {
    if (!editor) return;
    
    const cleanHTML = getCleanHTML(editor);
    
    navigator.clipboard.writeText(cleanHTML).then(() => {
      toast({
        title: "Export Successful",
        description: "Clean HTML copied to clipboard!",
      });
    }).catch(() => {
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to copy to clipboard",
      });
    });
  };

  return (
    <div className="border-t border-gray-200 pt-4 mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-700">
          {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Controls
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-blue-600">
            {hasActiveSuggestions ? 'AI suggestions detected' : 'No suggestions found'}
          </span>
          {editor && (
            <span className="text-xs text-gray-500">
              Selection: {editor.state.selection.from}-{editor.state.selection.to}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Primary action - Accept all and clean */}
        <Button
          onClick={handleAcceptAllAndClean}
          disabled={isProcessing}
          className="bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Accept All & Clean
            </>
          )}
        </Button>

        {/* Individual actions */}
        <Button
          onClick={handleAcceptAll}
          variant="outline"
          size="sm"
          className="text-blue-600 border-blue-300 hover:bg-blue-50"
        >
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Accept All
        </Button>

        <Button
          onClick={handleRejectAll}
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          <XCircle className="w-4 h-4 mr-1" />
          Reject All
        </Button>

        <Button
          onClick={handleSetToBlack}
          variant="outline"
          size="sm"
          className="text-gray-600 border-gray-300 hover:bg-gray-50"
        >
          <Palette className="w-4 h-4 mr-1" />
          Set to Black
        </Button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remove Formatting
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove All Formatting</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove ALL formatting and keep only plain text. This action cannot be undone. Are you sure?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleRemoveFormatting}>
                Remove Formatting
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          onClick={handleExportClean}
          variant="outline"
          size="sm"
          className="text-purple-600 border-purple-300 hover:bg-purple-50"
        >
          <FileDown className="w-4 h-4 mr-1" />
          Export Clean
        </Button>
      </div>

      {/* Status indicator */}
      <div className="text-xs text-gray-500 mt-2">
        Editing mode: {isNewPolicy ? 'New Policy' : 'Existing Policy'} | 
        Suggestions: {hasActiveSuggestions ? 'Present' : 'None'} |
        {editor ? ` Selection: ${editor.state.selection.from}-${editor.state.selection.to}` : ' Editor not ready'}
      </div>
    </div>
  );
}
