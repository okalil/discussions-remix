import { createAssetResolver } from 'pitlane/assets';
import manifest from 'pitlane/assets/manifest';

export const assets = createAssetResolver(manifest);

export const scriptEntry = await assets.getScriptEntry('app/entry.client.ts');
export const stylesheets = await assets.getStylesheets('app/entry.server.ts');
