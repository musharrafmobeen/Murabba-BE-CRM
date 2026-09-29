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

  @IsString()
  JWT_SECRET: string;

  @IsInt()
  @IsOptional()
  JWT_EXPIRES_IN_SECONDS?: number;

  @IsString()
  @IsOptional()
  JAWALY_API_KEY?: string;

  @IsString()
  @IsOptional()
  JAWALY_API_SECRET?: string;

  @IsString()
  @IsOptional()
  JAWALY_SENDER?: string;

  @IsString()
  @IsOptional()
  UPLOAD_DIR?: string;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    {
      NODE_ENV: config.NODE_ENV ?? Environment.Development,
      HTTP_PORT: config.HTTP_PORT ?? 3000,
      DB_HOST: config.DB_HOST ?? 'localhost',
      DB_PORT: config.DB_PORT ?? 5432,
      DB_USER: config.DB_USER ?? 'postgres',
      DB_PASSWORD: config.DB_PASSWORD ?? '1234',
      DB_NAME: config.DB_NAME ?? 'metr',
      DB_SSL: config.DB_SSL ?? 'false',
      JWT_SECRET: config.JWT_SECRET ?? 'metr-dev-jwt-secret',
      JWT_EXPIRES_IN_SECONDS: config.JWT_EXPIRES_IN_SECONDS ?? 60 * 60 * 24 * 7,
      JAWALY_API_KEY: config.JAWALY_API_KEY,
      JAWALY_API_SECRET: config.JAWALY_API_SECRET,
      JAWALY_SENDER: config.JAWALY_SENDER,
      UPLOAD_DIR: config.UPLOAD_DIR,
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
