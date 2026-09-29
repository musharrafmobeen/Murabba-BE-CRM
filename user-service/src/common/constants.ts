export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 2 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_LOCKOUT_MS = 5 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
export const OTP_MAX_RESENDS = 3;

export const USERNAME_MIN = 3;
export const USERNAME_MAX = 20;
export const USERNAME_PATTERN = /^[A-Za-z0-9_-]+$/;
export const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;

export const DISPLAY_NAME_MAX = 80;
export const CITY_MAX = 80;
export const BIO_MAX = 500;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
} as const;
