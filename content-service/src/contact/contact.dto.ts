import { IsBoolean, IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { PHONE_PATTERN } from '../common/constants.js';

export class CreateContactDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  type: string;

  @IsString()
  message: string;

  @IsBoolean()
  acceptedPrivacy: boolean;

  /** Required when type is ACCOUNT_RECOVERY (verified OTP session). */
  @IsOptional()
  @IsUUID()
  sessionId?: string;
}

export class RecoveryPhoneDto {
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'phone must be in E.164 format' })
  phone: string;
}

export class RecoverySessionDto {
  @IsUUID()
  sessionId: string;
}

export class VerifyRecoveryOtpDto extends RecoverySessionDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be 6 digits' })
  code: string;
}
