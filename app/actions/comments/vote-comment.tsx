import { Form } from '@discussions/form';
import { css } from 'pitlane/theme';
import { on, type Handle } from 'remix/component';
import * as coerce from 'remix/data-schema/coerce';
import * as f from 'remix/data-schema/form-data';

import { routes } from '../../routes.ts';
import { ArrowUpIcon } from '../../shared/icons/arrow-up-icon.tsx';
import { t } from '../../theme.ts';

type VoteCommentProps = {
  id: number;
  voted: boolean;
  votesCount: number;
  disabled?: boolean;
};

export function VoteComment(handle: Handle<VoteCommentProps>) {
  const form = new Form({
    method: 'post',
    action: routes.comments.vote.href({ id: handle.props.id }),
    schema: voteCommentSchema,
  });

  form.addEventListener('statechange', handle.update);
  form.addEventListener('submitcomplete', (event) => {
    event.waitUntil(handle.frame.reload());
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
        <ArrowUpIcon size={14} />
        {votesCount}
      </button>
    );
  };
}

export const voteCommentSchema = f.object({
  voted: f.field(coerce.boolean()),
});

const styles = {
  button: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: t.spacing(1),
    width: t.spacing(12),
    height: t.spacing(6.5),
    padding: [0, t.spacing(1.5)],
    fontSize: t.type.bodySmall.size,
    lineHeight: t.type.bodySmall.lineHeight,
    color: t.color.onSurfaceVariant,
    backgroundColor: 'transparent',
    border: `${t.size.px} solid ${t.color.outlineVariant}`,
    borderRadius: t.shape.small,
    cursor: 'pointer',
    '&:hover:not(:disabled)': {
      backgroundColor: t.color.primaryContainer,
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
    '&[data-highlighted="true"]': {
      borderColor: t.color.primary,
      color: t.color.primary,
      backgroundColor: t.color.primaryContainer,
      '&:hover:not(:disabled)': {
        backgroundColor: t.state.primaryContainer,
      },
    },
  }),
};
