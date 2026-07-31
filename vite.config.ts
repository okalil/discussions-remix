import { cloudflare } from '@cloudflare/vite-plugin';
import { remix } from '@pitlane/dev';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vite-plus';

// Load .env into the dev-server process so request middleware (like the
// database) can read it. Production reads real environment variables.
try {
  process.loadEnvFile('.env');
} catch {
  // no .env file — rely on ambient environment variables
}

export default defineConfig({
  plugins: [
    remix({
      serverEntry: 'app/entry.server.ts',
      clientEntry: 'app/entry.client.ts',
      serverHandler: false,
    }),
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    devtoolsJson(),
  ],
  server: {
    port: 44100,
  },
  css: {
    transformer: 'lightningcss',
  },
  run: {
    tasks: {
      dev: {
        dependsOn: ['db:migrate'],
        command: 'vp dev --host',
      },
      'db:generate': {
        command: 'node db/generate-migrations.ts',
      },
      'db:migrate': {
        dependsOn: ['db:generate'],
        command: 'wrangler d1 migrations apply DB --local',
      },
      'db:migrate:remote': {
        dependsOn: ['db:generate'],
        command: 'wrangler d1 migrations apply DB --remote',
      },
      'db:reset': {
        command: 'rm -rf .wrangler/state/v3/d1',
        cache: false,
      },
      typecheck: {
        command: 'tsc',
        cache: false,
      },
    },
  },
  fmt: {
    ignorePatterns: ['node_modules', 'dist/**'],
    printWidth: 80,
    singleQuote: true,
    sortImports: {
      groups: [
        ['value-builtin', 'value-external', 'type-builtin', 'type-external'],
        ['value-internal', 'type-internal'],
        [
          'value-parent',
          'value-sibling',
          'value-index',
          'type-parent',
          'type-sibling',
          'type-index',
        ],
        'unknown',
      ],
    },
  },
  lint: {
    ignorePatterns: ['node_modules', 'dist/**'],
    plugins: ['typescript', 'unicorn', 'oxc'],
    categories: {
      correctness: 'error',
    },
    env: {
      builtin: true,
      browser: true,
      node: true,
    },
    rules: {
      'no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          fix: {
            imports: 'safe-fix',
            variables: 'off',
          },
        },
      ],
      'typescript/no-explicit-any': 'warn',
      'typescript/consistent-type-imports': [
        'warn',
        {
          prefer: 'type-imports',
          disallowTypeAnnotations: true,
        },
      ],
    },
  },
});
