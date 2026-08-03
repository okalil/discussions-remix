import { sql } from 'remix/data-table';

import type {
  CreateDiscussionDto,
  DiscussionDetailDto,
  DiscussionPreviewDto,
  DiscussionSummaryDto,
  GetDiscussionsDto,
} from './discussion.types.ts';
import type { Database } from './integrations/db.ts';
import { schema } from './integrations/db/schema.ts';
import type { PublicUserDto } from './user.types.ts';

export class DiscussionService {
  constructor(private db: Database) {}

  async createDiscussion({
    title,
    content,
    categoryId,
    authorId,
  }: CreateDiscussionDto) {
    return this.db.create(
      schema.discussions,
      {
        title,
        content,
        category_id: categoryId,
        author_id: authorId,
      },
      { returnRow: true },
    );
  }

  async getDiscussions({
    currentUserId,
    ...filters
  }: GetDiscussionsDto): Promise<{
    discussions: DiscussionSummaryDto[];
    total: number;
    limit: number;
  }> {
    const { category, page, limit, q } = filters;
    const offset = (page - 1) * limit;
    const categoryFilter = category ? sql`AND c.slug = ${category}` : sql``;
    const searchFilter = q
      ? sql`AND (d.title LIKE ${`%${q}%`} OR d.content LIKE ${`%${q}%`})`
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
          u.id AS authorId,
          u.name AS authorName,
          u.avatar AS authorAvatar,
          COUNT(DISTINCT cm.id) AS commentsCount,
          COUNT(DISTINCT dv.user_id) AS votesCount,
          COUNT(CASE WHEN dv.user_id = ${currentUserId ?? 0} THEN 1 END) > 0 AS voted
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
        authorId: number;
        authorName: string;
        authorAvatar: string | null;
        commentsCount: number | string;
        votesCount: number | string;
        voted: boolean | number;
      };

      return {
        id: resultRow.id,
        title: resultRow.title,
        createdAt: resultRow.createdAt,
        author: {
          id: resultRow.authorId,
          name: resultRow.authorName,
          avatar: resultRow.authorAvatar,
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

  async getDiscussion(
    id: number,
    currentUserId?: number,
  ): Promise<DiscussionDetailDto | null> {
    const result = await this.db.exec(sql`
      SELECT
        d.id,
        d.title,
        d.content,
        d.created_at AS createdAt,
        u.id AS authorId,
        u.name AS authorName,
        u.avatar AS authorAvatar,
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
        COUNT(CASE WHEN dv.user_id = ${currentUserId ?? 0} THEN 1 END) > 0 AS voted
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
          content: string;
          createdAt: string;
          authorId: number;
          authorName: string;
          authorAvatar: string | null;
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
      content: discussion.content,
      createdAt: discussion.createdAt,
      author: {
        id: discussion.authorId,
        name: discussion.authorName,
        avatar: discussion.authorAvatar,
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

  async getDiscussionPreview(id: number): Promise<DiscussionPreviewDto | null> {
    const [discussionResult, replyResult] = await Promise.all([
      this.db.exec(sql`
        SELECT id, title, content
        FROM discussions
        WHERE id = ${id}
        LIMIT 1
      `),
      this.db.exec(sql`
        SELECT
          c.content,
          u.id AS authorId,
          u.name AS authorName,
          u.avatar AS authorAvatar
        FROM comments c
        LEFT JOIN users u ON u.id = c.author_id
        WHERE c.discussion_id = ${id}
        ORDER BY c.created_at DESC
        LIMIT 1
      `),
    ]);
    const discussionRow = discussionResult.rows?.at(0) as
      | { id: number; title: string; content: string }
      | undefined;
    const replyRow = replyResult.rows?.at(0) as
      | {
          content: string;
          authorId: number;
          authorName: string;
          authorAvatar: string | null;
        }
      | undefined;

    if (!discussionRow) return null;

    const discussion = {
      ...discussionRow,
      content: formatLargeText(discussionRow.content),
    };

    const reply = replyRow
      ? {
          content: formatLargeText(replyRow.content),
          author: {
            id: replyRow.authorId,
            name: replyRow.authorName,
            avatar: replyRow.authorAvatar,
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

  async getParticipants(discussionId: number): Promise<PublicUserDto[]> {
    const result = await this.db.exec(sql`
      SELECT DISTINCT
        u.id,
        u.name,
        u.avatar
      FROM users u
      INNER JOIN discussions d ON d.id = ${discussionId}
      LEFT JOIN comments c ON c.discussion_id = ${discussionId}
      WHERE d.author_id = u.id OR c.author_id = u.id
    `);

    return (result.rows ?? []) as PublicUserDto[];
  }
}

function formatLargeText(text: string) {
  return text.length > 100 ? text.slice(0, 100) + '...' : text;
}
