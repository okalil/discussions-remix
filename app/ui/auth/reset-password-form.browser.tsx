import * as s from 'remix/data-schema';
import { email, maxLength, minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css } from 'remix/ui';

import { field, Form, FormValidator, submit } from '../../lib/form.browser.ts';
import type { FormDraft, FormErrors } from '../../lib/form.browser.ts';
import { Button } from '../shared/button.browser.tsx';
import { ErrorMessage } from '../shared/error-message.browser.tsx';
import { Field } from '../shared/field.browser.tsx';
import { Input } from '../shared/input.browser.tsx';

export type ResetPasswordFormProps = {
  token?: string | null;
  draft?: FormDraft;
  errors?: FormErrors<ResetPasswordValidator>;
};

export const ResetPasswordForm = clientEntry<ResetPasswordFormProps>(
  import.meta.url,
  function ResetPasswordForm(handle) {
    const form = new Form({
      validator: resetPasswordValidator,
      draft: handle.props.draft ?? [['token', handle.props.token ?? '']],
    });
    addEventListeners(form, handle.signal, {
      statechange: () => handle.update(),
    });

    return () => {
      form.mergeState({ errors: handle.props.errors });
      const { errors, pending } = form.state;
      return (
        <form method="post" mix={[styles.form, submit(form)]}>
          <input mix={field(form, 'token')} type="hidden" />

          <Field label="Email" error={errors.email}>
            <Input mix={field(form, 'email')} type="email" aria-required />
          </Field>

          <Field label="New Password" error={errors.password}>
            <Input
              mix={field(form, 'password')}
              type="password"
              aria-required
            />
          </Field>

          <Field label="Confirm Password" error={errors.passwordConfirmation}>
            <Input
              mix={field(form, 'passwordConfirmation')}
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
            <a href="./login" mix={styles.link}>
              Login
            </a>
          </p>
        </form>
      );
    };
  },
);

export const resetPasswordValidator = new FormValidator(
  f
    .object({
      email: f.field(s.string().pipe(email())),
      password: f.field(s.string().pipe(minLength(8), maxLength(72))),
      passwordConfirmation: f.field(
        s.string().pipe(minLength(8), maxLength(72)),
      ),
      token: f.field(s.string()),
    })
    .refine(
      (data) => data.password === data.passwordConfirmation,
      'Passwords do not match',
    ),
);

type ResetPasswordValidator = typeof resetPasswordValidator;

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
