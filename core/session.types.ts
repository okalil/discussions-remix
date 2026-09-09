import type { User } from './user.types.ts';

export type CreateSessionInput = {
  userId: number;
};

export type Session = {
  id: string;
  userId: number;
  expires: string;
  user: User;
};
