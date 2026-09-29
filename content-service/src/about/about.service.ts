import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  found,
  latestActive,
  rethrowConflict,
  saveExclusiveActive,
} from '../common/cms.js';
import { AboutPage } from './about-page.entity.js';
import type { CreateAboutDto, UpdateAboutDto } from './about.dto.js';
import type { AboutContent } from './about.types.js';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(AboutPage)
    private readonly pages: Repository<AboutPage>,
  ) {}

  async get(): Promise<AboutContent> {
    const row = found(await latestActive(this.pages));
    return this.toPublic(row);
  }

  list() {
    return this.pages.find({ order: { updatedAt: 'DESC' } });
  }

  async getById(id: string) {
    return found(await this.pages.findOneBy({ id }));
  }

  async create(dto: CreateAboutDto) {
    const row = this.pages.create({
      imageUrl: dto.imageUrl ?? null,
      appVersion: dto.appVersion?.trim() ?? '',
      en: dto.en,
      ar: dto.ar,
      isActive: dto.isActive ?? true,
    });
    return saveExclusiveActive(this.pages, row);
  }

  async update(id: string, dto: UpdateAboutDto) {
    const row = await this.getById(id);
    if (dto.imageUrl !== undefined) row.imageUrl = dto.imageUrl;
    if (dto.appVersion !== undefined) row.appVersion = dto.appVersion.trim();
    if (dto.en) row.en = dto.en;
    if (dto.ar) row.ar = dto.ar;
    if (dto.isActive !== undefined) row.isActive = dto.isActive;
    return saveExclusiveActive(this.pages, row);
  }

  async remove(id: string) {
    const row = await this.getById(id);
    try {
      await this.pages.remove(row);
    } catch (error) {
      rethrowConflict(error);
    }
    return { id };
  }

  private toPublic(row: AboutPage): AboutContent {
    return {
      appVersion: row.appVersion,
      imageUrl: row.imageUrl,
      en: row.en,
      ar: row.ar,
    };
  }
}
