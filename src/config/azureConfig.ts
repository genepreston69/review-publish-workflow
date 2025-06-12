
import { Configuration, PublicClientApplication } from '@azure/msal-browser';

// Azure AD B2C configuration
export const msalConfig: Configuration = {
  auth: {
    clientId: 'YOUR_CLIENT_ID', // Replace with your Azure AD B2C application ID
    authority: 'https://YOUR_TENANT.b2clogin.com/YOUR_TENANT.onmicrosoft.com/B2C_1_signupsignin', // Replace with your tenant and user flow
    knownAuthorities: ['YOUR_TENANT.b2clogin.com'], // Replace with your tenant
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: 'localStorage',
    storeAuthStateInCookie: false,
  },
};

// Create MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Login request configuration
export const loginRequest = {
  scopes: ['openid', 'profile', 'email'],
};

// Token request configuration for API calls
export const tokenRequest = {
  scopes: ['https://YOUR_TENANT.onmicrosoft.com/api/read'], // Replace with your API scope
};
