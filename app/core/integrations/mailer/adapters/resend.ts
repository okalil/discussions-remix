import { Resend } from 'resend';

import type { MailerAdapter } from '../../mailer.ts';

/**
 * Creates a Resend {@link MailerAdapter}.
 *
 * @example
 * ```ts
 * import { createMailer, createResendMailerAdapter } from '../../mail.ts';
 *
 * export const mailer = createMailer(
 *   createResendMailerAdapter(env.RESEND_API_KEY),
 *   { siteUrl: env.SITE_URL },
 * );
 * ```
 */
export function createResendMailerAdapter(apiKey: string): MailerAdapter {
  const resend = new Resend(apiKey);

  return {
    async send({ from, to, subject, react }) {
      const response = await resend.emails.send({
        from,
        to,
        subject,
        react,
      });
      if (response.error) throw response.error;
    },
  };
}
