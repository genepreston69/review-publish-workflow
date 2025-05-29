
import { Policy, ManualType } from './types';
import { fetchPoliciesByPrefix } from './policyFetcher';
import { generateManualHTML } from './manualGenerationUtils';
import { generatePreviewWindowHTML } from './previewWindowTemplate';
import { 
  createPrintWindow, 
  createPreviewWindow, 
  setupPrintWindow, 
  setupPreviewWindow 
} from './windowUtils';

export interface ManualGenerationResult {
  success: boolean;
  error?: string;
  policiesCount?: number;
}

export class ManualGenerationService {
  private static getCurrentDate(): string {
    const currentDate = new Date();
    return currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private static getPolicyPrefix(type: ManualType): string {
    return type === 'HR' ? 'HR' : 'RP';
  }

  static async fetchPoliciesForManual(type: ManualType): Promise<Policy[]> {
    const prefix = this.getPolicyPrefix(type);
    return await fetchPoliciesByPrefix(prefix);
  }

  static async generatePrintableManual(type: ManualType): Promise<ManualGenerationResult> {
    try {
      const policies = await this.fetchPoliciesForManual(type);

      if (policies.length === 0) {
        return {
          success: false,
          error: `No published ${type} policies found to generate manual.`
        };
      }

      const printWindow = createPrintWindow(type);
      if (!printWindow) {
        return {
          success: false,
          error: 'Unable to open print window. Please check your popup blocker.'
        };
      }

      const compilationDate = this.getCurrentDate();
      const manualHtml = generateManualHTML(type, policies, compilationDate);
      
      return new Promise((resolve) => {
        setupPrintWindow(printWindow, manualHtml, () => {
          resolve({
            success: true,
            policiesCount: policies.length
          });
        });
      });

    } catch (error) {
      console.error('Error generating manual:', error);
      return {
        success: false,
        error: `Failed to generate ${type} policy manual.`
      };
    }
  }

  static async generatePreviewManual(type: ManualType): Promise<ManualGenerationResult> {
    try {
      const policies = await this.fetchPoliciesForManual(type);

      if (policies.length === 0) {
        return {
          success: false,
          error: `No published ${type} policies found to preview manual.`
        };
      }

      const previewWindow = createPreviewWindow(type);
      if (!previewWindow) {
        return {
          success: false,
          error: 'Unable to open preview window. Please check your popup blocker.'
        };
      }

      const compilationDate = this.getCurrentDate();
      const manualHtml = generateManualHTML(type, policies, compilationDate);
      const previewHtml = generatePreviewWindowHTML(manualHtml, type);
      
      return new Promise((resolve) => {
        setupPreviewWindow(previewWindow, previewHtml, () => {
          resolve({
            success: true,
            policiesCount: policies.length
          });
        });
      });

    } catch (error) {
      console.error('Error previewing manual:', error);
      return {
        success: false,
        error: `Failed to preview ${type} policy manual.`
      };
    }
  }
}
