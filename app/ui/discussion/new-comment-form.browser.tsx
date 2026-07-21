import { field, Form, form, FormValidator } from '@discussions/form';
import * as s from 'remix/data-schema';
import { minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css } from 'remix/ui';

import { Button } from '../shared/button.browser.tsx';
import { Field } from '../shared/field.browser.tsx';
import { Textarea } from '../shared/textarea.browser.tsx';

type NewCommentFormProps = {
  discussionId: number;
};

export const NewCommentForm = clientEntry<NewCommentFormProps>(
  import.meta.url,
  function NewCommentForm(handle) {
    const newCommentForm = new Form({
      method: 'post',
      action: `/discussions/${handle.props.discussionId}/comments/new`,
      validator: newCommentValidator,
    });
    addEventListeners(newCommentForm, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => e.waitUntil(handle.frame.reload()),
    });

    return () => {
      const { errors, pending } = newCommentForm.state;
      return (
        <form mix={[styles.form, form(newCommentForm)]}>
          <Field label="Write" error={errors.body}>
            <Textarea
              mix={field(newCommentForm, 'body')}
              placeholder="Write your comment here..."
              rows={4}
              aria-required
            />
          </Field>
          <Button
            type="submit"
            variant="primary"
            pending={pending}
            mix={styles.submit}
          >
            Comment
          </Button>
        </form>
      );
    };
  },
);

export const newCommentValidator = new FormValidator(
  f.object({
    body: f.field(s.string().pipe(minLength(1))),
  }),
);

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
