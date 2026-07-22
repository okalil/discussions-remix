import { createAssetServer } from 'remix/assets';

const rootDir = process.cwd();

export const assetServer = createAssetServer({
  basePath: '/assets',
  rootDir,
  fileMap: {
    'app/*path': 'app/*path',
    'packages/*path': 'packages/*path',
    'node_modules/*path': 'node_modules/*path',
  },
  allow: [
    'app/assets/**',
    'app/routes.ts',
    'app/**/*.browser.*',
    'node_modules/**',
    'packages/**',
  ],
  deny: ['app/**/*.server.*'],
  sourceMaps: process.env.NODE_ENV === 'development' ? 'external' : undefined,
  scripts: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV ?? 'development',
      ),
    },
  },
});
