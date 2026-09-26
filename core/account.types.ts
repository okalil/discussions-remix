export type CredentialsInput = {
  email: string;
  password: string;
};

export type CreateCredentialAccountInput = {
  name: string;
  email: string;
  password: string;
};

export type CreateCredentialAccountResult =
  | { ok: true; user: { id: number } }
  | { ok: false; error: 'email_taken' };

export type ResetPasswordInput = {
  email: string;
  password: string;
  token: string;
};

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; error: 'missing_token' | 'expired_token' | 'invalid_token' };

export type RequestPasswordResetInput = {
  email: string;
  resetPasswordPath: string;
};

export type LinkProviderAccountInput = {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  avatar?: string | null;
};

export type LinkProviderAccountResult =
  | { ok: true; user: { id: number } }
  | { ok: false; error: 'unverified_email' };
