import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  found,
  latestActive,
  rethrowConflict,
  saveExclusiveActive,
} from '../common/cms.js';
import { AppLanguage } from './app-language.entity.js';
import type {
  CreateLanguageDto,
  CreateLanguagePageDto,
  UpdateLanguageDto,
  UpdateLanguagePageDto,
} from './language.dto.js';
import { LanguagePage } from './language-page.entity.js';
import type { LanguageContent } from './language.types.js';

@Injectable()
export class LanguageService {
  constructor(
    @InjectRepository(LanguagePage)
    private readonly pages: Repository<LanguagePage>,
    @InjectRepository(AppLanguage)
    private readonly languages: Repository<AppLanguage>,
  ) {}

  async get(): Promise<LanguageContent> {
    const page = found(await latestActive(this.pages));
    const rows = await this.languages.find({
      where: { isEnabled: true },
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    return {
      defaultMode: 'system',
      fallbackCode: page.fallbackCode,
      en: page.en,
      ar: page.ar,
      languages: rows.map((row) => ({
        code: row.code,
        name: { en: row.nameEn, ar: row.nameAr },
        nativeName: row.nativeName,
        flag: row.flag,
        direction: row.direction,
      })),
    };
  }

  listPages() {
    return this.pages.find({ order: { updatedAt: 'DESC' } });
  }

  async getPage(id: string) {
    return found(await this.pages.findOneBy({ id }));
  }

  async createPage(dto: CreateLanguagePageDto) {
    const row = this.pages.create({
      en: dto.en,
      ar: dto.ar,
      fallbackCode: dto.fallbackCode?.trim().toLowerCase() || 'en',
      isActive: dto.isActive ?? true,
    });
    return saveExclusiveActive(this.pages, row);
  }

  async updatePage(id: string, dto: UpdateLanguagePageDto) {
    const row = await this.getPage(id);
    if (dto.en) row.en = dto.en;
    if (dto.ar) row.ar = dto.ar;
    if (dto.fallbackCode !== undefined) {
      row.fallbackCode = dto.fallbackCode.trim().toLowerCase();
    }
    if (dto.isActive !== undefined) row.isActive = dto.isActive;
    return saveExclusiveActive(this.pages, row);
  }

  async removePage(id: string) {
    await this.pages.remove(await this.getPage(id));
    return { id };
  }

  listLanguages() {
    return this.languages.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
  }

  async getLanguage(id: string) {
    return found(await this.languages.findOneBy({ id }));
  }

  async createLanguage(dto: CreateLanguageDto) {
    const row = this.languages.create({
      code: dto.code.trim().toLowerCase(),
      nameEn: dto.nameEn.trim(),
      nameAr: dto.nameAr.trim(),
      nativeName: dto.nativeName.trim(),
      flag: dto.flag.trim(),
      direction: dto.direction,
      sortOrder: dto.sortOrder ?? 0,
      isEnabled: dto.isEnabled ?? true,
    });
    try {
      return await this.languages.save(row);
    } catch (error) {
      rethrowConflict(error);
    }
  }

  async updateLanguage(id: string, dto: UpdateLanguageDto) {
    const row = await this.getLanguage(id);
    if (dto.code !== undefined) row.code = dto.code.trim().toLowerCase();
    if (dto.nameEn !== undefined) row.nameEn = dto.nameEn.trim();
    if (dto.nameAr !== undefined) row.nameAr = dto.nameAr.trim();
    if (dto.nativeName !== undefined) row.nativeName = dto.nativeName.trim();
    if (dto.flag !== undefined) row.flag = dto.flag.trim();
    if (dto.direction !== undefined) row.direction = dto.direction;
    if (dto.sortOrder !== undefined) row.sortOrder = dto.sortOrder;
    if (dto.isEnabled !== undefined) row.isEnabled = dto.isEnabled;
    try {
      return await this.languages.save(row);
    } catch (error) {
      rethrowConflict(error);
    }
  }

  async removeLanguage(id: string) {
    await this.languages.remove(await this.getLanguage(id));
    return { id };
  }
}
