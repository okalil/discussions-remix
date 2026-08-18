import { sql } from 'remix/data-table';

import type {
  CreateDiscussionDto,
  DiscussionDetailDto,
  DiscussionPageDto,
  DiscussionPreviewDto,
  GetDiscussionsDto,
} from './discussion.types.ts';
import type { Database } from './integrations/db.ts';
import { count, query, queryOne } from './integrations/db/query.ts';
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
    page,
    limit,
    category,
    q,
  }: GetDiscussionsDto): Promise<DiscussionPageDto> {
    const offset = (page - 1) * limit;
    const categoryFilter = category ? sql`AND c.slug = ${category}` : sql``;
    const searchFilter = q
      ? sql`AND (d.title LIKE ${`%${q}%`} OR d.content LIKE ${`%${q}%`})`
      : sql``;

    const rows = await query<DiscussionListRow>(
      this.db,
      sql`
        WITH paged AS (
          SELECT
            d.id,
            d.title,
            d.created_at,
            d.author_id,
            (SELECT MAX(cm.created_at) FROM comments cm WHERE cm.discussion_id = d.id) AS last_comment_at,
            COUNT(*) OVER() AS total
          FROM discussions d
          LEFT JOIN categories c ON c.id = d.category_id
          WHERE TRUE
            ${categoryFilter}
            ${searchFilter}
          ORDER BY last_comment_at DESC, d.created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        )
        SELECT
          p.id,
          p.title,
          p.created_at AS "createdAt",
          p.total,
          u.id AS "authorId",
          u.name AS "authorName",
          u.avatar AS "authorAvatar",
          (SELECT COUNT(*) FROM comments cm WHERE cm.discussion_id = p.id) AS "commentsCount",
          (SELECT COUNT(*) FROM discussion_votes dv WHERE dv.discussion_id = p.id) AS "votesCount",
          EXISTS (
            SELECT 1 FROM discussion_votes dv
            WHERE dv.discussion_id = p.id AND dv.user_id = ${currentUserId ?? 0}
          ) AS voted
        FROM paged p
        INNER JOIN users u ON u.id = p.author_id
        ORDER BY p.last_comment_at DESC, p.created_at DESC
      `,
    );

    return {
      discussions: rows.map((row) => ({
        id: row.id,
        title: row.title,
        createdAt: row.createdAt,
        author: {
          id: row.authorId,
          name: row.authorName,
          avatar: row.authorAvatar,
        },
        commentsCount: count(row.commentsCount),
        votesCount: count(row.votesCount),
        voted: Boolean(row.voted),
      })),
      total: count(rows.at(0)?.total),
      limit,
    };
  }

  async getDiscussion(
    id: number,
    currentUserId?: number,
  ): Promise<DiscussionDetailDto | null> {
    const row = await queryOne<DiscussionDetailRow>(
      this.db,
      sql`
        SELECT
          d.id,
          d.title,
          d.content,
          d.created_at AS "createdAt",
          u.id AS "authorId",
          u.name AS "authorName",
          u.avatar AS "authorAvatar",
          c.emoji AS "categoryEmoji",
          c.title AS "categoryTitle",
          c.slug AS "categorySlug",
          (SELECT COUNT(*) FROM comments cm WHERE cm.discussion_id = d.id) AS "commentsCount",
          (SELECT COUNT(*) FROM discussion_votes dv WHERE dv.discussion_id = d.id) AS "votesCount",
          EXISTS (
            SELECT 1 FROM discussion_votes dv
            WHERE dv.discussion_id = d.id AND dv.user_id = ${currentUserId ?? 0}
          ) AS voted,
          (
            SELECT COUNT(*) FROM (
              SELECT d.author_id
              UNION
              SELECT c2.author_id FROM comments c2 WHERE c2.discussion_id = d.id
            ) p
          ) AS "participantsCount"
        FROM discussions d
        INNER JOIN users u ON u.id = d.author_id
        INNER JOIN categories c ON c.id = d.category_id
        WHERE d.id = ${id}
        LIMIT 1
      `,
    );
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      content: row.content,
      createdAt: row.createdAt,
      author: {
        id: row.authorId,
        name: row.authorName,
        avatar: row.authorAvatar,
      },
      category: {
        emoji: row.categoryEmoji,
        title: row.categoryTitle,
        slug: row.categorySlug,
      },
      votesCount: count(row.votesCount),
      commentsCount: count(row.commentsCount),
      participantsCount: count(row.participantsCount),
      voted: Boolean(row.voted),
    };
  }

  async getDiscussionPreview(id: number): Promise<DiscussionPreviewDto | null> {
    const row = await queryOne<DiscussionPreviewRow>(
      this.db,
      sql`
        SELECT
          d.id,
          d.title,
          d.content,
          c.content AS "replyContent",
          u.id AS "replyAuthorId",
          u.name AS "replyAuthorName",
          u.avatar AS "replyAuthorAvatar"
        FROM discussions d
        LEFT JOIN comments c ON c.id = (
          SELECT c2.id FROM comments c2
          WHERE c2.discussion_id = d.id
          ORDER BY c2.created_at DESC
          LIMIT 1
        )
        LEFT JOIN users u ON u.id = c.author_id
        WHERE d.id = ${id}
        LIMIT 1
      `,
    );
    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      content: truncate(row.content),
      reply:
        row.replyContent != null && row.replyAuthorId != null
          ? {
              content: truncate(row.replyContent),
              author: {
                id: row.replyAuthorId,
                name: row.replyAuthorName ?? '',
                avatar: row.replyAuthorAvatar,
              },
            }
          : undefined,
    };
  }

  async voteDiscussion(id: number, userId: number) {
    await this.db.exec(sql`
      INSERT INTO discussion_votes (user_id, discussion_id)
      VALUES (${userId}, ${id})
      ON CONFLICT (user_id, discussion_id) DO NOTHING
    `);
  }

  async unvoteDiscussion(id: number, userId: number) {
    await this.db.deleteMany(schema.discussionVotes, {
      where: { discussion_id: id, user_id: userId },
    });
  }

  async getParticipants(discussionId: number): Promise<PublicUserDto[]> {
    return query<PublicUserDto>(
      this.db,
      sql`
        SELECT u.id, u.name, u.avatar
        FROM (
          SELECT author_id AS id FROM discussions WHERE id = ${discussionId}
          UNION
          SELECT author_id FROM comments WHERE discussion_id = ${discussionId}
        ) p
        INNER JOIN users u ON u.id = p.id
      `,
    );
  }
}

type DiscussionListRow = {
  id: number;
  title: string;
  createdAt: string;
  total: number | string;
  authorId: number;
  authorName: string;
  authorAvatar: string | null;
  commentsCount: number | string;
  votesCount: number | string;
  voted: boolean | number;
};

type DiscussionDetailRow = {
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
};

type DiscussionPreviewRow = {
  id: number;
  title: string;
  content: string;
  replyContent: string | null;
  replyAuthorId: number | null;
  replyAuthorName: string | null;
  replyAuthorAvatar: string | null;
};

function truncate(text: string) {
  return text.length > 100 ? text.slice(0, 100) + '...' : text;
}
