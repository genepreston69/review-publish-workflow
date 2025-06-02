
import { CoreEditorStyles } from './styles/CoreEditorStyles';
import { AIToolbarStyles } from './styles/AIToolbarStyles';
import { SuggestionStyles } from './styles/SuggestionStyles';
import { ListStyles } from './styles/ListStyles';
import { ResponsiveStyles } from './styles/ResponsiveStyles';
import { PrintStyles } from './styles/PrintStyles';

export function EditorStyles() {
  return (
    <>
      <CoreEditorStyles />
      <AIToolbarStyles />
      <SuggestionStyles />
      <ListStyles />
      <ResponsiveStyles />
      <PrintStyles />
    </>
  );
}
