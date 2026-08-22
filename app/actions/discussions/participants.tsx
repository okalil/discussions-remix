import { css, type Handle } from 'remix/ui';

import type { PublicUserDto } from '../../../core/user.types.ts';
import { Avatar } from '../../shared/avatar.tsx';

type ParticipantsProps = {
  participants: PublicUserDto[];
};

export function Participants(handle: Handle<ParticipantsProps>) {
  return () => (
    <div mix={styles.root}>
      {handle.props.participants.map((participant) => (
        <Avatar
          key={participant.id}
          src={participant.avatar}
          alt={`${participant.name}'s avatar`}
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
    gap: '0.25rem',
  }),
};
