import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

import { env } from '../env.ts';
import type {
  CreateCredentialsAccountDto,
  CredentialsDto,
  ResetPasswordDto,
} from './account.types.ts';
import type { AuthProvider } from './integrations/auth/provider.ts';
import type { DatabaseClient } from './integrations/db.ts';
import { schema } from './integrations/db/schema.ts';
import type { EmailClient } from './integrations/email.ts';
import { ResetPasswordLink } from './integrations/email/templates/reset-password-link.tsx';
import { ResetPasswordSuccess } from './integrations/email/templates/reset-password-success.tsx';

export class AccountService {
  private providers: Map<string, AuthProvider> = new Map();

  constructor(
    private db: DatabaseClient,
    private mailer: EmailClient,
    private authProviders: AuthProvider[],
  ) {
    this.providers = new Map(
      authProviders.map((provider) => [provider.name, provider]),
    );
  }

  /* CREDENTIAL ACCOUNT */

  async getUserByCredentials({ email, password }: CredentialsDto) {
    const user = await this.db.findOne(schema.users, { where: { email } });
    if (!user) return null;

    const account = await this.db.findOne(schema.accounts, {
      where: { type: 'credential', user_id: user.id },
    });
    if (!account?.password) return null;

    const isValid = await this.verifyPassword(password, account.password);
    if (!isValid) return null;

    return user;
  }

  async createCredentialAccount({
    name,
    email,
    password,
  }: CreateCredentialsAccountDto) {
    const hashedPassword = await this.hashPassword(password);

    const user = await this.db.create(
      schema.users,
      { email, name },
      { returnRow: true },
    );
    await this.db.create(schema.accounts, {
      type: 'credential',
      password: hashedPassword,
      user_id: user.id,
    });

    return user;
  }

  async forgetPassword(email: string) {
    const token = await this.createVerificationToken(email);
    await this.mailer.send({
      to: email,
      subject: 'Discussions, Password Reset',
      template: ResetPasswordLink({
        baseUrl: env.SITE_URL,
        email,
        token,
      }),
    });
  }

  async resetPassword({ email, password, token }: ResetPasswordDto) {
    const verificationToken = await this.getVerificationToken(email);

    if (
      !verificationToken ||
      new Date(verificationToken.expires) < new Date()
    ) {
      return false;
    }

    const isValid = await this.verifyPassword(token, verificationToken.token);
    if (!isValid) {
      return false;
    }

    const hashedPassword = await this.hashPassword(password);

    await this.updatePassword(verificationToken.identifier, hashedPassword);
    await this.deleteVerificationToken(verificationToken.token);

    await this.mailer.send({
      to: email,
      subject: 'Discussions, Password Successfully Reset',
      template: ResetPasswordSuccess({
        baseUrl: env.SITE_URL,
        email,
      }),
    });

    return true;
  }

  private async updatePassword(email: string, password: string) {
    const user = await this.db.findOne(schema.users, { where: { email } });
    if (!user) return;

    await this.db.updateMany(
      schema.accounts,
      { password },
      { where: { type: 'credential', user_id: user.id } },
    );
  }

  private async createVerificationToken(email: string) {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    const token = crypto.randomBytes(32).toString('hex');

    await this.db.create(schema.verificationTokens, {
      identifier: email,
      expires: expiresAt.toISOString(),
      token: await this.hashPassword(token),
    });

    return token;
  }

  private async getVerificationToken(email: string) {
    return this.db.findOne(schema.verificationTokens, {
      where: { identifier: email },
      orderBy: ['expires', 'desc'],
    });
  }

  private async deleteVerificationToken(token: string) {
    await this.db.delete(schema.verificationTokens, token);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword);
    } catch {
      return false;
    }
  }

  /* PROVIDERS ACCOUNTS */

  createProviderAuthorizationURL(provider: string, state: string) {
    const providerApi = this.providers.get(provider);
    if (!providerApi) throw new Error('Invalid Provider');

    const url = providerApi.createAuthorizationURL(state);
    return url;
  }

  async linkProviderAccount(provider: string, code: string) {
    const providerApi = this.providers.get(provider);
    if (!providerApi) throw new Error('Invalid Provider');

    const accessToken = await providerApi.getAccessToken(code);
    const providerUser = await providerApi.getUser(accessToken);

    let user = await this.db.findOne(schema.users, {
      where: { email: providerUser.email },
    });
    const account = await this.db.findOne(schema.accounts, {
      where: {
        provider_account_id: providerUser.id,
        provider,
      },
    });
    if (account && user) return user;

    // If there is already a signed-up user with the same email and that user is not verified,
    // prevent linking to avoid hijacking an unverified account.
    if (user && !user.email_verified) {
      throw new Error('Email already in use by an unverified account');
    }

    // If user is not found, create a new one
    if (!user) {
      user = await this.db.create(
        schema.users,
        {
          email: providerUser.email,
          name: providerUser.name,
          image: providerUser.image,
          email_verified: providerUser.emailVerified ?? false,
        },
        { returnRow: true },
      );
    }

    // Create provider account
    await this.db.create(
      schema.accounts,
      {
        type: 'oauth',
        provider: provider,
        provider_account_id: providerUser.id,
        user_id: user.id,
      },
      { returnRow: true },
    );

    return user;
  }
}
