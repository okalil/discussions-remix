import { field, Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import * as s from 'remix/data-schema';
import { email } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css } from 'remix/ui';

import { routes } from '../../routes.ts';
import { Button } from '../shared/button.browser.tsx';
import { Field } from '../shared/field.browser.tsx';
import { Input } from '../shared/input.browser.tsx';

export type ForgotPasswordFormProps = {
  draft?: FormDraft;
  errors?: FormErrors;
};

export const ForgotPasswordForm = clientEntry<ForgotPasswordFormProps>(
  import.meta.url,
  function ForgotPasswordForm(handle) {
    const forgotPasswordForm = new Form({
      method: 'post',
      schema: forgotPasswordSchema,
      draft: handle.props.draft,
    });
    addEventListeners(forgotPasswordForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => handle.frame.replace(e.response.body),
    });

    return () => {
      forgotPasswordForm.mergeState({ errors: handle.props.errors });
      const { errors, pending } = forgotPasswordForm.state;

      return (
        <form mix={[styles.form, form(forgotPasswordForm)]}>
          <Field label="Email" error={errors.email}>
            <Input
              mix={field(forgotPasswordForm, 'email')}
              type="email"
              aria-required
            />
          </Field>

          <Button
            type="submit"
            variant="primary"
            pending={pending}
            mix={styles.submit}
          >
            Submit
          </Button>

          <p mix={styles.footer}>
            Remember your password?{' '}
            <a href={routes.auth.login.index.href()} mix={styles.link}>
              Login
            </a>
          </p>
        </form>
      );
    };
  },
);

export const forgotPasswordSchema = f.object({
  email: f.field(s.string().pipe(email())),
});

const styles = {
  form: css({
    display: 'grid',
    gap: '1rem',
  }),
  submit: css({
    height: '3rem',
  }),
  footer: css({
    margin: 0,
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#4b5563',
  }),
  link: css({
    color: '#4f46e5',
    fontWeight: 500,
    textDecoration: 'none',
    '&:hover': {
      color: '#6366f1',
      textDecoration: 'underline',
    },
  }),
};
