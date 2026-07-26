import { Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import * as s from 'remix/data-schema';
import { minLength } from 'remix/data-schema/checks';
import * as coerce from 'remix/data-schema/coerce';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css } from 'remix/ui';

import { Button } from '../shared/button.browser.tsx';
import { ErrorMessage } from '../shared/error-message.browser.tsx';
import {
  SelectField,
  TextAreaField,
  TextField,
} from '../shared/field.browser.tsx';

type Category = {
  id: number;
  emoji: string;
  title: string;
  description: string;
};

export type NewDiscussionFormProps = {
  categories: Category[];
  draft?: FormDraft;
  errors?: FormErrors;
};

export const NewDiscussionForm = clientEntry<NewDiscussionFormProps>(
  import.meta.url,
  function NewDiscussionForm(handle) {
    const newDiscussionForm = new Form({
      method: 'post',
      schema: newDiscussionSchema,
      draft: () => handle.props.draft,
      errors: () => handle.props.errors,
    });
    addEventListeners(newDiscussionForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => handle.frame.replace(e.response.body),
    });

    return () => {
      const { errors, pending } = newDiscussionForm.state;
      return (
        <form mix={[styles.form, form(newDiscussionForm)]}>
          <TextField
            field={newDiscussionForm.field('title')}
            label="Title"
            placeholder="Title"
          />
          <TextAreaField
            field={newDiscussionForm.field('body')}
            label="Body"
            placeholder="Body"
            rows={16}
          />
          <SelectField
            field={newDiscussionForm.field('categoryId')}
            label="Category"
            options={handle.props.categories.map((category) => ({
              label: `${category.emoji} ${category.title}`,
              value: String(category.id),
            }))}
          />

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

export const newDiscussionSchema = f.object({
  title: f.field(s.string().pipe(minLength(1))),
  body: f.field(s.string().pipe(minLength(1))),
  categoryId: f.field(coerce.number()),
});

const styles = {
  form: css({
    display: 'grid',
    gap: '0.75rem',
  }),
  submit: css({
    marginLeft: 'auto',
  }),
  // select: css({
  //   width: '320px',
  //   maxWidth: '100%',
  //   padding: '0.5rem 0.75rem',
  //   border: '1px solid #d1d5db',
  //   borderRadius: '0.375rem',
  //   boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  //   fontSize: '0.875rem',
  //   '&:focus': {
  //     outline: 'none',
  //     borderColor: '#6366f1',
  //     boxShadow: '0 0 0 1px #6366f1, 0 1px 2px 0 rgb(0 0 0 / 0.05)',
  //   },
  // }),
  // option: css({
  //   display: 'flex',
  //   gap: '0.75rem',
  //   padding: '0.5rem 1rem',
  //   alignItems: 'center',
  //   '&:checked, &:active, &:hover': {
  //     background: '#f7f7f7',
  //   },
  // }),
};
