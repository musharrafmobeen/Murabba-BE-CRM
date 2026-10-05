import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsInt()
  @Min(1)
  @Max(65535)
  HTTP_PORT: number;

  @IsString()
  DB_HOST: string;

  @IsInt()
  DB_PORT: number;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsOptional()
  @IsString()
  DB_SSL?: string;

  @IsOptional()
  @IsString()
  ADMIN_API_KEY?: string;

  @IsOptional()
  @IsString()
  APP_VERSION?: string;

  @IsOptional()
  @IsString()
  APP_BUILD?: string;

  @IsOptional()
  @IsString()
  APP_CHANNEL?: string;

  @IsOptional()
  @IsString()
  OTP_SECRET?: string;

  @IsOptional()
  @IsString()
  JAWALY_API_KEY?: string;

  @IsOptional()
  @IsString()
  JAWALY_API_SECRET?: string;

  @IsOptional()
  @IsString()
  JAWALY_SENDER?: string;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    {
      NODE_ENV: config.NODE_ENV ?? Environment.Development,
      HTTP_PORT: config.HTTP_PORT ?? 3001,
      DB_HOST: config.DB_HOST ?? 'localhost',
      DB_PORT: config.DB_PORT ?? 5432,
      DB_USER: config.DB_USER ?? 'postgres',
      DB_PASSWORD: config.DB_PASSWORD ?? '1234',
      DB_NAME: config.DB_NAME ?? 'metr',
      DB_SSL: config.DB_SSL ?? 'false',
      ADMIN_API_KEY: config.ADMIN_API_KEY ?? '',
      APP_VERSION: config.APP_VERSION ?? '',
      APP_BUILD: config.APP_BUILD ?? '',
      APP_CHANNEL: config.APP_CHANNEL ?? 'production',
      OTP_SECRET: config.OTP_SECRET ?? '',
      JAWALY_API_KEY: config.JAWALY_API_KEY ?? '',
      JAWALY_API_SECRET: config.JAWALY_API_SECRET ?? '',
      JAWALY_SENDER: config.JAWALY_SENDER ?? '',
    },
    { enableImplicitConversion: true },
  );

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
}
