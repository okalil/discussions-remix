export interface AuthProvider {
  name: string;
  createAuthorizationURL(state: string): string;
  getAccessToken(code: string): Promise<string>;
  getUser(token: string): Promise<AuthProviderUser>;
}

interface AuthProviderUser {
  id: string;
  name: string;
  image: string;
  email: string;
  emailVerified?: boolean;
}
