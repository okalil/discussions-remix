import { remix } from '@pitlane/dev';
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
      serverEntry: 'app/router.ts',
      clientEntry: 'app/client.ts',
    }),
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
        command: 'vp dev --host',
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
