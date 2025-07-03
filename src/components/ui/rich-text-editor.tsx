
import { useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { RichTextEditorCore } from './rich-text-editor/RichTextEditorCore';
import { ChangeTrackingIntegration } from './rich-text-editor/ChangeTrackingIntegration';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
  context?: string;
  showBottomToolbar?: boolean;
  isEditMode?: boolean;
  policyId?: string;
  fieldName?: string;
  showChangeTracking?: boolean;
  isNewPolicy?: boolean;
}

export function RichTextEditor({ 
  content, 
  onChange, 
  placeholder, 
  className, 
  context,
  showBottomToolbar = false,
  isEditMode = false,
  policyId,
  fieldName = 'content',
  showChangeTracking = false,
  isNewPolicy = false
}: RichTextEditorProps) {
  const { userRole } = useUserRole();
  const [trackingEnabled, setTrackingEnabled] = useState(false);

  const handleToggleTracking = () => {
    setTrackingEnabled(!trackingEnabled);
  };

  return (
    <div className="flex">
      <RichTextEditorCore
        content={content}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
        context={context}
        showBottomToolbar={showBottomToolbar}
        isEditMode={isEditMode}
        isNewPolicy={isNewPolicy}
        userRole={userRole || 'read-only'}
        trackingEnabled={trackingEnabled}
        onToggleTracking={handleToggleTracking}
      />

      {showChangeTracking && policyId && (
        <ChangeTrackingIntegration
          policyId={policyId}
          fieldName={fieldName}
          content={content}
          trackingEnabled={trackingEnabled}
          onChange={onChange}
        />
      )}
    </div>
  );
}
