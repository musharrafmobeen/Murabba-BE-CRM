import { Module, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowsModule } from '../follows/follows.module.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { JwtAuthGuard } from './jwt-auth.guard.js';
import { OtpSession } from './otp-session.entity.js';
import { createOtpSender, OTP_SENDER } from './otp.sender.js';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    FollowsModule,
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
          apiKey: config.get<string>('JAWALY_API_KEY'),
          apiSecret: config.get<string>('JAWALY_API_SECRET'),
          sender: config.get<string>('JAWALY_SENDER'),
        }),
    },
  ],
  exports: [JwtAuthGuard, JwtModule],
})
export class AuthModule {}
