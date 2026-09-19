import {
  generateOtp,
  hashOtp,
  isValidPhone,
  isValidUsername,
  normalizePhone,
  otpMatches,
} from './utils.js';

describe('utils', () => {
  it('normalizes phone spaces', () => {
    expect(normalizePhone('+966 512 34567')).toBe('+96651234567');
  });

  it('validates E.164 phones and usernames', () => {
    expect(isValidPhone('+96651234567')).toBe(true);
    expect(isValidPhone('051234567')).toBe(false);
    expect(isValidUsername('Murabaa-1837')).toBe(true);
    expect(isValidUsername('Mu')).toBe(false);
    expect(isValidUsername('bad name')).toBe(false);
  });

  it('generates and verifies hashed OTPs', () => {
    const code = generateOtp();
    expect(code).toMatch(/^\d{6}$/);
    const hash = hashOtp(code, 'secret');
    expect(otpMatches(code, hash, 'secret')).toBe(true);
    expect(otpMatches('000000', hash, 'secret')).toBe(false);
  });
});
