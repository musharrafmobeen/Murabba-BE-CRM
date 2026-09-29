import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  found,
  latestActive,
  rethrowConflict,
  saveExclusiveActive,
} from '../common/cms.js';
import { HelpCategory } from './help-category.entity.js';
import { HelpItem } from './help-item.entity.js';
import { HelpPage } from './help-page.entity.js';
import type {
  CreateHelpCategoryDto,
  CreateHelpItemDto,
  CreateHelpPageDto,
  UpdateHelpCategoryDto,
  UpdateHelpItemDto,
  UpdateHelpPageDto,
} from './help.dto.js';
import type { HelpContent } from './help.types.js';

@Injectable()
export class HelpService {
  constructor(
    @InjectRepository(HelpPage)
    private readonly pages: Repository<HelpPage>,
    @InjectRepository(HelpCategory)
    private readonly categories: Repository<HelpCategory>,
    @InjectRepository(HelpItem)
    private readonly items: Repository<HelpItem>,
  ) {}

  async get(): Promise<HelpContent> {
    const page = found(await latestActive(this.pages));
    const categories = await this.categories.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
    const items = await this.items.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });

    return {
      en: {
        ...page.en,
        categories: categories.map((category) => ({
          id: category.slug,
          name: category.nameEn,
          items: items
            .filter((item) => item.categoryId === category.id)
            .map((item) => ({
              id: item.slug,
              question: item.questionEn,
              answer: item.answerEn,
            })),
        })),
      },
      ar: {
        ...page.ar,
        categories: categories.map((category) => ({
          id: category.slug,
          name: category.nameAr,
          items: items
            .filter((item) => item.categoryId === category.id)
            .map((item) => ({
              id: item.slug,
              question: item.questionAr,
              answer: item.answerAr,
            })),
        })),
      },
    };
  }

  listPages() {
    return this.pages.find({ order: { updatedAt: 'DESC' } });
  }

  async getPage(id: string) {
    return found(await this.pages.findOneBy({ id }));
  }

  async createPage(dto: CreateHelpPageDto) {
    const row = this.pages.create({
      en: dto.en,
      ar: dto.ar,
      isActive: dto.isActive ?? true,
    });
    return saveExclusiveActive(this.pages, row);
  }

  async updatePage(id: string, dto: UpdateHelpPageDto) {
    const row = await this.getPage(id);
    if (dto.en) row.en = dto.en;
    if (dto.ar) row.ar = dto.ar;
    if (dto.isActive !== undefined) row.isActive = dto.isActive;
    return saveExclusiveActive(this.pages, row);
  }

  async removePage(id: string) {
    await this.pages.remove(await this.getPage(id));
    return { id };
  }

  listCategories() {
    return this.categories.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  async getCategory(id: string) {
    return found(await this.categories.findOneBy({ id }));
  }

  async createCategory(dto: CreateHelpCategoryDto) {
    const row = this.categories.create({
      slug: dto.slug.trim(),
      nameEn: dto.nameEn.trim(),
      nameAr: dto.nameAr.trim(),
      sortOrder: dto.sortOrder ?? 0,
    });
    try {
      return await this.categories.save(row);
    } catch (error) {
      rethrowConflict(error);
    }
  }

  async updateCategory(id: string, dto: UpdateHelpCategoryDto) {
    const row = await this.getCategory(id);
    if (dto.slug !== undefined) row.slug = dto.slug.trim();
    if (dto.nameEn !== undefined) row.nameEn = dto.nameEn.trim();
    if (dto.nameAr !== undefined) row.nameAr = dto.nameAr.trim();
    if (dto.sortOrder !== undefined) row.sortOrder = dto.sortOrder;
    try {
      return await this.categories.save(row);
    } catch (error) {
      rethrowConflict(error);
    }
  }

  async removeCategory(id: string) {
    await this.categories.remove(await this.getCategory(id));
    return { id };
  }

  listItems() {
    return this.items.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  async getItem(id: string) {
    return found(await this.items.findOneBy({ id }));
  }

  async createItem(dto: CreateHelpItemDto) {
    await this.getCategory(dto.categoryId);
    const row = this.items.create({
      categoryId: dto.categoryId,
      slug: dto.slug.trim(),
      questionEn: dto.questionEn.trim(),
      answerEn: dto.answerEn.trim(),
      questionAr: dto.questionAr.trim(),
      answerAr: dto.answerAr.trim(),
      sortOrder: dto.sortOrder ?? 0,
    });
    try {
      return await this.items.save(row);
    } catch (error) {
      rethrowConflict(error);
    }
  }

  async updateItem(id: string, dto: UpdateHelpItemDto) {
    const row = await this.getItem(id);
    if (dto.categoryId !== undefined) {
      await this.getCategory(dto.categoryId);
      row.categoryId = dto.categoryId;
    }
    if (dto.slug !== undefined) row.slug = dto.slug.trim();
    if (dto.questionEn !== undefined) row.questionEn = dto.questionEn.trim();
    if (dto.answerEn !== undefined) row.answerEn = dto.answerEn.trim();
    if (dto.questionAr !== undefined) row.questionAr = dto.questionAr.trim();
    if (dto.answerAr !== undefined) row.answerAr = dto.answerAr.trim();
    if (dto.sortOrder !== undefined) row.sortOrder = dto.sortOrder;
    try {
      return await this.items.save(row);
    } catch (error) {
      rethrowConflict(error);
    }
  }

  async removeItem(id: string) {
    await this.items.remove(await this.getItem(id));
    return { id };
  }
}
