import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { found, latestActive, saveExclusiveActive } from '../common/cms.js';
import { AppVersion } from './app-version.entity.js';
import type { CreateVersionDto, UpdateVersionDto } from './version.dto.js';
import type { VersionContent, VersionLocale } from './version.types.js';

const ENV_LABELS_EN: VersionLocale = {
  menuLabel: 'App Version',
  title: 'App Version',
  fallback: 'Version: Unknown',
};

const ENV_LABELS_AR: VersionLocale = {
  menuLabel: 'إصدار التطبيق',
  title: 'إصدار التطبيق',
  fallback: 'الإصدار: غير معروف',
};

@Injectable()
export class VersionService {
  constructor(
    @InjectRepository(AppVersion)
    private readonly versions: Repository<AppVersion>,
    private readonly config: ConfigService,
  ) {}

  async get(): Promise<VersionContent> {
    const row = await latestActive(this.versions);
    if (row) {
      return this.toPublic(row);
    }
    return this.fromEnv();
  }

  list() {
    return this.versions.find({ order: { updatedAt: 'DESC' } });
  }

  async getById(id: string) {
    return found(await this.versions.findOneBy({ id }));
  }

  async create(dto: CreateVersionDto) {
    const row = this.versions.create({
      version: dto.version.trim(),
      build: dto.build.trim(),
      channel: dto.channel?.trim() || 'production',
      en: dto.en,
      ar: dto.ar,
      isActive: dto.isActive ?? true,
    });
    return saveExclusiveActive(this.versions, row);
  }

  async update(id: string, dto: UpdateVersionDto) {
    const row = await this.getById(id);
    if (dto.version !== undefined) row.version = dto.version.trim();
    if (dto.build !== undefined) row.build = dto.build.trim();
    if (dto.channel !== undefined) row.channel = dto.channel.trim();
    if (dto.en) row.en = dto.en;
    if (dto.ar) row.ar = dto.ar;
    if (dto.isActive !== undefined) row.isActive = dto.isActive;
    return saveExclusiveActive(this.versions, row);
  }

  async remove(id: string) {
    await this.versions.remove(await this.getById(id));
    return { id };
  }

  private fromEnv(): VersionContent {
    const version = this.config.get<string>('APP_VERSION')?.trim() ?? '';
    const build = this.config.get<string>('APP_BUILD')?.trim() ?? '';
    const channel =
      this.config.get<string>('APP_CHANNEL')?.trim() || 'production';
    return this.toPublic({
      version,
      build,
      channel,
      en: ENV_LABELS_EN,
      ar: ENV_LABELS_AR,
    });
  }

  private toPublic(row: {
    version: string;
    build: string;
    channel: string;
    en: VersionLocale;
    ar: VersionLocale;
  }): VersionContent {
    const version = row.version?.trim() || '';
    const build = row.build?.trim() || '';
    const display =
      version && build
        ? `v${version} | Build ${build}`
        : version
          ? `v${version}`
          : build
            ? `Build ${build}`
            : row.en.fallback;
    return {
      version,
      build,
      channel: row.channel,
      display,
      en: row.en,
      ar: row.ar,
    };
  }
}
