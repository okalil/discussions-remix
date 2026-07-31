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
