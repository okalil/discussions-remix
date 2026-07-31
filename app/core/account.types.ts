export interface CredentialsDto {
  email: string;
  password: string;
}

export interface CreateCredentialsAccountDto {
  name: string;
  email: string;
  password: string;
}

export interface ResetPasswordDto {
  email: string;
  password: string;
  token: string;
}

export interface DeliverResetPasswordLinkDto {
  email: string;
  path: string;
}
