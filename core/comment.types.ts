import type { PublicUser } from './user.types.ts';

export type CommentSort = 'oldest' | 'newest' | 'top';

export type ListCommentsInput = {
  discussionId: number;
  viewerId?: number;
  sort?: CommentSort;
};

export type CreateCommentInput = {
  discussionId: number;
  content: string;
  actorId: number;
};

export type UpdateCommentInput = {
  content: string;
  actorId: number;
};

export type DeleteCommentInput = {
  actorId: number;
};

export type VoteCommentInput = {
  commentId: number;
  actorId: number;
  voted: boolean;
};

export type Comment = {
  id: number;
  content: string;
  authorId: number;
  discussionId: number;
  createdAt: string;
  author: PublicUser;
  votesCount: number;
  voted: boolean;
  isCommentAuthor: boolean;
  isDiscussionAuthor: boolean;
};
