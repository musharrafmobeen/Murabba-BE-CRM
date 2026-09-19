import { HttpException, HttpStatus } from '@nestjs/common';

export const ErrorCode = {
  USERNAME_INVALID: 'USERNAME_INVALID',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  PHONE_INVALID: 'PHONE_INVALID',
  PHONE_NOT_REGISTERED: 'PHONE_NOT_REGISTERED',
  PHONE_ALREADY_REGISTERED: 'PHONE_ALREADY_REGISTERED',
  TERMS_REQUIRED: 'TERMS_REQUIRED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  OTP_INVALID: 'OTP_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_LOCKED: 'OTP_LOCKED',
  OTP_RESEND_COOLDOWN: 'OTP_RESEND_COOLDOWN',
  OTP_RESEND_LIMIT: 'OTP_RESEND_LIMIT',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export class AppError extends HttpException {
  constructor(
    code: ErrorCode,
    message: string,
    status: HttpStatus,
    extra: Record<string, unknown> = {},
  ) {
    super({ error: code, message, ...extra }, status);
  }
}
