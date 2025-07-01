
import { Configuration, PopupRequest } from '@azure/msal-browser';

// Azure AD configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: 'dbe55234-a119-4722-bd7b-4e4c20e7864f',
    authority: 'https://login.microsoftonline.com/f9ef83c7-9c2b-4f21-bbd2-6772d6c83930',
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
