import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, QueryFailedError, Repository } from 'typeorm';
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
  isValidUsername,
  normalizePhone,
  otpMatches,
} from '../common/utils.js';
import { User } from '../users/user.entity.js';
import type { PhotoFile, UpdateProfileDto } from '../users/profile.dto.js';
import { UsersService } from '../users/users.service.js';
import { FollowsService } from '../follows/follows.service.js';
import { LoginDto, SignupDto } from './auth.dto.js';
import { OtpSession } from './otp-session.entity.js';
import { OTP_SENDER, type OtpSender } from './otp.sender.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OtpSession)
    private readonly sessions: Repository<OtpSession>,
    private readonly users: UsersService,
    private readonly follows: FollowsService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(OTP_SENDER) private readonly sender: OtpSender,
  ) {}

  async signup(dto: SignupDto) {
    if (!dto.acceptedTerms) {
      throw new AppError(ErrorCode.TERMS_REQUIRED, HttpStatus.BAD_REQUEST);
    }

    const phone = normalizePhone(dto.phone);
    if (await this.users.findByPhone(phone)) {
      throw new AppError(
        ErrorCode.PHONE_ALREADY_REGISTERED,
        HttpStatus.CONFLICT,
      );
    }

    await this.assertPhoneNotLocked(phone);
    const username = await this.resolveUsername(dto.username);
    return this.startSession('signup', phone, username);
  }

  async login(dto: LoginDto) {
    const phone = normalizePhone(dto.phone);
    const user = await this.users.findByPhone(phone);
    if (!user) {
      throw new AppError(ErrorCode.PHONE_NOT_REGISTERED, HttpStatus.NOT_FOUND);
    }

    await this.assertPhoneNotLocked(phone);
    return this.startSession('login', phone);
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

    session.consumedAt = new Date();
    await this.sessions.save(session);

    const user =
      session.purpose === 'signup'
        ? await this.createUser(session)
        : await this.completeLogin(session.phone);

    return this.authResponse(user);
  }

  async me(user: User) {
    const stats = await this.follows.stats(user);
    return { ...this.users.toPublic(user), ...stats };
  }

  async updateProfile(user: User, dto: UpdateProfileDto) {
    const saved = await this.users.updateProfile(user, dto);
    return this.users.toPublic(saved);
  }

  async uploadPhoto(user: User, file?: PhotoFile) {
    const saved = await this.users.savePhoto(user, file);
    return this.users.toPublic(saved);
  }

  async logout(user: User) {
    await this.users.bumpTokenVersion(user);
    return { ok: true };
  }

  async deleteAccount(user: User) {
    await this.sessions.delete({ phone: user.phone });
    await this.users.remove(user);
    return { ok: true };
  }

  private async startSession(
    purpose: OtpSession['purpose'],
    phone: string,
    username?: string,
  ) {
    const session = this.sessions.create({
      purpose,
      phone,
      username: username ?? null,
      attemptCount: 0,
      resendCount: 0,
      lockedUntil: null,
      consumedAt: null,
    });
    return this.issueCode(session);
  }

  private async issueCode(session: OtpSession) {
    const code = generateOtp();
    session.codeHash = hashOtp(code, this.otpSecret());
    session.expiresAt = addMs(OTP_TTL_MS);
    session.lastSentAt = new Date();
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

  private async resolveUsername(username: string): Promise<string> {
    const value = username.trim();
    if (!isValidUsername(value)) {
      throw new AppError(ErrorCode.USERNAME_INVALID, HttpStatus.BAD_REQUEST);
    }
    if (await this.users.findByUsername(value)) {
      throw new AppError(ErrorCode.USERNAME_TAKEN, HttpStatus.CONFLICT);
    }
    return value;
  }

  private async requireSession(id: string): Promise<OtpSession> {
    const session = await this.sessions.findOne({ where: { id } });
    if (!session) {
      throw new AppError(ErrorCode.SESSION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
    return session;
  }

  private assertActive(session: OtpSession) {
    if (session.consumedAt) {
      throw new AppError(ErrorCode.SESSION_NOT_FOUND, HttpStatus.NOT_FOUND);
    }
  }

  private async assertPhoneNotLocked(phone: string) {
    const locked = await this.sessions.findOne({
      where: { phone, lockedUntil: MoreThan(new Date()) },
    });
    if (locked?.lockedUntil) {
      this.throwLocked(locked.lockedUntil);
    }
  }

  private clearExpiredLock(session: OtpSession) {
    if (session.lockedUntil && session.lockedUntil <= new Date()) {
      session.lockedUntil = null;
      session.attemptCount = 0;
    }
  }

  private assertNotLocked(session: OtpSession) {
    if (session.lockedUntil && session.lockedUntil > new Date()) {
      this.throwLocked(session.lockedUntil);
    }
  }

  private throwLocked(lockedUntil: Date): never {
    throw new AppError(ErrorCode.OTP_LOCKED, HttpStatus.TOO_MANY_REQUESTS, {
      lockedUntil: lockedUntil.toISOString(),
    });
  }

  private async createUser(session: OtpSession): Promise<User> {
    try {
      return await this.users.create(session.username as string, session.phone);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        throw new AppError(
          ErrorCode.PHONE_ALREADY_REGISTERED,
          HttpStatus.CONFLICT,
        );
      }
      throw error;
    }
  }

  private async completeLogin(phone: string): Promise<User> {
    const user = await this.users.findByPhone(phone);
    if (!user) {
      throw new AppError(ErrorCode.PHONE_NOT_REGISTERED, HttpStatus.NOT_FOUND);
    }
    return this.users.markLogin(user);
  }

  private async authResponse(user: User) {
    const accessToken = await this.jwt.signAsync({
      sub: user.id,
      tokenVersion: user.tokenVersion,
    });
    return {
      accessToken,
      user: this.users.toPublic(user),
    };
  }

  private otpSecret(): string {
    return this.config.getOrThrow<string>('JWT_SECRET');
  }
}
