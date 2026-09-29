import { IsBoolean, IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';
import { PHONE_PATTERN } from '../common/constants.js';

export class PhoneDto {
  @IsString()
  @Matches(PHONE_PATTERN, { message: 'phone must be in E.164 format' })
  phone: string;
}

export class SignupDto extends PhoneDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsBoolean()
  acceptedTerms: boolean;
}

export class LoginDto extends PhoneDto {}

export class SessionDto {
  @IsUUID()
  sessionId: string;
}

export class VerifyOtpDto extends SessionDto {
  @IsString()
  @Matches(/^\d{6}$/, { message: 'code must be 6 digits' })
  code: string;
}
