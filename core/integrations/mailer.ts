import { createElement, type ComponentType, type ReactElement } from 'react';
import { render } from 'react-email';

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

/**
 * Low-level contract that connects a {@link Mailer} to a delivery provider.
 */
export interface MailerTransport {
  send(message: MailerTransportMessage): Promise<void>;
}

export type MailerTransportMessage = {
  from: string;
  to: string;
  subject: string;
  react: ReactElement;
};

/**
 * High-level mailer used to render templates and send email.
 *
 * Providers extend this class and provide a {@link MailerTransport} to the
 * constructor. The transport owns delivery while this class injects shared
 * config into templates. In non-production, emails are rendered and logged
 * instead of sent.
 */
export class Mailer {
  readonly config: MailerConfig;
  #transport: MailerTransport;

  constructor(
    transport: MailerTransport,
    { site, production, from = 'me@mail.com' }: MailerConfig,
  ) {
    this.#transport = transport;
    this.config = { site, production, from };
  }

  async send<P extends MailerTemplateProps>({
    to,
    subject,
    template,
    props,
  }: MailerMessage<P>): Promise<void> {
    const element = createElement(template, {
      ...props,
      baseUrl: this.config.site,
    } as P);

    if (!this.config.production) {
      const html = await render(element);
      const text = await render(element, { plainText: true });
      console.log("Email you'd have sent: ", { to, subject, html, text });
      return;
    }

    await this.#transport.send({
      from: this.config.from!,
      to,
      subject,
      react: element,
    });
  }
}
