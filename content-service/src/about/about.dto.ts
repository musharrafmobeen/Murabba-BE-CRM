import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class AboutLocaleDto {
  @IsString()
  menuLabel: string;

  @IsString()
  title: string;

  @IsString()
  purposeTitle: string;

  @IsString()
  purpose: string;

  @IsString()
  featuresTitle: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  features: string[];

  @IsString()
  missionTitle: string;

  @IsString()
  mission: string;
}

export class CreateAboutDto {
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @ValidateNested()
  @Type(() => AboutLocaleDto)
  en: AboutLocaleDto;

  @ValidateNested()
  @Type(() => AboutLocaleDto)
  ar: AboutLocaleDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateAboutDto {
  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  appVersion?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocaleDto)
  en?: AboutLocaleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AboutLocaleDto)
  ar?: AboutLocaleDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
