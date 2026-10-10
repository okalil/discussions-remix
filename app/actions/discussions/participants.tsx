import { css } from 'pitlane/theme';
import { type Handle } from 'remix/component';

import type { PublicUser } from '../../../core/user.types.ts';
import { Avatar } from '../../shared/avatar.tsx';
import { t } from '../../theme.ts';

type ParticipantsProps = {
  participants: PublicUser[];
};

export function Participants(handle: Handle<ParticipantsProps>) {
  return () => (
    <div mix={styles.root}>
      {handle.props.participants.map((participant) => (
        <Avatar
          key={participant.id}
          src={participant.avatar}
          alt=""
          title={participant.name}
          fallback={participant.name.at(0)}
          size={24}
        />
      ))}
    </div>
  );
}

const styles = {
  root: css({
    display: 'flex',
    flexWrap: 'wrap',
    gap: t.spacing(1),
  }),
};
