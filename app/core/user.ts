import type { DatabaseClient } from './integrations/db.ts';
import { schema } from './integrations/db/schema.ts';
import type { StorageClient } from './integrations/storage.ts';

export class UserService {
  constructor(
    private db: DatabaseClient,
    private storage: StorageClient,
  ) {}

  async getUserByEmail(email: string) {
    return this.db.findOne(schema.users, { where: { email } });
  }

  async updateUser(userId: number, name: string, image?: string) {
    await this.db.update(schema.users, userId, { name, image });
  }

  async uploadUserImage(userId: number, file?: unknown) {
    if (!file || !(file instanceof File)) return;
    if (!file.name) return;

    const key = `avatars/${userId}_${Date.now()}`;
    await this.storage.set(key, file);
    return key;
  }
}
