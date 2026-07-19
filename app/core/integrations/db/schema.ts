import { column as c, table, timestamps } from 'remix/data-table';

export const users = table({
  name: 'users',
  columns: {
    id: c.integer().primaryKey().autoIncrement(),
    email: c.varchar(255).notNull().unique(),
    name: c.varchar(255).notNull(),
    image: c.varchar(1024).nullable(),
    email_verified: c.boolean().notNull().default(false),
  },
  primaryKey: 'id',
});

export const accounts = table({
  name: 'accounts',
  columns: {
    id: c.integer().primaryKey().autoIncrement(),
    type: c.varchar(32).notNull(),
    provider: c.varchar(128).nullable(),
    provider_account_id: c.varchar(255).nullable(),
    password: c.varchar(255).nullable(),
    user_id: c
      .integer()
      .notNull()
      .references('users', 'id')
      .onDelete('cascade'),
  },
  primaryKey: 'id',
});

export const sessions = table({
  name: 'sessions',
  columns: {
    id: c.varchar(255).primaryKey(),
    user_id: c
      .integer()
      .notNull()
      .references('users', 'id')
      .onDelete('cascade'),
    expires: c.varchar(255).notNull(),
  },
  primaryKey: 'id',
});

export const verificationTokens = table({
  name: 'verification_tokens',
  columns: {
    identifier: c.varchar(255).notNull(),
    token: c.varchar(255).notNull().primaryKey(),
    expires: c.varchar(255).notNull(),
  },
  primaryKey: 'token',
});

export const categories = table({
  name: 'categories',
  columns: {
    id: c.integer().primaryKey().autoIncrement(),
    emoji: c.varchar(32).notNull(),
    title: c.varchar(255).notNull(),
    description: c.text().notNull(),
    slug: c.varchar(255).notNull().unique(),
  },
  primaryKey: 'id',
});

export const discussions = table({
  name: 'discussions',
  columns: {
    id: c.integer().primaryKey().autoIncrement(),
    title: c.varchar(255).notNull(),
    body: c.text().notNull(),
    category_id: c
      .integer()
      .notNull()
      .references('categories', 'id')
      .onDelete('cascade'),
    author_id: c
      .integer()
      .notNull()
      .references('users', 'id')
      .onDelete('cascade'),
    ...timestamps(),
  },
  primaryKey: 'id',
  timestamps: true,
});

export const comments = table({
  name: 'comments',
  columns: {
    id: c.integer().primaryKey().autoIncrement(),
    body: c.text().notNull(),
    author_id: c
      .integer()
      .notNull()
      .references('users', 'id')
      .onDelete('cascade'),
    discussion_id: c
      .integer()
      .notNull()
      .references('discussions', 'id')
      .onDelete('cascade'),
    ...timestamps(),
  },
  primaryKey: 'id',
  timestamps: true,
});

export const discussionVotes = table({
  name: 'discussion_votes',
  columns: {
    user_id: c
      .integer()
      .notNull()
      .references('users', 'id')
      .onDelete('cascade'),
    discussion_id: c
      .integer()
      .notNull()
      .references('discussions', 'id')
      .onDelete('cascade'),
  },
  primaryKey: ['user_id', 'discussion_id'],
});

export const commentVotes = table({
  name: 'comment_votes',
  columns: {
    user_id: c
      .integer()
      .notNull()
      .references('users', 'id')
      .onDelete('cascade'),
    comment_id: c
      .integer()
      .notNull()
      .references('comments', 'id')
      .onDelete('cascade'),
  },
  primaryKey: ['user_id', 'comment_id'],
});

export const schema = {
  users,
  accounts,
  sessions,
  verificationTokens,
  categories,
  discussions,
  comments,
  discussionVotes,
  commentVotes,
};
