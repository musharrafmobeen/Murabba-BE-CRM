import { HttpException, HttpStatus } from '@nestjs/common';
import errorMessages from './error-messages.json' with { type: 'json' };

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
  PHOTO_REQUIRED: 'PHOTO_REQUIRED',
  PHOTO_INVALID: 'PHOTO_INVALID',
  PHOTO_TOO_LARGE: 'PHOTO_TOO_LARGE',
  DISPLAY_NAME_INVALID: 'DISPLAY_NAME_INVALID',
  CITY_INVALID: 'CITY_INVALID',
  BIO_INVALID: 'BIO_INVALID',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  FOLLOW_SELF: 'FOLLOW_SELF',
  FOLLOW_NOT_ALLOWED: 'FOLLOW_NOT_ALLOWED',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export type LocalizedMessage = {
  en: string;
  ar: string;
};

export function getErrorMessage(code: ErrorCode): LocalizedMessage {
  return errorMessages[code];
}

export class AppError extends HttpException {
  constructor(
    code: ErrorCode,
    status: HttpStatus,
    extra: Record<string, unknown> = {},
  ) {
    super({ error: code, message: getErrorMessage(code), ...extra }, status);
  }
}
