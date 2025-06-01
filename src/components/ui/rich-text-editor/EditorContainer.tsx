
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EditorContainerProps {
  isEditMode: boolean;
  className?: string;
  children: ReactNode;
}

export function EditorContainer({ isEditMode, className, children }: EditorContainerProps) {
  return (
    <div className={cn(
      "border rounded-md transition-colors",
      isEditMode && "border-orange-300 ring-1 ring-orange-200 bg-orange-50/30",
      className
    )}>
      {isEditMode && (
        <div className="px-3 py-2 border-b border-orange-200 bg-orange-100/50">
          <span className="text-xs font-medium text-orange-700">Edit Mode Active</span>
        </div>
      )}
      {children}
    </div>
  );
}
