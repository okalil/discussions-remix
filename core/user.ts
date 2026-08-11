import type { Database } from './integrations/db.ts';
import { schema } from './integrations/db/schema.ts';
import type { FileStorage } from './integrations/storage.ts';

export class UserService {
  constructor(
    private db: Database,
    private storage: FileStorage,
  ) {}

  async getUserByEmail(email: string) {
    return this.db.findOne(schema.users, { where: { email } });
  }

  async updateUser(userId: number, name: string, avatar?: string) {
    const changes = stripUndefined({ name, avatar });
    await this.db.update(schema.users, userId, changes);
  }

  async uploadUserAvatar(userId: number, file: File) {
    const key = `avatars/${userId}_${Date.now()}`;
    await this.storage.set(key, file);
    return key;
  }
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  ) as T;
}
