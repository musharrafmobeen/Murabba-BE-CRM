import { mkdir, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PHOTO_MIME_EXT } from '../common/constants.js';

@Injectable()
export class LocalPhotoStore {
  constructor(private readonly config: ConfigService) {}

  root(): string {
    return this.config.get<string>('UPLOAD_DIR') || join(process.cwd(), 'uploads');
  }

  async save(userId: string, buffer: Buffer, ext: string): Promise<string> {
    const dir = join(this.root(), 'profiles');
    await mkdir(dir, { recursive: true });
    await this.removeUserFiles(userId);
    const relative = `profiles/${userId}${ext}`;
    await writeFile(join(this.root(), relative), buffer);
    return relative;
  }

  async remove(relativePath: string | null | undefined): Promise<void> {
    if (!relativePath) {
      return;
    }
    await unlink(join(this.root(), relativePath)).catch(() => undefined);
  }

  private async removeUserFiles(userId: string): Promise<void> {
    await Promise.all(
      Object.values(PHOTO_MIME_EXT).map((ext) =>
        unlink(join(this.root(), 'profiles', `${userId}${ext}`)).catch(
          () => undefined,
        ),
      ),
    );
  }
}
