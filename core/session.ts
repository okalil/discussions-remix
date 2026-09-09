import { sql } from 'remix/data-table';

import type { Database } from './integrations/db.ts';
import { queryOne } from './integrations/db/query.ts';
import { schema } from './integrations/db/schema.ts';
import type { CreateSessionInput, Session } from './session.types.ts';

const expirationTime = 1000 * 60 * 60 * 24 * 30; // 30 days

export class SessionService {
  constructor(private db: Database) {}

  async createSession({ userId }: CreateSessionInput) {
    return this.db.create(
      schema.sessions,
      {
        id: crypto.randomUUID(),
        user_id: userId,
        expires: new Date(Date.now() + expirationTime).toISOString(),
      },
      { returnRow: true },
    );
  }

  async getSession(id: string): Promise<Session | null> {
    const now = new Date().toISOString();
    const row = await queryOne<SessionRow>(
      this.db,
      sql`
        SELECT
          s.id AS "sessionId",
          s.user_id AS "sessionUserId",
          s.expires AS "sessionExpires",
          u.id AS "userId",
          u.email AS "userEmail",
          u.name AS "userName",
          u.avatar AS "userAvatar",
          u.email_verified AS "emailVerified"
        FROM sessions s
        INNER JOIN users u ON u.id = s.user_id
        WHERE s.id = ${id} AND s.expires > ${now}
        LIMIT 1
      `,
    );
    if (!row) return null;

    return {
      id: row.sessionId,
      userId: row.sessionUserId,
      expires: row.sessionExpires,
      user: {
        id: row.userId,
        email: row.userEmail,
        name: row.userName,
        avatar: row.userAvatar,
        emailVerified: row.emailVerified,
      },
    };
  }

  async deleteSession(id: string) {
    await this.db.delete(schema.sessions, id);
  }
}

type SessionRow = {
  sessionId: string;
  sessionUserId: number;
  sessionExpires: string;
  userId: number;
  userEmail: string;
  userName: string;
  userAvatar: string | null;
  emailVerified: boolean;
};
