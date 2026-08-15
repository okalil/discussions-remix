import { Form, form } from '@discussions/form';
import * as s from 'remix/data-schema';
import { minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { clientEntry, css } from 'remix/ui';

import { routes } from '../routes.ts';
import { Button } from '../shared/button.tsx';
import { TextAreaField } from '../shared/forms/text-area-field.tsx';
import { addEventListeners } from '../shared/utils/events.ts';

type NewCommentFormProps = {
  discussionId: number;
};

export const NewCommentForm = clientEntry<NewCommentFormProps>(
  import.meta.url,
  function NewCommentForm(handle) {
    const newCommentForm = new Form({
      method: 'post',
      action: routes.comments.new.href({
        discussionId: handle.props.discussionId,
      }),
      schema: newCommentSchema,
    });
    const contentField = newCommentForm.field('content');

    addEventListeners(newCommentForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => e.waitUntil(handle.frame.reload()),
    });
    addEventListeners(contentField, handle.signal, {
      change: () => handle.update(),
    });

    return () => {
      const { pending } = newCommentForm.state;
      const submitDisabled = !contentField.value;
      return (
        <form mix={[styles.form, form(newCommentForm, { navigate: false })]}>
          <TextAreaField
            field={contentField}
            label="Write"
            placeholder="Write your comment here..."
            rows={4}
            aria-required
          />
          <Button
            type="submit"
            variant="primary"
            pending={pending}
            disabled={submitDisabled}
            mix={styles.submit}
          >
            Comment
          </Button>
        </form>
      );
    };
  },
);

export const newCommentSchema = f.object({
  content: f.field(s.string().pipe(minLength(1))),
});

const styles = {
  form: css({
    display: 'grid',
    gap: '0.75rem',
  }),
  submit: css({
    height: '2.5rem',
    width: '6rem',
    marginLeft: 'auto',
  }),
};
