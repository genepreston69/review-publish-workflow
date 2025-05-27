
import { useState } from 'react';

export interface AISuggestion {
  originalText: string;
  suggestedText: string;
  operationType: string;
  operationDescription: string;
}

export function useAISuggestions() {
  const [currentSuggestion, setCurrentSuggestion] = useState<AISuggestion | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const showSuggestion = (suggestion: AISuggestion) => {
    setCurrentSuggestion(suggestion);
    setIsPreviewOpen(true);
  };

  const closeSuggestion = () => {
    setIsPreviewOpen(false);
    setCurrentSuggestion(null);
  };

  const clearSuggestion = () => {
    setCurrentSuggestion(null);
    setIsPreviewOpen(false);
  };

  return {
    currentSuggestion,
    isPreviewOpen,
    showSuggestion,
    closeSuggestion,
    clearSuggestion,
  };
}
