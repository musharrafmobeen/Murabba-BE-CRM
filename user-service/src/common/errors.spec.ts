import { HttpStatus } from '@nestjs/common';
import errorMessages from './error-messages.json' with { type: 'json' };
import { AppError, ErrorCode, getErrorMessage } from './errors.js';

describe('error messages', () => {
  it('defines English and Arabic copy for every error code', () => {
    for (const code of Object.values(ErrorCode)) {
      expect(errorMessages[code].en.length).toBeGreaterThan(0);
      expect(errorMessages[code].ar.length).toBeGreaterThan(0);
    }
  });

  it('returns both languages on AppError', () => {
    const error = new AppError(ErrorCode.OTP_INVALID, HttpStatus.BAD_REQUEST, {
      attemptsRemaining: 2,
    });

    expect(error.getResponse()).toEqual({
      error: ErrorCode.OTP_INVALID,
      message: {
        en: 'Incorrect code. Please check the digits and try again.',
        ar: 'رمز التحقق غير صحيح. يرجى مراجعة الأرقام والمحاولة مرة أخرى.',
      },
      attemptsRemaining: 2,
    });
    expect(getErrorMessage(ErrorCode.OTP_LOCKED).ar).toContain('5');
  });
});
