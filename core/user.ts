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
    await this.db.update(schema.users, userId, { name, avatar });
  }

  async uploadUserAvatar(userId: number, file?: unknown) {
    if (!file || !(file instanceof File)) return;
    if (!file.name) return;

    const key = `avatars/${userId}_${Date.now()}`;
    await this.storage.set(key, file);
    return key;
  }
}
