import { sql } from 'remix/data-table';

import type { CommentSummaryDto } from './comment.types.ts';
import type { Database } from './integrations/db.ts';
import { schema } from './integrations/db/schema.ts';

export class CommentService {
  constructor(private db: Database) {}

  async getComments(
    discussionId: number,
    userId = 0,
    sort = 'oldest',
  ): Promise<CommentSummaryDto[]> {
    const orderBy =
      sort === 'newest'
        ? sql`c.created_at DESC`
        : sort === 'top'
          ? sql`COUNT(comment_votes.user_id) DESC`
          : sql`c.created_at ASC`;

    const result = await this.db.exec(sql`
      SELECT
        c.id,
        c.content,
        c.author_id AS authorId,
        c.discussion_id AS discussionId,
        c.created_at AS createdAt,
        u.name AS authorName,
        u.avatar AS authorAvatar,
        COUNT(DISTINCT comment_votes.user_id) AS votesCount,
        COUNT(CASE WHEN comment_votes.user_id = ${userId} THEN 1 END) > 0 AS voted,
        c.author_id = ${userId} AS isCommentAuthor,
        c.author_id = d.author_id AS isDiscussionAuthor
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN discussions d ON d.id = ${discussionId}
      LEFT JOIN comment_votes ON comment_votes.comment_id = c.id
      WHERE c.discussion_id = ${discussionId}
      GROUP BY c.id
      ORDER BY ${orderBy}
    `);

    return (result.rows ?? []).map((row) => {
      const comment = row as {
        id: number;
        content: string;
        authorId: number;
        discussionId: number;
        createdAt: string;
        authorName: string;
        authorAvatar: string | null;
        votesCount: number | string;
        voted: boolean | number;
        isCommentAuthor: boolean | number;
        isDiscussionAuthor: boolean | number;
      };

      return {
        id: comment.id,
        content: comment.content,
        authorId: comment.authorId,
        discussionId: comment.discussionId,
        createdAt: comment.createdAt,
        author: {
          id: comment.authorId,
          name: comment.authorName,
          avatar: comment.authorAvatar,
        },
        votesCount: Number(comment.votesCount ?? 0),
        voted: Boolean(comment.voted),
        isCommentAuthor: Boolean(comment.isCommentAuthor),
        isDiscussionAuthor: Boolean(comment.isDiscussionAuthor),
      };
    });
  }

  async createComment(discussionId: number, content: string, userId: number) {
    return this.db.create(
      schema.comments,
      {
        content,
        author_id: userId,
        discussion_id: discussionId,
      },
      { returnRow: true },
    );
  }

  async updateComment(id: number, content: string, userId: number) {
    await this.db.updateMany(
      schema.comments,
      { content },
      {
        where: {
          id,
          author_id: userId,
        },
      },
    );
  }

  async deleteComment(id: number, userId: number) {
    await this.db.deleteMany(schema.comments, {
      where: {
        id,
        author_id: userId,
      },
    });
  }

  async voteComment(id: number, userId: number) {
    await this.db.create(schema.commentVotes, {
      user_id: userId,
      comment_id: id,
    });
  }

  async unvoteComment(id: number, userId: number) {
    await this.db.deleteMany(schema.commentVotes, {
      where: {
        comment_id: id,
        user_id: userId,
      },
    });
  }
}
