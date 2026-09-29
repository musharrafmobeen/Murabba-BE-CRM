import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsString()
  title: string;

  @IsString()
  type: string;

  @IsString()
  message: string;

  @IsBoolean()
  acceptedPrivacy: boolean;
}
