import type { DatabaseClient } from './integrations/db.ts';
import { schema } from './integrations/db/schema.ts';

export class CategoryService {
  constructor(private db: DatabaseClient) {}

  async getCategories() {
    const categories = await this.db.findMany(schema.categories);

    if (!categories.length) {
      return this.db.createMany(
        schema.categories,
        [
          {
            emoji: '💬',
            title: 'General',
            description: 'General topics and discussions about anything',
            slug: 'general',
          },
          {
            emoji: '💡',
            title: 'Ideas & Suggestions',
            description:
              'Share your ideas and suggestions for improving our platform',
            slug: 'ideas-and-suggestions',
          },
          {
            emoji: '🐛',
            title: 'Bug Reports',
            description: "Report issues and bugs you've encountered",
            slug: 'bug-reports',
          },
          {
            emoji: '🎉',
            title: 'Announcements',
            description: 'Important updates and announcements from the team',
            slug: 'announcements',
          },
        ],
        { returnRows: true },
      );
    }

    return categories;
  }
}
