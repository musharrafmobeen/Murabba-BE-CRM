import { HttpException, HttpStatus } from '@nestjs/common';
import messages from './error-messages.json' with { type: 'json' };

export const ErrorCode = {
  CONTACT_PHONE_OR_EMAIL_REQUIRED: 'CONTACT_PHONE_OR_EMAIL_REQUIRED',
  CONTACT_PHONE_REQUIRED: 'CONTACT_PHONE_REQUIRED',
  PHONE_INVALID: 'PHONE_INVALID',
  EMAIL_INVALID: 'EMAIL_INVALID',
  TITLE_INVALID: 'TITLE_INVALID',
  CONTACT_TYPE_INVALID: 'CONTACT_TYPE_INVALID',
  MESSAGE_TOO_SHORT: 'MESSAGE_TOO_SHORT',
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
  PRIVACY_REQUIRED: 'PRIVACY_REQUIRED',
  CONTACT_RATE_LIMITED: 'CONTACT_RATE_LIMITED',
  RECOVERY_OTP_REQUIRED: 'RECOVERY_OTP_REQUIRED',
  RECOVERY_OTP_NOT_VERIFIED: 'RECOVERY_OTP_NOT_VERIFIED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',
  OTP_INVALID: 'OTP_INVALID',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_LOCKED: 'OTP_LOCKED',
  OTP_RESEND_COOLDOWN: 'OTP_RESEND_COOLDOWN',
  OTP_RESEND_LIMIT: 'OTP_RESEND_LIMIT',
  ADMIN_UNAUTHORIZED: 'ADMIN_UNAUTHORIZED',
  CONTENT_NOT_FOUND: 'CONTENT_NOT_FOUND',
  CONTENT_CONFLICT: 'CONTENT_CONFLICT',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
export type CopyKey = keyof typeof messages;

export type LocalizedMessage = {
  en: string;
  ar: string;
};

export function getCopy(key: CopyKey): LocalizedMessage {
  return messages[key];
}

export function getErrorMessage(code: ErrorCode): LocalizedMessage {
  return getCopy(code);
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
