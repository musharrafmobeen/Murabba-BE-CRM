import { HttpStatus } from '@nestjs/common';
import { RecoveryOtpService } from './recovery-otp.service.js';
import { ErrorCode } from '../common/errors.js';
import { addMs, hashOtp } from '../common/utils.js';

describe('RecoveryOtpService flows', () => {
  const secret = 'test-otp-secret';
  const sender = { send: vi.fn(async () => undefined) };
  const config = {
    get: vi.fn((key: string) => (key === 'OTP_SECRET' ? secret : '')),
  };

  const sessions = {
    create: vi.fn((data) => ({ ...data })),
    save: vi.fn(async (row) => {
      row.id ??= 'session-1';
      return row;
    }),
    findOne: vi.fn(),
  };

  const service = new RecoveryOtpService(
    sessions as never,
    config as never,
    sender as never,
  );

  beforeEach(() => {
    vi.clearAllMocks();
    sessions.findOne.mockResolvedValue(null);
  });

  it('starts a recovery OTP session', async () => {
    const result = await service.start('+96651234567');
    expect(result.sessionId).toBe('session-1');
    expect(result.attemptsRemaining).toBe(3);
    expect(sender.send).toHaveBeenCalledWith(
      '+96651234567',
      expect.stringMatching(/^\d{6}$/),
    );
  });

  it('verifies a correct code', async () => {
    const code = '123456';
    sessions.findOne.mockResolvedValue({
      id: 'session-1',
      phone: '+96651234567',
      codeHash: hashOtp(code, secret),
      expiresAt: addMs(60_000),
      attemptCount: 0,
      resendCount: 0,
      lastSentAt: new Date(),
      lockedUntil: null,
      verifiedAt: null,
      consumedAt: null,
    });

    await expect(service.verify('session-1', code)).resolves.toEqual({
      sessionId: 'session-1',
      verified: true,
      phone: '+96651234567',
    });
  });

  it('rejects an incorrect code with attemptsRemaining', async () => {
    sessions.findOne.mockResolvedValue({
      id: 'session-1',
      phone: '+96651234567',
      codeHash: hashOtp('123456', secret),
      expiresAt: addMs(60_000),
      attemptCount: 0,
      resendCount: 0,
      lastSentAt: new Date(),
      lockedUntil: null,
      verifiedAt: null,
      consumedAt: null,
    });

    await expect(service.verify('session-1', '000000')).rejects.toMatchObject({
      status: HttpStatus.BAD_REQUEST,
      response: {
        error: ErrorCode.OTP_INVALID,
        attemptsRemaining: 2,
      },
    });
  });

  it('locks after 3 failed attempts', async () => {
    sessions.findOne.mockResolvedValue({
      id: 'session-1',
      phone: '+96651234567',
      codeHash: hashOtp('123456', secret),
      expiresAt: addMs(60_000),
      attemptCount: 2,
      resendCount: 0,
      lastSentAt: new Date(),
      lockedUntil: null,
      verifiedAt: null,
      consumedAt: null,
    });

    await expect(service.verify('session-1', '000000')).rejects.toMatchObject({
      status: HttpStatus.TOO_MANY_REQUESTS,
      response: { error: ErrorCode.OTP_LOCKED },
    });
  });

  it('requires verified session before consume', async () => {
    sessions.findOne.mockResolvedValue({
      id: 'session-1',
      phone: '+96651234567',
      verifiedAt: null,
      consumedAt: null,
    });

    await expect(
      service.consumeVerified('session-1', '+96651234567'),
    ).rejects.toMatchObject({
      response: { error: ErrorCode.RECOVERY_OTP_NOT_VERIFIED },
    });
  });
});
