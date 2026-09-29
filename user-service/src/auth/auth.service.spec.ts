import { HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { OtpSession } from './otp-session.entity.js';
import { OTP_SENDER } from './otp.sender.js';
import { UsersService } from '../users/users.service.js';
import { FollowsService } from '../follows/follows.service.js';
import { AppError, ErrorCode } from '../common/errors.js';
import { addMs, hashOtp } from '../common/utils.js';
import { OTP_MAX_ATTEMPTS } from '../common/constants.js';

const SECRET = 'test-secret';
const PHONE = '+96651234567';

function session(overrides: Partial<OtpSession> = {}): OtpSession {
  return {
    id: 'session-1',
    purpose: 'login',
    phone: PHONE,
    username: null,
    codeHash: hashOtp('123456', SECRET),
    expiresAt: addMs(60_000),
    attemptCount: 0,
    resendCount: 0,
    lastSentAt: new Date(),
    lockedUntil: null,
    consumedAt: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('AuthService', () => {
  const sessions = {
    create: vi.fn((data: Partial<OtpSession>) => ({ ...data })),
    save: vi.fn(async (row: OtpSession) => {
      row.id ??= 'session-1';
      return row;
    }),
    findOne: vi.fn(),
    delete: vi.fn(),
  };
  const users = {
    findByPhone: vi.fn(),
    findByUsername: vi.fn(),
    create: vi.fn(),
    markLogin: vi.fn(),
    bumpTokenVersion: vi.fn(),
    remove: vi.fn(),
    toPublic: vi.fn((user) => ({
      id: user.id,
      username: user.username,
      phone: user.phone,
      displayName: user.displayName ?? null,
      city: user.city ?? null,
      bio: user.bio ?? null,
      photoUrl: user.photoPath ? `/uploads/${user.photoPath}` : null,
      isAdvertiser: Boolean(user.isAdvertiser),
    })),
  };
  const follows = {
    stats: vi.fn(async (user: { isAdvertiser?: boolean }) => ({
      followersCount: 0,
      followingCount: 0,
      showFollowers: Boolean(user.isAdvertiser),
      canBeFollowed: Boolean(user.isAdvertiser),
    })),
  };
  const jwt = { signAsync: vi.fn(async () => 'token') };
  const sender = { send: vi.fn() };

  let service: AuthService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(OtpSession), useValue: sessions },
        { provide: UsersService, useValue: users },
        { provide: FollowsService, useValue: follows },
        { provide: JwtService, useValue: jwt },
        {
          provide: ConfigService,
          useValue: { getOrThrow: () => SECRET },
        },
        { provide: OTP_SENDER, useValue: sender },
      ],
    }).compile();
    service = module.get(AuthService);
  });

  it('starts signup and sends an OTP', async () => {
    users.findByPhone.mockResolvedValue(null);
    users.findByUsername.mockResolvedValue(null);

    const result = await service.signup({
      phone: PHONE,
      username: 'Murabaa-1837',
      acceptedTerms: true,
    });

    expect(sender.send).toHaveBeenCalledWith(PHONE, expect.stringMatching(/^\d{6}$/));
    expect(result.sessionId).toBe('session-1');
    expect(result.attemptsRemaining).toBe(OTP_MAX_ATTEMPTS);
  });

  it('rejects signup when phone is already registered', async () => {
    users.findByPhone.mockResolvedValue({ id: 'u1' });

    await expect(
      service.signup({
        phone: PHONE,
        username: 'Murabaa-1837',
        acceptedTerms: true,
      }),
    ).rejects.toMatchObject({
      status: HttpStatus.CONFLICT,
      response: { error: ErrorCode.PHONE_ALREADY_REGISTERED },
    });
  });

  it('rejects signup when username is missing or invalid', async () => {
    users.findByPhone.mockResolvedValue(null);

    await expect(
      service.signup({ phone: PHONE, username: '  ', acceptedTerms: true }),
    ).rejects.toMatchObject({
      response: { error: ErrorCode.USERNAME_INVALID },
    });
  });

  it('rejects signup when terms are not accepted', async () => {
    await expect(
      service.signup({
        phone: PHONE,
        username: 'Murabaa-1837',
        acceptedTerms: false,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('rejects login for an unknown phone', async () => {
    users.findByPhone.mockResolvedValue(null);

    await expect(service.login({ phone: PHONE })).rejects.toMatchObject({
      response: { error: ErrorCode.PHONE_NOT_REGISTERED },
    });
  });

  it('logs in an existing user by sending OTP', async () => {
    users.findByPhone.mockResolvedValue({ id: 'u1', phone: PHONE });

    const result = await service.login({ phone: PHONE });
    expect(result.sessionId).toBe('session-1');
    expect(sender.send).toHaveBeenCalled();
  });

  it('verifies a login OTP and returns a token', async () => {
    const row = session();
    sessions.findOne.mockResolvedValue(row);
    users.findByPhone.mockResolvedValue({
      id: 'u1',
      username: 'Murabaa-1837',
      phone: PHONE,
      tokenVersion: 0,
    });
    users.markLogin.mockImplementation(async (user) => user);

    const result = await service.verify('session-1', '123456');
    expect(result.accessToken).toBe('token');
    expect(row.consumedAt).toBeInstanceOf(Date);
  });

  it('creates a user after signup OTP verification', async () => {
    sessions.findOne.mockResolvedValue(
      session({ purpose: 'signup', username: 'Murabaa-1837' }),
    );
    users.create.mockResolvedValue({
      id: 'u1',
      username: 'Murabaa-1837',
      phone: PHONE,
      tokenVersion: 0,
    });

    const result = await service.verify('session-1', '123456');
    expect(users.create).toHaveBeenCalledWith('Murabaa-1837', PHONE);
    expect(result.user.username).toBe('Murabaa-1837');
  });

  it('rejects an incorrect code and tracks remaining attempts', async () => {
    const row = session();
    sessions.findOne.mockResolvedValue(row);

    await expect(service.verify('session-1', '000000')).rejects.toMatchObject({
      response: {
        error: ErrorCode.OTP_INVALID,
        attemptsRemaining: 2,
      },
    });
    expect(row.attemptCount).toBe(1);
  });

  it('locks the session after 3 failed attempts', async () => {
    const row = session({ attemptCount: 2 });
    sessions.findOne.mockResolvedValue(row);

    await expect(service.verify('session-1', '000000')).rejects.toMatchObject({
      response: { error: ErrorCode.OTP_LOCKED },
    });
    expect(row.lockedUntil).toBeInstanceOf(Date);
    const remainingMs = row.lockedUntil!.getTime() - Date.now();
    expect(remainingMs).toBeGreaterThan(4.5 * 60 * 1000);
    expect(remainingMs).toBeLessThanOrEqual(5 * 60 * 1000);
  });

  it('rejects an expired code', async () => {
    sessions.findOne.mockResolvedValue(
      session({ expiresAt: addMs(-1000) }),
    );

    await expect(service.verify('session-1', '123456')).rejects.toMatchObject({
      response: { error: ErrorCode.OTP_EXPIRED },
    });
  });

  it('blocks resend during cooldown', async () => {
    sessions.findOne.mockResolvedValue(session({ lastSentAt: new Date() }));

    await expect(service.resend('session-1')).rejects.toMatchObject({
      response: { error: ErrorCode.OTP_RESEND_COOLDOWN },
    });
  });

  it('blocks resend after the limit', async () => {
    sessions.findOne.mockResolvedValue(
      session({
        resendCount: 3,
        lastSentAt: addMs(-31_000),
      }),
    );

    await expect(service.resend('session-1')).rejects.toMatchObject({
      response: { error: ErrorCode.OTP_RESEND_LIMIT },
    });
  });

  it('invalidates the token version on logout', async () => {
    const user = { id: 'u1', tokenVersion: 0 };
    await expect(service.logout(user as never)).resolves.toEqual({ ok: true });
    expect(users.bumpTokenVersion).toHaveBeenCalledWith(user);
  });

  it('blocks a new login while the phone is locked', async () => {
    users.findByPhone.mockResolvedValue({ id: 'u1', phone: PHONE });
    sessions.findOne.mockResolvedValue(
      session({ lockedUntil: addMs(60_000) }),
    );

    await expect(service.login({ phone: PHONE })).rejects.toMatchObject({
      response: { error: ErrorCode.OTP_LOCKED },
    });
  });

  it('resets attempts after the lockout expires', async () => {
    const row = session({
      attemptCount: 3,
      resendCount: 0,
      lastSentAt: addMs(-31_000),
      lockedUntil: addMs(-1000),
    });
    sessions.findOne.mockResolvedValue(row);

    await service.resend('session-1');
    expect(row.attemptCount).toBe(0);
    expect(row.lockedUntil).toBeNull();
  });

  it('returns the public user on me', async () => {
    const user = {
      id: 'u1',
      username: 'Murabaa-1837',
      phone: PHONE,
      isAdvertiser: false,
    };
    await expect(service.me(user as never)).resolves.toEqual({
      id: 'u1',
      username: 'Murabaa-1837',
      phone: PHONE,
      displayName: null,
      city: null,
      bio: null,
      photoUrl: null,
      isAdvertiser: false,
      followersCount: 0,
      followingCount: 0,
      showFollowers: false,
      canBeFollowed: false,
    });
  });

  it('deletes the user account', async () => {
    const user = { id: 'u1', phone: PHONE };
    await expect(service.deleteAccount(user as never)).resolves.toEqual({
      ok: true,
    });
    expect(sessions.delete).toHaveBeenCalledWith({ phone: PHONE });
    expect(users.remove).toHaveBeenCalledWith(user);
  });
});
