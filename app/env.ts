import * as s from 'remix/data-schema';

const envSchema = s.object({
  NODE_ENV: s.string(),
  RESEND_API_KEY: s.string(),
  GITHUB_CLIENT_ID: s.string(),
  GITHUB_CLIENT_SECRET: s.string(),
  SESSION_SECRET: s.string(),
  SITE_URL: s.string(),
});

export const env = s.parse(envSchema, process.env);
