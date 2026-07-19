import { sql } from 'remix/data-table';

import type { DatabaseClient } from './integrations/db.ts';
import { schema } from './integrations/db/schema.ts';

export class CommentService {
  constructor(private db: DatabaseClient) {}

  async getComments(discussionId: number, userId = 0, sort = 'oldest') {
    const orderBy =
      sort === 'newest'
        ? sql`c.created_at DESC`
        : sort === 'popular'
          ? sql`COUNT(comment_votes.user_id) DESC`
          : sql`c.created_at ASC`;

    const result = await this.db.exec(sql`
      SELECT
        c.id,
        c.body,
        c.author_id AS authorId,
        c.discussion_id AS discussionId,
        c.created_at AS createdAt,
        u.name AS authorName,
        u.image AS authorImage,
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
        body: string;
        authorId: number;
        discussionId: number;
        createdAt: string;
        authorName: string;
        authorImage: string | null;
        votesCount: number | string;
        voted: boolean | number;
        isCommentAuthor: boolean | number;
        isDiscussionAuthor: boolean | number;
      };

      return {
        id: comment.id,
        body: comment.body,
        authorId: comment.authorId,
        discussionId: comment.discussionId,
        createdAt: comment.createdAt,
        author: {
          name: comment.authorName,
          image: comment.authorImage,
        },
        votesCount: Number(comment.votesCount ?? 0),
        voted: Boolean(comment.voted),
        isCommentAuthor: Boolean(comment.isCommentAuthor),
        isDiscussionAuthor: Boolean(comment.isDiscussionAuthor),
      };
    });
  }

  async createComment(discussionId: number, body: string, userId: number) {
    return this.db.create(
      schema.comments,
      {
        body,
        author_id: userId,
        discussion_id: discussionId,
      },
      { returnRow: true },
    );
  }

  async updateComment(id: number, body: string, userId: number) {
    await this.db.updateMany(
      schema.comments,
      { body },
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
