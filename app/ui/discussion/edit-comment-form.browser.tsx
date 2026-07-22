import { field, Form, form } from '@discussions/form';
import * as s from 'remix/data-schema';
import { minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css, on } from 'remix/ui';

import { Button } from '../shared/button.browser.tsx';
import { Field } from '../shared/field.browser.tsx';
import { Textarea } from '../shared/textarea.browser.tsx';

type EditCommentFormProps = {
  id: number;
  body: string;
};

export const EditCommentForm = clientEntry<EditCommentFormProps>(
  import.meta.url,
  function EditCommentForm(handle) {
    const editCommentForm = new Form({
      method: 'put',
      action: `/comments/${handle.props.id}`,
      schema: editCommentSchema,
      draft: [['body', handle.props.body]],
    });
    addEventListeners(editCommentForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => e.waitUntil(handle.frame.reload()),
    });

    return () => {
      const { errors, pending } = editCommentForm.state;
      return (
        <form mix={[styles.form, form(editCommentForm)]}>
          <Field label="Write" error={errors.body}>
            <Textarea
              mix={field(editCommentForm, 'body')}
              placeholder="Write your comment here..."
              rows={4}
              aria-required
            />
          </Field>

          <div mix={styles.actions}>
            <Button
              type="button"
              variant="danger"
              mix={[
                styles.cancel,
                on('click', (e) => {
                  e.currentTarget.dispatchEvent(
                    new Event('cancel', { bubbles: true }),
                  );
                }),
              ]}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              pending={pending}
              mix={styles.submit}
            >
              Update comment
            </Button>
          </div>
        </form>
      );
    };
  },
);

export const editCommentSchema = f.object({
  body: f.field(s.string().pipe(minLength(1))),
});

const styles = {
  form: css({
    display: 'grid',
    gap: '0.75rem',
    padding: '0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
  }),
  actions: css({
    display: 'flex',
    gap: '0.5rem',
  }),
  cancel: css({
    height: '2.5rem',
    width: '6rem',
    marginLeft: 'auto',
  }),
  submit: css({
    height: '2.5rem',
    width: '12rem',
  }),
};
