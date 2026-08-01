export type User = {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
};

export type PublicUserDto = {
  id: number;
  name: string;
  image: string | null;
};
