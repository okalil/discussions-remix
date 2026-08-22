import { Form, form } from '@discussions/form';
import type { FormDraft, FormErrors } from '@discussions/form';
import * as s from 'remix/data-schema';
import { minLength } from 'remix/data-schema/checks';
import * as coerce from 'remix/data-schema/coerce';
import * as f from 'remix/data-schema/form-data';
import { clientEntry, css } from 'remix/ui';

import type { CategoryDto } from '../../../../core/category.types.ts';
import { Button } from '../../../shared/button.tsx';
import { ErrorMessage } from '../../../shared/error-message.tsx';
import { SelectField } from '../../../shared/forms/select-field.tsx';
import { TextAreaField } from '../../../shared/forms/text-area-field.tsx';
import { TextField } from '../../../shared/forms/text-field.tsx';
import { addEventListeners } from '../../../shared/utils/events.ts';

export type NewDiscussionFormProps = {
  categories: CategoryDto[];
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
    });

    return () => {
      const { errors, pending } = newDiscussionForm.state;
      return (
        <form
          mix={[styles.form, form(newDiscussionForm, { history: 'replace' })]}
        >
          <TextField
            field={newDiscussionForm.field('title')}
            label="Title"
            placeholder="Title"
          />
          <TextAreaField
            field={newDiscussionForm.field('content')}
            label="Content"
            placeholder="Content"
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
  content: f.field(s.string().pipe(minLength(1))),
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
};
