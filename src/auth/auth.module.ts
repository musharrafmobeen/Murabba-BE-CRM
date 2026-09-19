import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { OtpSession } from './otp-session.entity.js';
import { createOtpSender, OTP_SENDER } from './otp.sender.js';

@Module({
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([OtpSession]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get('JWT_EXPIRES_IN_SECONDS') ?? 60 * 60 * 24 * 7),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAuthGuard,
    {
      provide: OTP_SENDER,
      inject: [ConfigService],
      useFactory: (config: ConfigService) =>
        createOtpSender({
          accountSid: config.get<string>('TWILIO_ACCOUNT_SID'),
          authToken: config.get<string>('TWILIO_AUTH_TOKEN'),
          fromNumber: config.get<string>('TWILIO_FROM_NUMBER'),
        }),
    },
  ],
})
export class AuthModule {}
