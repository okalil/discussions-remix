import { Form, FormValidator } from '@discussions/form';
import * as coerce from 'remix/data-schema/coerce';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css, on } from 'remix/ui';

import { Icon } from '../shared/icon.browser.tsx';

type VoteCommentProps = {
  id: number;
  voted: boolean;
  votesCount: number;
  disabled?: boolean;
};

export const VoteComment = clientEntry<VoteCommentProps>(
  import.meta.url,
  function VoteComment(handle) {
    const form = new Form({
      method: 'post',
      action: `/comments/${handle.props.id}/vote`,
      validator: voteCommentValidator,
    });
    addEventListeners(form, handle.signal, {
      statechange: () => handle.update(),
      submitcomplete: (e) => e.waitUntil(handle.frame.reload()),
    });

    return () => {
      const { submission } = form.state;
      const optimisticVoted = submission?.data.voted;
      const voted = optimisticVoted ?? handle.props.voted;

      let votesCount = handle.props.votesCount;
      if (
        typeof optimisticVoted === 'boolean' &&
        optimisticVoted !== handle.props.voted
      ) {
        votesCount += optimisticVoted ? 1 : -1;
      }

      return (
        <button
          type="button"
          disabled={handle.props.disabled}
          aria-label={voted ? 'Remove upvote' : 'Upvote'}
          data-highlighted={voted}
          mix={[
            styles.button,
            on('click', (_, signal) => {
              form.formData.set('voted', String(!voted));
              form.submit({ signal });
            }),
          ]}
        >
          <Icon name="arrow-up" size={16} />
          {votesCount}
        </button>
      );
    };
  },
);

export const voteCommentValidator = new FormValidator(
  f.object({
    voted: f.field(coerce.boolean()),
  }),
);

const styles = {
  button: css({
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    padding: '0.125rem 0.5rem',
    fontSize: '0.875rem',
    color: '#374151',
    backgroundColor: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    '&:hover:not(:disabled)': {
      backgroundColor: '#eff6ff',
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    '&[data-highlighted="true"]': {
      borderColor: '#2563eb',
      color: '#2563eb',
      backgroundColor: '#eff6ff',
      '&:hover:not(:disabled)': {
        backgroundColor: '#dbeafe',
      },
    },
  }),
};
