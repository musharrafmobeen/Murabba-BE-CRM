import { timingSafeEqual } from 'node:crypto';
import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { AppError, ErrorCode } from '../common/errors.js';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('ADMIN_API_KEY')?.trim() ?? '';
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers['x-admin-key'];
    const fromHeader = typeof header === 'string' ? header : '';
    const auth = req.headers.authorization;
    const fromBearer = auth?.startsWith('Bearer ') ? auth.slice(7) : '';
    const provided = fromHeader || fromBearer;

    if (!expected || !safeEqual(expected, provided)) {
      throw new AppError(ErrorCode.ADMIN_UNAUTHORIZED, HttpStatus.UNAUTHORIZED);
    }
    return true;
  }
}

function safeEqual(expected: string, provided: string): boolean {
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  if (left.length !== right.length) {
    return false;
  }
  return timingSafeEqual(left, right);
}
