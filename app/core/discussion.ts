import { sql } from 'remix/data-table';

import type { GetDiscussionsInput } from './discussion.types.ts';
import type { DatabaseClient } from './integrations/db.ts';
import { schema } from './integrations/db/schema.ts';

export class DiscussionService {
  constructor(private db: DatabaseClient) {}

  async createDiscussion(
    title: string,
    body: string,
    categoryId: number,
    userId: number,
  ) {
    return this.db.create(
      schema.discussions,
      {
        title,
        body,
        category_id: categoryId,
        author_id: userId,
      },
      { returnRow: true },
    );
  }

  async getDiscussions(filters: GetDiscussionsInput, userId = 0) {
    const { category, page, limit, q } = filters;
    const offset = (page - 1) * limit;
    const categoryFilter = category ? sql`AND c.slug = ${category}` : sql``;
    const searchFilter = q
      ? sql`AND (d.title LIKE ${`%${q}%`} OR d.body LIKE ${`%${q}%`})`
      : sql``;

    const [totalResult, discussionsResult] = await Promise.all([
      this.db.exec(sql`
        SELECT COUNT(d.id) AS total
        FROM discussions d
        LEFT JOIN categories c ON c.id = d.category_id
        WHERE TRUE
          ${categoryFilter}
          ${searchFilter}
      `),
      this.db.exec(sql`
        SELECT
          d.id,
          d.title,
          d.created_at AS createdAt,
          u.name AS authorName,
          u.image AS authorImage,
          COUNT(DISTINCT cm.id) AS commentsCount,
          COUNT(DISTINCT dv.user_id) AS votesCount,
          COUNT(CASE WHEN dv.user_id = ${userId} THEN 1 END) > 0 AS voted
        FROM discussions d
        LEFT JOIN users u ON u.id = d.author_id
        LEFT JOIN categories c ON c.id = d.category_id
        LEFT JOIN comments cm ON cm.discussion_id = d.id
        LEFT JOIN discussion_votes dv ON dv.discussion_id = d.id
        WHERE TRUE
          ${categoryFilter}
          ${searchFilter}
        GROUP BY d.id
        ORDER BY MAX(cm.created_at) DESC, d.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `),
    ]);

    const total = Number(
      (totalResult.rows?.at(0) as { total?: unknown } | undefined)?.total ?? 0,
    );
    const discussions = (discussionsResult.rows ?? []).map((row) => {
      const resultRow = row as {
        id: number;
        title: string;
        createdAt: string;
        authorName: string;
        authorImage: string | null;
        commentsCount: number | string;
        votesCount: number | string;
        voted: boolean | number;
      };

      return {
        id: resultRow.id,
        title: resultRow.title,
        createdAt: resultRow.createdAt,
        author: {
          name: resultRow.authorName,
          image: resultRow.authorImage,
        },
        commentsCount: Number(resultRow.commentsCount ?? 0),
        votesCount: Number(resultRow.votesCount ?? 0),
        voted: Boolean(resultRow.voted),
      };
    });

    return {
      discussions,
      total,
      limit,
    };
  }

  async getDiscussion(id: number, userId = 0) {
    const result = await this.db.exec(sql`
      SELECT
        d.id,
        d.title,
        d.body,
        d.created_at AS createdAt,
        u.name AS authorName,
        u.image AS authorImage,
        c.emoji AS categoryEmoji,
        c.title AS categoryTitle,
        c.slug AS categorySlug,
        COUNT(DISTINCT dv.user_id) AS votesCount,
        COUNT(DISTINCT cm.id) AS commentsCount,
        (
          SELECT COUNT(DISTINCT participant.user_id)
          FROM (
            SELECT d.author_id AS user_id
            UNION
            SELECT c2.author_id AS user_id
            FROM comments c2
            WHERE c2.discussion_id = d.id
          ) participant
        ) AS participantsCount,
        COUNT(CASE WHEN dv.user_id = ${userId} THEN 1 END) > 0 AS voted
      FROM discussions d
      LEFT JOIN users u ON u.id = d.author_id
      LEFT JOIN categories c ON c.id = d.category_id
      LEFT JOIN comments cm ON cm.discussion_id = d.id
      LEFT JOIN discussion_votes dv ON dv.discussion_id = d.id
      WHERE d.id = ${id}
      GROUP BY d.id
      LIMIT 1
    `);
    const discussion = result.rows?.at(0) as
      | {
          id: number;
          title: string;
          body: string;
          createdAt: string;
          authorName: string;
          authorImage: string | null;
          categoryEmoji: string;
          categoryTitle: string;
          categorySlug: string;
          votesCount: number | string;
          commentsCount: number | string;
          participantsCount: number | string;
          voted: boolean | number;
        }
      | undefined;

    if (!discussion) return null;

    return {
      id: discussion.id,
      title: discussion.title,
      body: discussion.body,
      createdAt: discussion.createdAt,
      author: {
        name: discussion.authorName,
        image: discussion.authorImage,
      },
      category: {
        emoji: discussion.categoryEmoji,
        title: discussion.categoryTitle,
        slug: discussion.categorySlug,
      },
      votesCount: Number(discussion.votesCount ?? 0),
      commentsCount: Number(discussion.commentsCount ?? 0),
      participantsCount: Number(discussion.participantsCount ?? 0),
      voted: Boolean(discussion.voted),
    };
  }

  async getDiscussionWithReply(id: number) {
    const [discussionResult, replyResult] = await Promise.all([
      this.db.exec(sql`
        SELECT id, title, body
        FROM discussions
        WHERE id = ${id}
        LIMIT 1
      `),
      this.db.exec(sql`
        SELECT
          c.body,
          u.name AS authorName,
          u.image AS authorImage
        FROM comments c
        LEFT JOIN users u ON u.id = c.author_id
        WHERE c.discussion_id = ${id}
        ORDER BY c.created_at DESC
        LIMIT 1
      `),
    ]);
    const discussionRow = discussionResult.rows?.at(0) as
      | { id: number; title: string; body: string }
      | undefined;
    const replyRow = replyResult.rows?.at(0) as
      | { body: string; authorName: string; authorImage: string | null }
      | undefined;

    if (!discussionRow) return null;

    const discussion = {
      ...discussionRow,
      body: formatLargeText(discussionRow.body),
    };

    const reply = replyRow
      ? {
          body: formatLargeText(replyRow.body),
          author: {
            name: replyRow.authorName,
            image: replyRow.authorImage,
          },
        }
      : undefined;

    return { ...discussion, reply };
  }

  async voteDiscussion(id: number, userId: number) {
    await this.db.create(schema.discussionVotes, {
      user_id: userId,
      discussion_id: id,
    });
  }

  async unvoteDiscussion(id: number, userId: number) {
    await this.db.deleteMany(schema.discussionVotes, {
      where: { discussion_id: id, user_id: userId },
    });
  }

  async getParticipants(discussionId: number) {
    const result = await this.db.exec(sql`
      SELECT DISTINCT
        u.id,
        u.name,
        u.image
      FROM users u
      INNER JOIN discussions d ON d.id = ${discussionId}
      LEFT JOIN comments c ON c.discussion_id = ${discussionId}
      WHERE d.author_id = u.id OR c.author_id = u.id
    `);

    return (result.rows ?? []) as Array<{
      id: number;
      name: string;
      image: string | null;
    }>;
  }
}

function formatLargeText(text: string) {
  return text.length > 100 ? text.slice(0, 100) + '...' : text;
}
