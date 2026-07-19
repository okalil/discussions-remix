import type { DatabaseSync } from 'node:sqlite';

export async function setup(sqlite: DatabaseSync) {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      image VARCHAR(1024),
      email_verified BOOLEAN NOT NULL DEFAULT FALSE
    );

    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type VARCHAR(32) NOT NULL,
      provider VARCHAR(128),
      provider_account_id VARCHAR(255),
      password VARCHAR(255),
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(255) PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS verification_tokens (
      identifier VARCHAR(255) NOT NULL,
      token VARCHAR(255) PRIMARY KEY,
      expires VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      emoji VARCHAR(32) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS discussions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      body TEXT NOT NULL,
      author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
      created_at VARCHAR(255) NOT NULL
    );

    CREATE TABLE IF NOT EXISTS discussion_votes (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      discussion_id INTEGER NOT NULL REFERENCES discussions(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, discussion_id)
    );

    CREATE TABLE IF NOT EXISTS comment_votes (
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, comment_id)
    );
  `);
}
