import { field, Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import * as s from 'remix/data-schema';
import { email, maxLength, minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css } from 'remix/ui';

import { routes } from '../../routes.ts';
import { Button } from '../shared/button.browser.tsx';
import { ErrorMessage } from '../shared/error-message.browser.tsx';
import { Field } from '../shared/field.browser.tsx';
import { Input } from '../shared/input.browser.tsx';

export type ResetPasswordFormProps = {
  token?: string | null;
  draft?: FormDraft;
  errors?: FormErrors;
};

export const ResetPasswordForm = clientEntry<ResetPasswordFormProps>(
  import.meta.url,
  function ResetPasswordForm(handle) {
    const resetPasswordForm = new Form({
      method: 'post',
      schema: resetPasswordSchema,
      draft: handle.props.draft ?? [['token', handle.props.token ?? '']],
    });
    addEventListeners(resetPasswordForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => handle.frame.replace(e.response.body),
    });

    return () => {
      resetPasswordForm.mergeState({ errors: handle.props.errors });
      const { errors, pending } = resetPasswordForm.state;
      return (
        <form mix={[styles.form, form(resetPasswordForm)]}>
          <input mix={field(resetPasswordForm, 'token')} type="hidden" />

          <Field label="Email" error={errors.email}>
            <Input
              mix={field(resetPasswordForm, 'email')}
              type="email"
              aria-required
            />
          </Field>

          <Field label="New Password" error={errors.password}>
            <Input
              mix={field(resetPasswordForm, 'password')}
              type="password"
              aria-required
            />
          </Field>

          <Field label="Confirm Password" error={errors.passwordConfirmation}>
            <Input
              mix={field(resetPasswordForm, 'passwordConfirmation')}
              type="password"
              aria-required
            />
          </Field>

          {errors.root && <ErrorMessage error={errors.root} />}

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

export const resetPasswordSchema = f
  .object({
    email: f.field(s.string().pipe(email())),
    password: f.field(s.string().pipe(minLength(8), maxLength(72))),
    passwordConfirmation: f.field(s.string().pipe(minLength(8), maxLength(72))),
    token: f.field(s.string()),
  })
  .refine(
    (data) => data.password === data.passwordConfirmation,
    'Passwords do not match',
  );

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
