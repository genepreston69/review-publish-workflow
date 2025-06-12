
export interface AuthConfig {
  useMockAuth: boolean;
  mockUser: {
    id: string;
    name: string;
    email: string;
    role: 'read-only' | 'edit' | 'publish' | 'super-admin';
  };
}

export const authConfig: AuthConfig = {
  // Set to true to use mock authentication, false for real Supabase auth
  useMockAuth: process.env.NODE_ENV === 'development' || false,
  mockUser: {
    id: 'mock-user-12345',
    name: 'Mock User',
    email: 'mock@example.com',
    role: 'super-admin'
  }
};

// Helper to switch mock user roles for testing
export const setMockUserRole = (role: 'read-only' | 'edit' | 'publish' | 'super-admin') => {
  authConfig.mockUser.role = role;
};
