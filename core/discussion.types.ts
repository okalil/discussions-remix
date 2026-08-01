import type { CategoryDto } from './category.types.ts';
import type { PublicUserDto } from './user.types.ts';

export interface GetDiscussionsDto {
  category?: string;
  page: number;
  limit: number;
  q?: string;
  currentUserId?: number;
}

export interface CreateDiscussionDto {
  title: string;
  body: string;
  categoryId: number;
  authorId: number;
}

export type DiscussionSummaryDto = {
  id: number;
  title: string;
  createdAt: string;
  author: PublicUserDto;
  commentsCount: number;
  votesCount: number;
  voted: boolean;
};

export type DiscussionDetailDto = {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  author: PublicUserDto;
  category: Pick<CategoryDto, 'emoji' | 'title' | 'slug'>;
  votesCount: number;
  commentsCount: number;
  participantsCount: number;
  voted: boolean;
};

export type DiscussionPreviewDto = {
  id: number;
  title: string;
  body: string;
  reply?: {
    body: string;
    author: PublicUserDto;
  };
};
