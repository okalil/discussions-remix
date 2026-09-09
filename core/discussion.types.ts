import type { Category } from './category.types.ts';
import type { PublicUser } from './user.types.ts';

export type ListDiscussionsInput = {
  category?: string;
  page: number;
  limit: number;
  q?: string;
  viewerId?: number;
};

export type GetDiscussionOptions = {
  viewerId?: number;
};

export type CreateDiscussionInput = {
  title: string;
  content: string;
  categoryId: number;
  actorId: number;
};

export type VoteDiscussionInput = {
  discussionId: number;
  actorId: number;
  voted: boolean;
};

export type DiscussionPage = {
  discussions: DiscussionSummary[];
  total: number;
  limit: number;
};

export type DiscussionSummary = {
  id: number;
  title: string;
  createdAt: string;
  author: PublicUser;
  commentsCount: number;
  votesCount: number;
  voted: boolean;
};

export type Discussion = {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: PublicUser;
  category: Pick<Category, 'emoji' | 'title' | 'slug'>;
  votesCount: number;
  commentsCount: number;
  participantsCount: number;
  voted: boolean;
};

type DiscussionReplyPreview = {
  content: string;
  author: PublicUser;
};

export type DiscussionPreview = {
  id: number;
  title: string;
  content: string;
  reply?: DiscussionReplyPreview;
};
