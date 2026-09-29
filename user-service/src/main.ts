import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const logger = new Logger('UserService');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const uploadDir =
    config.get<string>('UPLOAD_DIR') || join(process.cwd(), 'uploads');
  mkdirSync(join(uploadDir, 'profiles'), { recursive: true });
  app.useStaticAssets(uploadDir, { prefix: '/uploads/' });

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const httpPort = config.getOrThrow<number>('HTTP_PORT');
  await app.listen(httpPort);
  logger.log(`User service listening on port ${httpPort}`);
}

await bootstrap();
