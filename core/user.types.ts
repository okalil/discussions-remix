export type User = {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  avatar: string | null;
};

export type PublicUser = {
  id: number;
  name: string;
  avatar: string | null;
};

export type UpdateUserInput = {
  name: string;
  avatar?: File | null;
};
