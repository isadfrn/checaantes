import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { StorageService, type UploadFile } from './storage.service.js';

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

@Injectable()
export class LocalDiskStorageService extends StorageService {
  private readonly logger = new Logger(LocalDiskStorageService.name);
  private readonly baseDir = process.env.UPLOAD_DIR ?? 'uploads';
  private readonly publicPrefix = '/uploads';
  private readonly appUrl = process.env.APP_URL ?? 'http://localhost:3000';

  async save(file: UploadFile, keyPrefix: string): Promise<string> {
    const ext =
      MIME_TO_EXT[file.mimeType] ??
      extname(file.originalName).replace('.', '').toLowerCase() ??
      'bin';
    const fileName = `${randomBytes(12).toString('hex')}.${ext}`;

    const dir = join(this.baseDir, keyPrefix);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, fileName), file.buffer);

    return `${this.appUrl}${this.publicPrefix}/${keyPrefix}/${fileName}`;
  }

  async remove(url: string): Promise<void> {
    const marker = `${this.publicPrefix}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;

    const relativePath = url.slice(idx + marker.length);
    try {
      await unlink(join(this.baseDir, relativePath));
    } catch (err) {
      this.logger.warn(
        `Não foi possível remover o arquivo ${relativePath}: ${
          (err as Error).message
        }`,
      );
    }
  }
}
