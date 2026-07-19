import * as coerce from 'remix/data-schema/coerce';
import * as f from 'remix/data-schema/form-data';
import { addEventListeners, clientEntry, css, on } from 'remix/ui';

import { Form, FormValidator } from '../../lib/form.browser.ts';
import { Icon } from '../shared/icon.browser.tsx';

type VoteDiscussionProps = {
  action: string;
  voted: boolean;
  votesCount: number;
  disabled?: boolean;
};

export const VoteDiscussion = clientEntry<VoteDiscussionProps>(
  import.meta.url,
  function VoteDiscussion(handle) {
    const form = new Form({
      validator: voteDiscussionValidator,
    });
    addEventListeners(form, handle.signal, {
      statechange: () => handle.update(),
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
              form.submit({
                async handler() {
                  await fetch(handle.props.action, {
                    method: 'post',
                    body: form.formData,
                    signal,
                  });
                  await handle.frame.reload();
                },
              });
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

export const voteDiscussionValidator = new FormValidator(
  f.object({
    voted: f.field(coerce.boolean()),
  }),
);

const styles = {
  form: css({
    display: 'grid',
    placeContent: 'center',
  }),
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
