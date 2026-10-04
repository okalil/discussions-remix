import { Form } from '@discussions/form';
import { on, type Handle } from 'remix/component';

import { routes } from '../../routes.ts';
import { Button } from '../../shared/button.tsx';

type DeleteCommentProps = {
  id: number;
};

export function DeleteComment(handle: Handle<DeleteCommentProps>) {
  const form = new Form({
    method: 'delete',
    action: routes.comments.destroy.href({ id: handle.props.id }),
  });

  form.addEventListener('statechange', handle.update);
  form.addEventListener('submitcomplete', (event) => {
    event.waitUntil(handle.frames.top.reload());
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
