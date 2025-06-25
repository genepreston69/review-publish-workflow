
import React from 'react';
import { diffWords } from 'diff';

interface DiffViewerProps {
  originalContent: string;
  modifiedContent: string;
  showSideBySide?: boolean;
}

export function DiffViewer({ originalContent, modifiedContent, showSideBySide = false }: DiffViewerProps) {
  const renderInlineDiff = () => {
    const diff = diffWords(originalContent, modifiedContent);
    
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium text-gray-700">Changes:</div>
        <div className="p-4 bg-gray-50 rounded-md whitespace-pre-wrap">
          {diff.map((part, index) => {
            const color = part.added ? 'bg-green-200 text-green-800' : 
                         part.removed ? 'bg-red-200 text-red-800' : '';
            
            return (
              <span key={index} className={color}>
                {part.value}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSideBySide = () => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Original</div>
          <div className="p-4 bg-red-50 rounded-md whitespace-pre-wrap text-sm border">
            {originalContent}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium text-gray-700 mb-2">Modified</div>
          <div className="p-4 bg-green-50 rounded-md whitespace-pre-wrap text-sm border">
            {modifiedContent}
          </div>
        </div>
      </div>
    );
  };

  return showSideBySide ? renderSideBySide() : renderInlineDiff();
}
