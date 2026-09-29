import { HttpStatus } from '@nestjs/common';
import { QueryFailedError, type Repository } from 'typeorm';
import { AppError, ErrorCode } from './errors.js';

export function found<T>(row: T | null | undefined): T {
  if (!row) {
    throw new AppError(ErrorCode.CONTENT_NOT_FOUND, HttpStatus.NOT_FOUND);
  }
  return row;
}

export async function latestActive<T extends { isActive: boolean }>(
  repo: Repository<T>,
): Promise<T | null> {
  const active = await repo.findOne({
    where: { isActive: true } as never,
    order: { updatedAt: 'DESC' } as never,
  });
  if (active) {
    return active;
  }
  return repo.findOne({ order: { updatedAt: 'DESC' } as never });
}

export async function saveExclusiveActive<T extends { isActive: boolean }>(
  repo: Repository<T>,
  row: T,
): Promise<T> {
  if (row.isActive) {
    await repo
      .createQueryBuilder()
      .update()
      .set({ isActive: false } as never)
      .execute();
    row.isActive = true;
  }
  try {
    return await repo.save(row);
  } catch (error) {
    rethrowConflict(error);
  }
}

export function rethrowConflict(error: unknown): never {
  if (
    error instanceof QueryFailedError &&
    (error as QueryFailedError & { driverError?: { code?: string } })
      .driverError?.code === '23505'
  ) {
    throw new AppError(ErrorCode.CONTENT_CONFLICT, HttpStatus.CONFLICT);
  }
  throw error;
}
