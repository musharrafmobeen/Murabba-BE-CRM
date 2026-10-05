import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminContactTypeController } from './admin-contact-type.controller.js';
import { ContactController } from './contact.controller.js';
import { ContactService } from './contact.service.js';
import { ContactSubmission } from './contact-submission.entity.js';
import { ContactType } from './contact-type.entity.js';
import { createOtpSender, OTP_SENDER } from './otp.sender.js';
import { RecoveryOtpSession } from './recovery-otp-session.entity.js';
import { RecoveryOtpService } from './recovery-otp.service.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ContactSubmission,
      ContactType,
      RecoveryOtpSession,
    ]),
  ],
  controllers: [ContactController, AdminContactTypeController],
  providers: [
    ContactService,
    RecoveryOtpService,
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
})
export class ContactModule {}
