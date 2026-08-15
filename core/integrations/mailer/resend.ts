import { Resend } from 'resend';

import {
  Mailer,
  type MailerConfig,
  type MailerTransport,
  type MailerTransportMessage,
} from '../mailer.ts';

class ResendMailerTransport implements MailerTransport {
  #resend: Resend;

  constructor(apiKey: string) {
    this.#resend = new Resend(apiKey);
  }

  async send({
    from,
    to,
    subject,
    react,
  }: MailerTransportMessage): Promise<void> {
    const response = await this.#resend.emails.send({
      from,
      to,
      subject,
      react,
    });
    if (response.error) throw response.error;
  }
}

/** A {@link Mailer} backed by Resend. */
export class ResendMailer extends Mailer {
  /**
   * Creates a Resend-backed mailer.
   * @param apiKey Resend API key.
   * @param options Mailer runtime options.
   */
  constructor(apiKey: string, options: MailerConfig) {
    super(new ResendMailerTransport(apiKey), options);
  }
}

/**
 * Creates a Resend-backed {@link Mailer}.
 *
 * @example
 * ```ts
 * import { createResendMailer } from './mailer/resend.ts';
 *
 * export const mailer = createResendMailer(env.RESEND_API_KEY, {
 *   site: env.SITE_URL,
 *   production: import.meta.env.PROD,
 * });
 * ```
 */
export function createResendMailer(
  apiKey: string,
  options: MailerConfig,
): ResendMailer {
  return new ResendMailer(apiKey, options);
}
