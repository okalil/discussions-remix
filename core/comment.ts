import { sql } from 'remix/data-table';

import type { CommentSummaryDto } from './comment.types.ts';
import type { Database } from './integrations/db.ts';
import { count, query } from './integrations/db/query.ts';
import { schema } from './integrations/db/schema.ts';

export class CommentService {
  constructor(private db: Database) {}

  async getComments(
    discussionId: number,
    userId = 0,
    sort = 'oldest',
  ): Promise<CommentSummaryDto[]> {
    const voterId = userId ?? 0;
    const orderBy =
      sort === 'newest'
        ? sql`c.created_at DESC`
        : sort === 'top'
          ? sql`(SELECT COUNT(*) FROM comment_votes cv WHERE cv.comment_id = c.id) DESC`
          : sql`c.created_at ASC`;

    const rows = await query<CommentRow>(
      this.db,
      sql`
        SELECT
          c.id,
          c.content,
          c.author_id AS "authorId",
          c.discussion_id AS "discussionId",
          c.created_at AS "createdAt",
          u.name AS "authorName",
          u.avatar AS "authorAvatar",
          (SELECT COUNT(*) FROM comment_votes cv WHERE cv.comment_id = c.id) AS "votesCount",
          EXISTS (
            SELECT 1 FROM comment_votes cv
            WHERE cv.comment_id = c.id AND cv.user_id = ${voterId}
          ) AS voted,
          c.author_id = ${voterId} AS "isCommentAuthor",
          c.author_id = d.author_id AS "isDiscussionAuthor"
        FROM comments c
        INNER JOIN users u ON u.id = c.author_id
        INNER JOIN discussions d ON d.id = c.discussion_id
        WHERE c.discussion_id = ${discussionId}
        ORDER BY ${orderBy}
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      content: row.content,
      authorId: row.authorId,
      discussionId: row.discussionId,
      createdAt: row.createdAt,
      author: {
        id: row.authorId,
        name: row.authorName,
        avatar: row.authorAvatar,
      },
      votesCount: count(row.votesCount),
      voted: Boolean(row.voted),
      isCommentAuthor: Boolean(row.isCommentAuthor),
      isDiscussionAuthor: Boolean(row.isDiscussionAuthor),
    }));
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
      { where: { id, author_id: userId } },
    );
  }

  async deleteComment(id: number, userId: number) {
    await this.db.deleteMany(schema.comments, {
      where: { id, author_id: userId },
    });
  }

  async voteComment(id: number, userId: number) {
    await this.db.exec(sql`
      INSERT INTO comment_votes (user_id, comment_id)
      VALUES (${userId}, ${id})
      ON CONFLICT (user_id, comment_id) DO NOTHING
    `);
  }

  async unvoteComment(id: number, userId: number) {
    await this.db.deleteMany(schema.commentVotes, {
      where: { comment_id: id, user_id: userId },
    });
  }
}

type CommentRow = {
  id: number;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar: string | null;
  discussionId: number;
  createdAt: string;
  votesCount: number | string;
  voted: boolean | number;
  isCommentAuthor: boolean | number;
  isDiscussionAuthor: boolean | number;
};
