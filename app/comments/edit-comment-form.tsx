import { Form, form } from '@discussions/form';
import * as s from 'remix/data-schema';
import { minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { clientEntry, css, on } from 'remix/ui';

import type { CommentSummaryDto } from '../../core/comment.types.ts';
import { routes } from '../routes.ts';
import { Button } from '../shared/button.tsx';
import { TextAreaField } from '../shared/forms/text-area-field.tsx';
import { addEventListeners } from '../shared/utils/events.ts';

type EditCommentFormProps = {
  comment: CommentSummaryDto;
};

export const EditCommentForm = clientEntry<EditCommentFormProps>(
  import.meta.url,
  function EditCommentForm(handle) {
    const { comment } = handle.props;
    const editCommentForm = new Form({
      method: 'put',
      action: routes.comments.edit.href({ id: comment.id }),
      schema: editCommentSchema,
      draft: () => [['content', comment.content]],
    });

    addEventListeners(editCommentForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => e.waitUntil(handle.frame.reload()),
    });

    return () => {
      const { pending } = editCommentForm.state;
      return (
        <form mix={[styles.form, form(editCommentForm)]}>
          <TextAreaField
            field={editCommentForm.field('content')}
            label="Write"
            placeholder="Write your comment here..."
            rows={4}
            aria-required
          />

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
  content: f.field(s.string().pipe(minLength(1))),
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
