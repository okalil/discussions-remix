import { Form } from '@discussions/form';
import { addEventListeners, clientEntry, on } from 'remix/ui';

import { Button } from '../shared/button.browser.tsx';

type DeleteCommentProps = {
  id: number;
};

export const DeleteComment = clientEntry<DeleteCommentProps>(
  import.meta.url,
  function DeleteComment(handle) {
    const form = new Form({
      action: `/comments/${handle.props.id}`,
      method: 'delete',
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
          mix={on('click', async (_, signal) => {
            await form.submit({ signal });
            await handle.frames.top.reload();
          })}
        >
          Delete Comment
        </Button>
      );
    };
  },
);
