
import { BaseEditorStyles } from './BaseEditorStyles';
import { WidthConstraintStyles } from './WidthConstraintStyles';
import { EditModeStyles } from './EditModeStyles';
import { FullscreenStyles } from './FullscreenStyles';

export function CoreEditorStyles() {
  return (
    <>
      <BaseEditorStyles />
      <WidthConstraintStyles />
      <EditModeStyles />
      <FullscreenStyles />
    </>
  );
}
