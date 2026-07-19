import type { FileStorage } from 'remix/file-storage';
import { createFsFileStorage } from 'remix/file-storage/fs';

export type StorageClient = FileStorage;

export const storage = createFsFileStorage('./uploads');
