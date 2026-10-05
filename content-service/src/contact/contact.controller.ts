import { Body, Controller, Get, Post } from '@nestjs/common';
import { ContactService } from './contact.service.js';
import {
  CreateContactDto,
  RecoveryPhoneDto,
  RecoverySessionDto,
  VerifyRecoveryOtpDto,
} from './contact.dto.js';
import { RecoveryOtpService } from './recovery-otp.service.js';

@Controller('contact')
export class ContactController {
  constructor(
    private readonly contact: ContactService,
    private readonly recoveryOtp: RecoveryOtpService,
  ) {}

  @Get('types')
  types() {
    return this.contact.types();
  }

  @Post('recovery/otp/start')
  startRecoveryOtp(@Body() dto: RecoveryPhoneDto) {
    return this.recoveryOtp.start(dto.phone);
  }

  @Post('recovery/otp/verify')
  verifyRecoveryOtp(@Body() dto: VerifyRecoveryOtpDto) {
    return this.recoveryOtp.verify(dto.sessionId, dto.code);
  }

  @Post('recovery/otp/resend')
  resendRecoveryOtp(@Body() dto: RecoverySessionDto) {
    return this.recoveryOtp.resend(dto.sessionId);
  }

  @Post()
  create(@Body() dto: CreateContactDto) {
    return this.contact.create(dto);
  }
}
