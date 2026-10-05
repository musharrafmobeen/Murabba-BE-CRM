export const PHONE_PATTERN = /^\+[1-9]\d{7,14}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const TITLE_MIN = 3;
export const TITLE_MAX = 120;
export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 256;
export const CONTACT_RATE_LIMIT = 3;
export const CONTACT_RATE_WINDOW_MS = 15 * 60 * 1000;

export const ACCOUNT_RECOVERY_TYPE = 'ACCOUNT_RECOVERY';
export const ACCOUNT_RECOVERY_TITLE = 'Account Recovery';

export const OTP_LENGTH = 6;
export const OTP_TTL_MS = 2 * 60 * 1000;
export const OTP_MAX_ATTEMPTS = 3;
export const OTP_LOCKOUT_MS = 5 * 60 * 1000;
export const OTP_RESEND_COOLDOWN_MS = 30 * 1000;
export const OTP_MAX_RESENDS = 3;
