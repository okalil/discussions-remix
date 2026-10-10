import { Form, form } from '@discussions/form';
import { css } from 'pitlane/theme';
import { on, type Handle } from 'remix/component';
import * as s from 'remix/data-schema';
import { minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';

import type { Comment } from '../../../core/comment.types.ts';
import { routes } from '../../routes.ts';
import { Button } from '../../shared/button.tsx';
import { TextAreaField } from '../../shared/forms/text-area-field.tsx';
import { t } from '../../theme.ts';

type EditCommentFormProps = {
  comment: Comment;
};

export function EditCommentForm(handle: Handle<EditCommentFormProps>) {
  const { comment } = handle.props;
  const editCommentForm = new Form({
    method: 'put',
    action: routes.comments.edit.href({ id: comment.id }),
    schema: editCommentSchema,
    draft: () => [['content', comment.content]],
  });

  editCommentForm.addEventListener('statechange', handle.update);
  editCommentForm.addEventListener('submitcomplete', (event) => {
    event.waitUntil(handle.frame.reload());
  });

  return () => {
    const { pending } = editCommentForm.state;
    return (
      <form mix={[styles.form, form(editCommentForm, { navigate: false })]}>
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
          <Button type="submit" variant="primary" pending={pending}>
            Update comment
          </Button>
        </div>
      </form>
    );
  };
}

export const editCommentSchema = f.object({
  content: f.field(s.string().pipe(minLength(1))),
});

const styles = {
  form: css({
    display: 'grid',
    gap: t.spacing(3),
    padding: t.spacing(3),
    border: `${t.size.px} solid ${t.color.outline}`,
    borderRadius: t.shape.extraSmall,
  }),
  actions: css({
    display: 'flex',
    gap: t.spacing(2),
  }),
  cancel: css({
    marginLeft: 'auto',
  }),
};
