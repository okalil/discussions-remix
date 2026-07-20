import { css, type Handle } from 'remix/ui';

import { Avatar } from '../shared/avatar.browser.tsx';

export type Participant = {
  id: number;
  name: string;
  image: string | null;
};

type ParticipantsProps = {
  participants: Participant[];
};

export function Participants(handle: Handle<ParticipantsProps>) {
  return () => (
    <div mix={styles.root}>
      {handle.props.participants.map((participant) => (
        <Avatar
          key={participant.id}
          src={participant.image}
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
