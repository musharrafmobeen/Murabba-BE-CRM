import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import {
  OTP_LOCKOUT_MS,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_RESENDS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_TTL_MS,
} from '../common/constants.js';
import { AppError, ErrorCode } from '../common/errors.js';
import {
  addMs,
  generateOtp,
  hashOtp,
  isValidPhone,
  normalizePhone,
  otpMatches,
} from '../common/utils.js';
import { RecoveryOtpSession } from './recovery-otp-session.entity.js';
import { OTP_SENDER, type OtpSender } from './otp.sender.js';

@Injectable()
export class RecoveryOtpService {
  constructor(
    @InjectRepository(RecoveryOtpSession)
    private readonly sessions: Repository<RecoveryOtpSession>,
    private readonly config: ConfigService,
    @Inject(OTP_SENDER) private readonly sender: OtpSender,
  ) {}

  async start(phoneRaw: string) {
    const phone = this.requirePhone(phoneRaw);
    await this.assertPhoneNotLocked(phone);
    const session = this.sessions.create({
      phone,
      codeHash: '',
      expiresAt: new Date(),
      attemptCount: 0,
      resendCount: 0,
      lastSentAt: new Date(),
      lockedUntil: null,
      verifiedAt: null,
      consumedAt: null,
    });
    return this.issueCode(session);
  }

  async resend(sessionId: string) {
    const session = await this.requireSession(sessionId);
    this.assertActive(session);
    this.clearExpiredLock(session);
    this.assertNotLocked(session);

    const cooldownUntil = addMs(OTP_RESEND_COOLDOWN_MS, session.lastSentAt);
    if (cooldownUntil > new Date()) {
      throw new AppError(
        ErrorCode.OTP_RESEND_COOLDOWN,
        HttpStatus.TOO_MANY_REQUESTS,
        { resendAvailableAt: cooldownUntil.toISOString() },
      );
    }

    if (session.resendCount >= OTP_MAX_RESENDS) {
      throw new AppError(ErrorCode.OTP_RESEND_LIMIT, HttpStatus.TOO_MANY_REQUESTS);
    }

    session.resendCount += 1;
    session.verifiedAt = null;
    return this.issueCode(session);
  }

  async verify(sessionId: string, code: string) {
    const session = await this.requireSession(sessionId);
    this.assertActive(session);
    this.clearExpiredLock(session);
    this.assertNotLocked(session);

    if (session.expiresAt <= new Date()) {
      throw new AppError(ErrorCode.OTP_EXPIRED, HttpStatus.BAD_REQUEST);
    }

    if (!otpMatches(code, session.codeHash, this.otpSecret())) {
      session.attemptCount += 1;
      if (session.attemptCount >= OTP_MAX_ATTEMPTS) {
        session.lockedUntil = addMs(OTP_LOCKOUT_MS);
      }
      await this.sessions.save(session);

      if (session.lockedUntil) {
        this.throwLocked(session.lockedUntil);
      }

      throw new AppError(ErrorCode.OTP_INVALID, HttpStatus.BAD_REQUEST, {
        attemptsRemaining: OTP_MAX_ATTEMPTS - session.attemptCount,
      });
    }

    session.verifiedAt = new Date();
    await this.sessions.save(session);
    return {
      sessionId: session.id,
      verified: true,
      phone: session.phone,
    };
  }

  async consumeVerified(sessionId: string, phone: string) {
    if (!sessionId) {
      throw new AppError(ErrorCode.RECOVERY_OTP_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const session = await this.requireSession(sessionId);
    this.assertActive(session);

    if (session.phone !== phone) {
      throw new AppError(ErrorCode.RECOVERY_OTP_NOT_VERIFIED, HttpStatus.BAD_REQUEST);
    }
    if (!session.verifiedAt) {
      throw new AppError(ErrorCode.RECOVERY_OTP_NOT_VERIFIED, HttpStatus.BAD_REQUEST);
    }

    session.consumedAt = new Date();
    await this.sessions.save(session);
    return session;
  }

  private async issueCode(session: RecoveryOtpSession) {
    const code = generateOtp();
    session.codeHash = hashOtp(code, this.otpSecret());
    session.expiresAt = addMs(OTP_TTL_MS);
    session.lastSentAt = new Date();
    session.verifiedAt = null;
    await this.sessions.save(session);
    await this.sender.send(session.phone, code);

    return {
      sessionId: session.id,
      expiresAt: session.expiresAt.toISOString(),
      resendAvailableAt: addMs(
        OTP_RESEND_COOLDOWN_MS,
        session.lastSentAt,
      ).toISOString(),
      attemptsRemaining: OTP_MAX_ATTEMPTS - session.attemptCount,
    };
  }

  private requirePhone(phoneRaw: string) {
    const phone = normalizePhone(phoneRaw ?? '');
    if (!phone) {
      throw new AppError(ErrorCode.CONTACT_PHONE_REQUIRED, HttpStatus.BAD_REQUEST);
    }
    if (!isValidPhone(phone)) {
      throw new AppError(ErrorCode.PHONE_INVALID, HttpStatus.BAD_REQUEST);
    }
    return phone;
  }

  private async requireSession(id: string) {
    const session = await this.sessions.findOne({ where: { id } });
    if (!session) {
      throw new AppError(ErrorCode.SESSION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return session;
  }

  private assertActive(session: RecoveryOtpSession) {
    if (session.consumedAt) {
      throw new AppError(ErrorCode.SESSION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }

  private async assertPhoneNotLocked(phone: string) {
    const locked = await this.sessions.findOne({
      where: {
        phone,
        lockedUntil: MoreThan(new Date()),
      },
      order: { createdAt: 'DESC' },
    });
    if (locked?.lockedUntil) {
      this.throwLocked(locked.lockedUntil);
    }
  }

  private clearExpiredLock(session: RecoveryOtpSession) {
    if (session.lockedUntil && session.lockedUntil <= new Date()) {
      session.lockedUntil = null;
      session.attemptCount = 0;
    }
  }

  private assertNotLocked(session: RecoveryOtpSession) {
    if (session.lockedUntil && session.lockedUntil > new Date()) {
      this.throwLocked(session.lockedUntil);
    }
  }

  private throwLocked(lockedUntil: Date): never {
    throw new AppError(ErrorCode.OTP_LOCKED, HttpStatus.TOO_MANY_REQUESTS, {
      lockedUntil: lockedUntil.toISOString(),
    });
  }

  private otpSecret(): string {
    return (
      this.config.get<string>('OTP_SECRET')?.trim() ||
      this.config.get<string>('ADMIN_API_KEY')?.trim() ||
      'metr-content-otp-dev-secret'
    );
  }
}
