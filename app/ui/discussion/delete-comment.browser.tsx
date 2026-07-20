import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, on } from 'remix/ui';

import { Form, FormValidator } from '../../lib/form.browser.ts';
import { Button } from '../shared/button.browser.tsx';

type DeleteCommentProps = {
  action: string;
};

export const DeleteComment = clientEntry<DeleteCommentProps>(
  import.meta.url,
  function DeleteComment(handle) {
    const form = new Form({
      validator: deleteCommentValidator,
    });
    addEventListeners(form, handle.signal, {
      statechange: () => handle.update(),
    });

    return () => {
      const { pending } = form.state;
      return (
        <Button
          type="button"
          variant="danger"
          pending={pending}
          mix={on('click', (_, signal) => {
            form.submit({
              async handler() {
                await fetch(handle.props.action, {
                  method: 'delete',
                  signal,
                });
                await handle.frames.top.reload();
              },
            });
          })}
        >
          Delete Comment
        </Button>
      );
    };
  },
);

export const deleteCommentValidator = new FormValidator(f.object({}));
