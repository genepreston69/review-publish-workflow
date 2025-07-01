
import { Configuration, PopupRequest } from '@azure/msal-browser';

// Azure AD configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'your-client-id',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'your-tenant-id'}`,
    redirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

// Scopes for login request
export const loginRequest: PopupRequest = {
  scopes: ['User.Read', 'profile', 'email', 'openid'],
};

// Graph API endpoint to get user info
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};
