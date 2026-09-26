import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { sql } from 'remix/data-table';

import type {
  CreateCredentialAccountInput,
  CreateCredentialAccountResult,
  CredentialsInput,
  LinkProviderAccountInput,
  LinkProviderAccountResult,
  RequestPasswordResetInput,
  ResetPasswordInput,
  ResetPasswordResult,
} from './account.types.ts';
import type { Database } from './integrations/db.ts';
import { queryOne } from './integrations/db/query.ts';
import { schema } from './integrations/db/schema.ts';
import type { Mailer } from './integrations/mailer.ts';
import { ResetPasswordLink } from './integrations/mailer/templates/reset-password-link.tsx';
import { ResetPasswordSuccess } from './integrations/mailer/templates/reset-password-success.tsx';

export class AccountService {
  constructor(
    private db: Database,
    private mailer: Mailer,
  ) {}

  /* CREDENTIAL ACCOUNT */

  async getUserByCredentials({ email, password }: CredentialsInput) {
    const row = await queryOne<UserIdAndPasswordRow>(
      this.db,
      sql`
        SELECT u.id, a.password
        FROM users u
        INNER JOIN accounts a ON a.user_id = u.id AND a.type = 'credential'
        WHERE u.email = ${email}
        LIMIT 1
      `,
    );
    if (!row?.password) return null;
    if (!(await this.verifyPassword(password, row.password))) return null;
    return { id: row.id };
  }

  async createCredentialAccount({
    name,
    email,
    password,
  }: CreateCredentialAccountInput): Promise<CreateCredentialAccountResult> {
    const existing = await this.db.findOne(schema.users, { where: { email } });
    if (existing) return { ok: false, error: 'email_taken' };

    const hashedPassword = await this.hashPassword(password);

    const user = await this.db.transaction(async (db) => {
      const user = await db.create(
        schema.users,
        { email, name },
        { returnRow: true },
      );
      await db.create(schema.accounts, {
        type: 'credential',
        password: hashedPassword,
        user_id: user.id,
      });
      return user;
    });
    return { ok: true, user };
  }

  async requestPasswordReset({
    email,
    resetPasswordPath,
  }: RequestPasswordResetInput) {
    const user = await this.db.findOne(schema.users, { where: { email } });
    if (!user) return;

    const token = await this.createVerificationToken(user.email);

    await this.mailer.send({
      to: user.email,
      subject: 'Discussions, Password Reset',
      template: ResetPasswordLink,
      props: {
        email: user.email,
        resetPasswordPath,
        token,
      },
    });
  }

  async resetPassword({
    email,
    password,
    token,
  }: ResetPasswordInput): Promise<ResetPasswordResult> {
    const verificationToken = await this.getVerificationToken(email);

    if (!verificationToken) {
      return { ok: false, error: 'missing_token' };
    }
    if (new Date(verificationToken.expires) < new Date()) {
      return { ok: false, error: 'expired_token' };
    }

    const isValid = await this.verifyPassword(token, verificationToken.token);
    if (!isValid) {
      return { ok: false, error: 'invalid_token' };
    }

    const hashedPassword = await this.hashPassword(password);

    await this.updatePassword(verificationToken.identifier, hashedPassword);
    await this.deleteVerificationToken(verificationToken.token);

    await this.mailer.send({
      to: email,
      subject: 'Discussions, Password Successfully Reset',
      template: ResetPasswordSuccess,
      props: { email },
    });

    return { ok: true };
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

  async linkProviderAccount({
    provider,
    providerAccountId,
    email,
    name,
    avatar,
  }: LinkProviderAccountInput): Promise<LinkProviderAccountResult> {
    let user = await this.db.findOne(schema.users, {
      where: { email },
    });
    const account = await this.db.findOne(schema.accounts, {
      where: {
        provider_account_id: providerAccountId,
        provider,
      },
    });
    if (account && user) return { ok: true, user };

    // If there is already a signed-up user with the same email and that user is not verified,
    // prevent linking to avoid hijacking an unverified account.
    if (user && !user.email_verified) {
      return { ok: false, error: 'unverified_email' };
    }

    user = await this.db.transaction(async (db) => {
      if (!user) {
        user = await db.create(
          schema.users,
          {
            email,
            name,
            avatar,
            email_verified: false,
          },
          { returnRow: true },
        );
      }

      await db.create(schema.accounts, {
        type: 'oauth',
        provider,
        provider_account_id: providerAccountId,
        user_id: user.id,
      });

      return user;
    });

    return { ok: true, user };
  }
}

type UserIdAndPasswordRow = {
  id: number;
  password: string | null;
};
