import { field, Form, FormValidator, submit } from '@discussions/form';
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
    const form = new Form({
      action: `/discussions/${handle.props.discussionId}/comments/new`,
      method: 'post',
      validator: newCommentValidator,
    });
    addEventListeners(form, handle.signal, {
      statechange: () => handle.update(),
    });

    return () => {
      const { errors, pending } = form.state;
      return (
        <form mix={[styles.form, submit(form)]}>
          <Field label="Write" error={errors.body}>
            <Textarea
              mix={field(form, 'body')}
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
