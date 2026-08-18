import { cloudflare } from '@cloudflare/vite-plugin';
import { remix } from '@pitlane/dev';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import devtoolsJson from 'vite-plugin-devtools-json';
import { defineConfig } from 'vite-plus';

const root = path.dirname(fileURLToPath(import.meta.url));
const remixCLI = (command: string) =>
  `node --env-file-if-exists=.env ${path.join(root, 'node_modules/remix/dist/cli-entry.js')} ${command}`;

// Load .env into the Vite process (`vp dev`). `vp run` tasks are separate
// processes and must load `.env` themselves (see remixCLI).
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
  resolve: {
    alias: {
      // Workerd cannot open a TCP `pg` socket. Alias the driver Remix's
      // postgres adapter imports so the Worker uses Neon's serverless Pool.
      pg: path.join(root, 'core/integrations/db/pg-shim.ts'),
    },
  },
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
      'db:migrate': {
        command: remixCLI('db migrate'),
      },
      'db:status': {
        command: remixCLI('db status'),
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
