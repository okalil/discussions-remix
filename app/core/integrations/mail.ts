import type { ReactElement } from 'react';
import { render } from 'react-email';
import { Resend } from 'resend';

import { env } from '../../env.ts';

export type EmailClient = Mailer;

interface Mailer {
  send(message: MailerMessage): Promise<void>;
}

interface MailerMessage {
  to: string;
  subject: string;
  template: ReactElement;
}

class ResendMailer implements Mailer {
  constructor(private resend: Resend) {}

  async send({ to, subject, template }: MailerMessage) {
    const from = 'me@mail.com'; // default sender

    if (process.env.NODE_ENV === 'production') {
      const response = await this.resend.emails.send({
        from,
        to,
        subject,
        react: template,
      });
      if (response.error) throw response.error;
    } else {
      const html = await render(template);
      const text = await render(template, { plainText: true });
      console.log("Email you'd have sent: ", { to, subject, html, text });
    }
  }
}

const resend = new Resend(env.RESEND_API_KEY);

export const mailer = new ResendMailer(resend);
