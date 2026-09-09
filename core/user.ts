import type { Database } from './integrations/db.ts';
import { schema } from './integrations/db/schema.ts';
import type { FileStorage } from './integrations/storage.ts';
import type { UpdateUserInput } from './user.types.ts';

export class UserService {
  constructor(
    private db: Database,
    private storage: FileStorage,
  ) {}

  async updateUser(id: number, { name, avatar }: UpdateUserInput) {
    const key = avatar ? await this.uploadUserAvatar(id, avatar) : undefined;
    const changes = stripUndefined({ name, avatar: key });
    await this.db.update(schema.users, id, changes);
  }

  private async uploadUserAvatar(id: number, file: File) {
    const key = `avatars/${id}_${Date.now()}`;
    await this.storage.set(key, file);
    return key;
  }
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => value !== undefined),
  ) as T;
}
