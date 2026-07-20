import * as s from 'remix/data-schema';
import { minLength } from 'remix/data-schema/checks';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css, ref } from 'remix/ui';

import { field, Form, FormValidator, submit } from '../../lib/form.browser.ts';
import { Button } from '../shared/button.browser.tsx';
import { Field } from '../shared/field.browser.tsx';
import { Textarea } from '../shared/textarea.browser.tsx';

type NewCommentFormProps = {
  action: string;
};

export const NewCommentForm = clientEntry<NewCommentFormProps>(
  import.meta.url,
  function NewCommentForm(handle) {
    const form = new Form({
      validator: createCommentValidator,
    });
    addEventListeners(form, handle.signal, {
      statechange: () => handle.update(),
    });

    let formElement: HTMLFormElement | null = null;
    addEventListeners(handle.frame, handle.signal, {
      reloadComplete() {
        form.reset();
        formElement?.reset();
      },
    });

    return () => {
      const { errors, pending } = form.state;
      return (
        <form
          method="post"
          action={handle.props.action}
          mix={[styles.form, submit(form), ref((node) => (formElement = node))]}
        >
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

export const createCommentValidator = new FormValidator(
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
