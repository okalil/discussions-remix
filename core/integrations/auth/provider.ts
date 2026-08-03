export interface AuthProvider {
  name: string;
  createAuthorizationURL(state: string): string;
  getAccessToken(code: string): Promise<string>;
  getUser(token: string): Promise<AuthProviderUser>;
}

interface AuthProviderUser {
  id: string;
  name: string;
  avatar: string;
  email: string;
  emailVerified?: boolean;
}
