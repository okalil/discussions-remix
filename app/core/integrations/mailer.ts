import { createElement, type ComponentType, type ReactElement } from 'react';
import { render } from 'react-email';

export { createResendMailerAdapter } from './mailer/adapters/resend.ts';

export interface Mailer {
  readonly config: MailerConfig;
  send<P extends MailerTemplateProps>(message: MailerMessage<P>): Promise<void>;
}

export interface MailerConfig {
  site: string;
  production: boolean;
  from?: string;
}

export type MailerTemplateProps = {
  baseUrl: string;
};

export interface MailerMessage<P extends MailerTemplateProps> {
  to: string;
  subject: string;
  template: ComponentType<P>;
  props: Omit<P, 'baseUrl'>;
}

export interface MailerAdapter {
  send(message: {
    from: string;
    to: string;
    subject: string;
    react: ReactElement;
  }): Promise<void>;
}

/**
 * Creates a {@link Mailer} that injects shared config into templates and
 * delegates delivery to a {@link MailerAdapter}.
 *
 * In non-production, emails are rendered and logged instead of sent.
 *
 * @example
 * ```ts
 * import { createMailer, createResendMailerAdapter } from './mail.ts';
 *
 * export const mailer = createMailer(
 *   createResendMailerAdapter(env.RESEND_API_KEY),
 *   { siteUrl: env.SITE_URL },
 * );
 * ```
 */
export function createMailer(
  adapter: MailerAdapter,
  { site, production, from = 'me@mail.com' }: MailerConfig,
): Mailer {
  const config: MailerConfig = { site, production, from };

  return {
    config,

    async send<P extends MailerTemplateProps>({
      to,
      subject,
      template,
      props,
    }: MailerMessage<P>) {
      const element = createElement(template, {
        ...props,
        baseUrl: config.site,
      } as P);

      if (!production) {
        const html = await render(element);
        const text = await render(element, { plainText: true });
        console.log("Email you'd have sent: ", { to, subject, html, text });
        return;
      }

      await adapter.send({ from, to, subject, react: element });
    },
  };
}
