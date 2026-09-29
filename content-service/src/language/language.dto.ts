import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class LanguageChromeDto {
  @IsString()
  menuLabel: string;

  @IsString()
  title: string;
}

export class CreateLanguagePageDto {
  @ValidateNested()
  @Type(() => LanguageChromeDto)
  en: LanguageChromeDto;

  @ValidateNested()
  @Type(() => LanguageChromeDto)
  ar: LanguageChromeDto;

  @IsOptional()
  @IsString()
  fallbackCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateLanguagePageDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => LanguageChromeDto)
  en?: LanguageChromeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LanguageChromeDto)
  ar?: LanguageChromeDto;

  @IsOptional()
  @IsString()
  fallbackCode?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateLanguageDto {
  @IsString()
  code: string;

  @IsString()
  nameEn: string;

  @IsString()
  nameAr: string;

  @IsString()
  nativeName: string;

  @IsString()
  flag: string;

  @IsIn(['ltr', 'rtl'])
  direction: 'ltr' | 'rtl';

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class UpdateLanguageDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsString()
  nativeName?: string;

  @IsOptional()
  @IsString()
  flag?: string;

  @IsOptional()
  @IsIn(['ltr', 'rtl'])
  direction?: 'ltr' | 'rtl';

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}
