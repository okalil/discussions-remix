export type User = {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  avatar?: string;
};

export type PublicUserDto = {
  id: number;
  name: string;
  avatar: string | null;
};
