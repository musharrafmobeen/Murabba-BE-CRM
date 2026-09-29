import { Type } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';

export class VersionLocaleDto {
  @IsString()
  menuLabel: string;

  @IsString()
  title: string;

  @IsString()
  fallback: string;
}

export class CreateVersionDto {
  @IsString()
  version: string;

  @IsString()
  build: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @ValidateNested()
  @Type(() => VersionLocaleDto)
  en: VersionLocaleDto;

  @ValidateNested()
  @Type(() => VersionLocaleDto)
  ar: VersionLocaleDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateVersionDto {
  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  build?: string;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VersionLocaleDto)
  en?: VersionLocaleDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => VersionLocaleDto)
  ar?: VersionLocaleDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
