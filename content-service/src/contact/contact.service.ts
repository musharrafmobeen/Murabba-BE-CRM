import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import {
  CONTACT_RATE_LIMIT,
  CONTACT_RATE_WINDOW_MS,
  EMAIL_PATTERN,
  MESSAGE_MAX,
  MESSAGE_MIN,
  PHONE_PATTERN,
  TITLE_MAX,
  TITLE_MIN,
} from '../common/constants.js';
import { found, rethrowConflict } from '../common/cms.js';
import { AppError, ErrorCode, getCopy } from '../common/errors.js';
import { addMs, normalizePhone } from '../common/utils.js';
import { ContactSubmission } from './contact-submission.entity.js';
import { ContactType } from './contact-type.entity.js';
import type { CreateContactTypeDto, UpdateContactTypeDto } from './contact-type.dto.js';
import type { CreateContactDto } from './contact.dto.js';

@Injectable()
export class ContactService {
  constructor(
    @InjectRepository(ContactSubmission)
    private readonly submissions: Repository<ContactSubmission>,
    @InjectRepository(ContactType)
    private readonly typesRepo: Repository<ContactType>,
  ) {}

  async types() {
    const rows = await this.typesRepo.find({
      order: { sortOrder: 'ASC', createdAt: 'ASC' },
    });
    return {
      types: rows.map((row) => ({
        value: row.code,
        label: { en: row.labelEn, ar: row.labelAr },
      })),
    };
  }

  listTypes() {
    return this.typesRepo.find({ order: { sortOrder: 'ASC', createdAt: 'ASC' } });
  }

  async getType(id: string) {
    return found(await this.typesRepo.findOneBy({ id }));
  }

  async createType(dto: CreateContactTypeDto) {
    const row = this.typesRepo.create({
      code: dto.code.trim().toUpperCase(),
      labelEn: dto.labelEn.trim(),
      labelAr: dto.labelAr.trim(),
      sortOrder: dto.sortOrder ?? 0,
    });
    try {
      return await this.typesRepo.save(row);
    } catch (error) {
      rethrowConflict(error);
    }
  }

  async updateType(id: string, dto: UpdateContactTypeDto) {
    const row = await this.getType(id);
    if (dto.code !== undefined) row.code = dto.code.trim().toUpperCase();
    if (dto.labelEn !== undefined) row.labelEn = dto.labelEn.trim();
    if (dto.labelAr !== undefined) row.labelAr = dto.labelAr.trim();
    if (dto.sortOrder !== undefined) row.sortOrder = dto.sortOrder;
    try {
      return await this.typesRepo.save(row);
    } catch (error) {
      rethrowConflict(error);
    }
  }

  async removeType(id: string) {
    await this.typesRepo.remove(await this.getType(id));
    return { id };
  }

  async create(dto: CreateContactDto) {
    if (!dto.acceptedPrivacy) {
      throw new AppError(ErrorCode.PRIVACY_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const phone = dto.phone?.trim() ? normalizePhone(dto.phone) : null;
    const email = dto.email?.trim() ? dto.email.trim().toLowerCase() : null;
    const title = dto.title?.trim() ?? '';
    const message = dto.message?.trim() ?? '';
    const type = dto.type?.trim().toUpperCase() ?? '';

    if (!phone && !email) {
      throw new AppError(
        ErrorCode.CONTACT_PHONE_OR_EMAIL_REQUIRED,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (phone && !PHONE_PATTERN.test(phone)) {
      throw new AppError(ErrorCode.PHONE_INVALID, HttpStatus.BAD_REQUEST);
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      throw new AppError(ErrorCode.EMAIL_INVALID, HttpStatus.BAD_REQUEST);
    }
    if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
      throw new AppError(ErrorCode.TITLE_INVALID, HttpStatus.BAD_REQUEST);
    }
    const typeRow = await this.typesRepo.findOneBy({ code: type });
    if (!typeRow) {
      throw new AppError(ErrorCode.CONTACT_TYPE_INVALID, HttpStatus.BAD_REQUEST);
    }
    if (message.length < MESSAGE_MIN) {
      throw new AppError(ErrorCode.MESSAGE_TOO_SHORT, HttpStatus.BAD_REQUEST);
    }
    if (message.length > MESSAGE_MAX) {
      throw new AppError(ErrorCode.MESSAGE_TOO_LONG, HttpStatus.BAD_REQUEST);
    }

    await this.assertNotRateLimited(phone, email);

    const row = await this.submissions.save(
      this.submissions.create({
        phone,
        email,
        title,
        type,
        message,
        acceptedPrivacyAt: new Date(),
      }),
    );

    return {
      id: row.id,
      message: getCopy('CONTACT_RECEIVED'),
      followUp: getCopy('CONTACT_RECEIVED_FOLLOW_UP'),
    };
  }

  private async assertNotRateLimited(
    phone: string | null,
    email: string | null,
  ) {
    const since = addMs(-CONTACT_RATE_WINDOW_MS);
    const count = await this.submissions.count({
      where: phone
        ? email
          ? [
              { phone, createdAt: MoreThan(since) },
              { email, createdAt: MoreThan(since) },
            ]
          : { phone, createdAt: MoreThan(since) }
        : { email: email as string, createdAt: MoreThan(since) },
    });

    if (count >= CONTACT_RATE_LIMIT) {
      throw new AppError(
        ErrorCode.CONTACT_RATE_LIMITED,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }
}
