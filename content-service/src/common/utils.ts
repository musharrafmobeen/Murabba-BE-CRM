import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { OTP_LENGTH, PHONE_PATTERN } from './constants.js';

export function normalizePhone(phone: string): string {
  return phone.replace(/\s+/g, '');
}

export function toJawalyNumber(phone: string): string {
  return normalizePhone(phone).replace(/^\+/, '');
}

export function isValidPhone(phone: string): boolean {
  return PHONE_PATTERN.test(phone);
}

export function generateOtp(): string {
  return randomInt(0, 10 ** OTP_LENGTH)
    .toString()
    .padStart(OTP_LENGTH, '0');
}

export function hashOtp(code: string, secret: string): string {
  return createHmac('sha256', secret).update(code).digest('hex');
}

export function otpMatches(
  code: string,
  codeHash: string,
  secret: string,
): boolean {
  const actual = Buffer.from(hashOtp(code, secret));
  const expected = Buffer.from(codeHash);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function addMs(ms: number, from = new Date()): Date {
  return new Date(from.getTime() + ms);
}
