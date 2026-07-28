import { Form } from '@discussions/form';
import { addEventListeners, on, type Handle } from 'remix/ui';

import { routes } from '../../../routes.ts';
import { Button } from '../../public/button.tsx';

type DeleteCommentProps = {
  id: number;
};

export function DeleteComment(handle: Handle<DeleteCommentProps>) {
  const form = new Form({
    method: 'delete',
    action: routes.comments.destroy.href({ id: handle.props.id }),
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
}
