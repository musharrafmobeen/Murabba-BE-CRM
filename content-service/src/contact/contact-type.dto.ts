import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateContactTypeDto {
  @IsString()
  code: string;

  @IsString()
  labelEn: string;

  @IsString()
  labelAr: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateContactTypeDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  labelEn?: string;

  @IsOptional()
  @IsString()
  labelAr?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
