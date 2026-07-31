import type {
  FileLike,
  FileStorage,
  ListOptions,
  ListResult,
} from 'remix/file-storage';

/**
 * Creates a {@link FileStorage} backed by a Cloudflare R2 bucket.
 *
 * @example
 * ```ts
 * import { createR2FileStorage } from './storage/adapters/r2.ts';
 *
 * export const storage = createR2FileStorage(env.R2);
 * ```
 */
export function createR2FileStorage(bucket: R2Bucket): FileStorage {
  async function putFile(key: string, file: FileLike): Promise<File> {
    const buffer = await file.arrayBuffer();
    const lastModified = file.lastModified || Date.now();

    await bucket.put(key, buffer, {
      httpMetadata: {
        contentType: file.type || 'application/octet-stream',
      },
      customMetadata: {
        name: file.name,
        lastModified: String(lastModified),
      },
    });

    return new File([buffer], file.name, {
      type: file.type,
      lastModified,
    });
  }

  return {
    async get(key) {
      const object = await bucket.get(key);
      if (!object) return null;

      const name = object.customMetadata?.name ?? key;
      const type =
        object.httpMetadata?.contentType ??
        object.customMetadata?.type ??
        'application/octet-stream';
      const lastModified = Number(
        object.customMetadata?.lastModified ?? object.uploaded.getTime(),
      );

      return new File([await object.arrayBuffer()], name, {
        type,
        lastModified,
      });
    },

    async has(key) {
      return (await bucket.head(key)) !== null;
    },

    async list<T extends ListOptions>(options?: T): Promise<ListResult<T>> {
      const {
        cursor,
        includeMetadata = false,
        limit = 1000,
        prefix,
      } = options ?? {};

      const listed = await bucket.list({
        cursor,
        limit,
        prefix,
        include: includeMetadata
          ? ['httpMetadata', 'customMetadata']
          : undefined,
      });

      const files = listed.objects.map((object) => {
        if (!includeMetadata) {
          return { key: object.key };
        }

        return {
          key: object.key,
          lastModified: Number(
            object.customMetadata?.lastModified ?? object.uploaded.getTime(),
          ),
          name: object.customMetadata?.name ?? object.key,
          size: object.size,
          type:
            object.httpMetadata?.contentType ??
            object.customMetadata?.type ??
            'application/octet-stream',
        };
      });

      return {
        cursor: listed.truncated ? listed.cursor : undefined,
        files,
      } as ListResult<T>;
    },

    put(key, file) {
      return putFile(key, file);
    },

    async remove(key) {
      await bucket.delete(key);
    },

    async set(key, file) {
      await putFile(key, file);
    },
  };
}
