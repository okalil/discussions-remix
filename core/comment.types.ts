import type { PublicUserDto } from './user.types.ts';

export type CommentSummaryDto = {
  id: number;
  body: string;
  authorId: number;
  discussionId: number;
  createdAt: string;
  author: PublicUserDto;
  votesCount: number;
  voted: boolean;
  isCommentAuthor: boolean;
  isDiscussionAuthor: boolean;
};
