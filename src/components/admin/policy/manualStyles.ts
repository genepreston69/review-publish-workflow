
import { getPrintStyles } from './printStyles';
import { getPageStyles } from './pageStyles';
import { getContentStyles } from './contentStyles';

export const getManualStyles = (): string => {
  return `
    ${getPrintStyles()}
    
    * {
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Arial', 'Helvetica', sans-serif;
      font-size: 12pt;
      line-height: 1.4;
      color: #333;
      margin: 0;
      padding: 0;
      background: white;
    }
    
    ${getPageStyles()}
    ${getContentStyles()}
    
    @media screen {
      body {
        padding: 20px;
        max-width: 8.5in;
        margin: 0 auto;
        box-shadow: 0 0 20px rgba(0,0,0,0.1);
      }

      .page-footer {
        position: relative;
        bottom: auto;
        text-align: right;
        margin-top: 20px;
      }
      
      .policy-content {
        margin-bottom: 20px;
        flex: none;
      }

      .toc-content {
        flex: none;
        padding-bottom: 20px;
      }

      .toc-table-container {
        max-height: none;
      }
    }
  `;
};
