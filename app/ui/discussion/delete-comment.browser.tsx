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
      method: 'delete',
      action: `/comments/${handle.props.id}`,
    });
    addEventListeners(form, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => e.waitUntil(handle.frames.top.reload()),
    });

    return () => {
      const { pending } = form.state;
      return (
        <Button
          type="button"
          variant="danger"
          pending={pending}
          mix={on('click', (_, signal) => void form.submit({ signal }))}
        >
          Delete Comment
        </Button>
      );
    };
  },
);
