import { field, Form, FormValidator, submit } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import * as s from 'remix/data-schema';
import { minLength } from 'remix/data-schema/checks';
import * as coerce from 'remix/data-schema/coerce';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css } from 'remix/ui';

import { Button } from '../shared/button.browser.tsx';
import { ErrorMessage } from '../shared/error-message.browser.tsx';
import { Field } from '../shared/field.browser.tsx';
import { Input } from '../shared/input.browser.tsx';
import { Textarea } from '../shared/textarea.browser.tsx';

type Category = {
  id: number;
  emoji: string;
  title: string;
  description: string;
};

export type NewDiscussionFormProps = {
  categories: Category[];
  draft?: FormDraft;
  errors?: FormErrors<NewDiscussionValidator>;
};

export const NewDiscussionForm = clientEntry<NewDiscussionFormProps>(
  import.meta.url,
  function NewDiscussionForm(handle) {
    const form = new Form({
      method: 'post',
      validator: newDiscussionValidator,
      draft: handle.props.draft,
    });
    addEventListeners(form, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => handle.frame.replace(e.response.body),
    });

    return () => {
      form.mergeState({ errors: handle.props.errors });
      const { errors, pending } = form.state;
      return (
        <form mix={[styles.form, submit(form)]}>
          <Field label="Title" error={errors.title}>
            <Input
              mix={field(form, 'title')}
              placeholder="Title"
              aria-required
            />
          </Field>

          <Field label="Body" error={errors.body}>
            <Textarea
              mix={field(form, 'body')}
              placeholder="Body"
              aria-required
              rows={16}
            />
          </Field>

          <Field label="Category" error={errors.categoryId}>
            <select
              mix={[styles.select, field(form, 'categoryId')]}
              aria-required
            >
              {handle.props.categories.map((category) => (
                <option
                  key={category.id}
                  value={category.id}
                  mix={styles.option}
                >
                  {category.title}
                </option>
              ))}
            </select>
          </Field>

          {errors.root && <ErrorMessage error={errors.root} />}

          <Button
            type="submit"
            variant="primary"
            pending={pending}
            mix={styles.submit}
          >
            Start Discussion
          </Button>
        </form>
      );
    };
  },
);

export const newDiscussionValidator = new FormValidator(
  f.object({
    title: f.field(s.string().pipe(minLength(1))),
    body: f.field(s.string().pipe(minLength(1))),
    categoryId: f.field(coerce.number()),
  }),
);

type NewDiscussionValidator = typeof newDiscussionValidator;

const styles = {
  form: css({
    display: 'grid',
    gap: '0.75rem',
  }),
  submit: css({
    marginLeft: 'auto',
  }),
  select: css({
    width: '320px',
    maxWidth: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    fontSize: '0.875rem',
    '&:focus': {
      outline: 'none',
      borderColor: '#6366f1',
      boxShadow: '0 0 0 1px #6366f1, 0 1px 2px 0 rgb(0 0 0 / 0.05)',
    },
  }),
  option: css({
    display: 'flex',
    gap: '0.75rem',
    padding: '0.5rem 1rem',
    alignItems: 'center',
    '&:checked, &:active, &:hover': {
      background: '#f7f7f7',
    },
  }),
};
