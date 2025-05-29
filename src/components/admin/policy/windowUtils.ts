
import { MANUAL_CONSTANTS } from './manualConstants';

export const createPrintWindow = (type: string): Window | null => {
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.title = MANUAL_CONSTANTS.WINDOW_TITLES.print(type);
  }
  return printWindow;
};

export const createPreviewWindow = (type: string): Window | null => {
  const previewWindow = window.open('', '_blank', MANUAL_CONSTANTS.PREVIEW_WINDOW_OPTIONS);
  if (previewWindow) {
    previewWindow.document.title = MANUAL_CONSTANTS.WINDOW_TITLES.preview(type);
  }
  return previewWindow;
};

export const setupPrintWindow = (
  printWindow: Window, 
  manualHtml: string, 
  onComplete: () => void
): void => {
  printWindow.document.write(manualHtml);
  printWindow.document.close();
  
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
      onComplete();
    }, MANUAL_CONSTANTS.PRINT_DIALOG_DELAY);
  };
};

export const setupPreviewWindow = (
  previewWindow: Window, 
  previewHtml: string, 
  onComplete: () => void
): void => {
  previewWindow.document.write(previewHtml);
  previewWindow.document.close();
  onComplete();
};
