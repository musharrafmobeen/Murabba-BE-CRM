import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class HelpChromeDto {
  @IsString()
  menuLabel: string;

  @IsString()
  title: string;

  @IsString()
  intro: string;

  @IsString()
  emptyFallback: string;

  @IsString()
  contactCta: string;
}

export class CreateHelpPageDto {
  @ValidateNested()
  @Type(() => HelpChromeDto)
  en: HelpChromeDto;

  @ValidateNested()
  @Type(() => HelpChromeDto)
  ar: HelpChromeDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateHelpPageDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => HelpChromeDto)
  en?: HelpChromeDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => HelpChromeDto)
  ar?: HelpChromeDto;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateHelpCategoryDto {
  @IsString()
  slug: string;

  @IsString()
  nameEn: string;

  @IsString()
  nameAr: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateHelpCategoryDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsString()
  nameAr?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class CreateHelpItemDto {
  @IsUUID()
  categoryId: string;

  @IsString()
  slug: string;

  @IsString()
  questionEn: string;

  @IsString()
  answerEn: string;

  @IsString()
  questionAr: string;

  @IsString()
  answerAr: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateHelpItemDto {
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  questionEn?: string;

  @IsOptional()
  @IsString()
  answerEn?: string;

  @IsOptional()
  @IsString()
  questionAr?: string;

  @IsOptional()
  @IsString()
  answerAr?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
