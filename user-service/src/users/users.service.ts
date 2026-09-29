import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import {
  BIO_MAX,
  CITY_MAX,
  DISPLAY_NAME_MAX,
  PHOTO_MAX_BYTES,
  PHOTO_MIME_EXT,
} from '../common/constants.js';
import { AppError, ErrorCode } from '../common/errors.js';
import { LocalPhotoStore } from './local-photo.store.js';
import type { PhotoFile, UpdateProfileDto } from './profile.dto.js';
import { User } from './user.entity.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly photos: LocalPhotoStore,
  ) {}

  findById(id: string): Promise<User | null> {
    return this.users.findOne({ where: { id } });
  }

  findByPhone(phone: string): Promise<User | null> {
    return this.users.findOne({ where: { phone } });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.users.findOne({ where: { username: ILike(username) } });
  }

  async create(username: string, phone: string): Promise<User> {
    const now = new Date();
    const user = this.users.create({
      username,
      phone,
      isAdvertiser: false,
      termsAcceptedAt: now,
      lastLoginAt: now,
    });
    return this.users.save(user);
  }

  async markLogin(user: User): Promise<User> {
    user.lastLoginAt = new Date();
    return this.users.save(user);
  }

  async bumpTokenVersion(user: User): Promise<void> {
    user.tokenVersion += 1;
    await this.users.save(user);
  }

  async updateProfile(user: User, dto: UpdateProfileDto): Promise<User> {
    if (dto.displayName !== undefined) {
      user.displayName = this.optionalText(
        dto.displayName,
        DISPLAY_NAME_MAX,
        ErrorCode.DISPLAY_NAME_INVALID,
      );
    }
    if (dto.city !== undefined) {
      user.city = this.optionalText(dto.city, CITY_MAX, ErrorCode.CITY_INVALID);
    }
    if (dto.bio !== undefined) {
      user.bio = this.optionalText(dto.bio, BIO_MAX, ErrorCode.BIO_INVALID);
    }
    return this.users.save(user);
  }

  async savePhoto(user: User, file?: PhotoFile): Promise<User> {
    if (!file?.buffer?.length) {
      throw new AppError(ErrorCode.PHOTO_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    if (file.size > PHOTO_MAX_BYTES) {
      throw new AppError(ErrorCode.PHOTO_TOO_LARGE, HttpStatus.BAD_REQUEST);
    }
    const ext =
      PHOTO_MIME_EXT[file.mimetype as keyof typeof PHOTO_MIME_EXT];
    if (!ext) {
      throw new AppError(ErrorCode.PHOTO_INVALID, HttpStatus.BAD_REQUEST);
    }
    user.photoPath = await this.photos.save(user.id, file.buffer, ext);
    return this.users.save(user);
  }

  async remove(user: User): Promise<void> {
    await this.photos.remove(user.photoPath);
    await this.users.remove(user);
  }

  toPublic(user: User) {
    return {
      id: user.id,
      username: user.username,
      phone: user.phone,
      displayName: user.displayName ?? null,
      city: user.city ?? null,
      bio: user.bio ?? null,
      photoUrl: user.photoPath ? `/uploads/${user.photoPath}` : null,
      isAdvertiser: Boolean(user.isAdvertiser),
    };
  }

  private optionalText(
    value: string,
    max: number,
    code: ErrorCode,
  ): string | null {
    const text = value.trim();
    if (!text) {
      return null;
    }
    if (text.length > max) {
      throw new AppError(code, HttpStatus.BAD_REQUEST);
    }
    return text;
  }
}
